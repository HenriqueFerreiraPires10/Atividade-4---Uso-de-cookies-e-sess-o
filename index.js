import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 4000;

const app = express();
var listaProdutos = [];

app.use(session({
    secret: 'M1nh4Ch4v3S3cr3t4',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 15
    }
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

function estaAutenticado(requisicao, resposta, proximo) {
    if (requisicao.session?.logado) {
        proximo();
    } else {
        resposta.redirect("/login");
    }
}

function gerarNavbar(nomeUsuario) {
    return `
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">
                <i class="bi bi-house-fill me-1"></i> Menu
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" href="/produto">
                            <i class="bi bi-plus-circle me-1"></i> Cadastrar Produto
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/listaProdutos">
                            <i class="bi bi-table me-1"></i> Listar Produtos
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/logout">
                            <i class="bi bi-box-arrow-right me-1"></i> Logout
                        </a>
                    </li>
                </ul>
                <span class="navbar-text me-3">
                    <i class="bi bi-person-circle me-1"></i> Olá, <strong>${nomeUsuario}</strong>
                </span>
            </div>
        </div>
    </nav>`;
}

function gerarHead(titulo) {
    return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${titulo}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    </head>
    <body>`;
}

const bootstrapScript = `
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
    </body>
    </html>`;

app.get('/', estaAutenticado, (req, res) => {
    const nomeUsuario = req.session.nomeUsuario;
    res.write(gerarHead("Menu do Sistema"));
    res.write(gerarNavbar(nomeUsuario));
    res.write(`
        <div class="container mt-5">
            <h1 class="display-5">
                <i class="bi bi-hand-wave me-2"></i> Bem-vindo, ${nomeUsuario}!
            </h1>
            <p class="lead">Use o menu acima para navegar pelo sistema de cadastro de produtos.</p>
            <hr class="my-4">
            <a class="btn btn-primary btn-lg me-2" href="/produto">
                <i class="bi bi-plus-circle me-1"></i> Cadastrar Produto
            </a>
            <a class="btn btn-secondary btn-lg" href="/listaProdutos">
                <i class="bi bi-table me-1"></i> Ver Produtos
            </a>
        </div>
    `);
    res.write(bootstrapScript);
    res.end();
});

app.get("/produto", estaAutenticado, (req, res) => {
    const nomeUsuario = req.session.nomeUsuario;
    res.write(gerarHead("Cadastro de Produto"));
    res.write(gerarNavbar(nomeUsuario));
    res.write(`
        <div class="container mt-4">
            <h3><i class="bi bi-box-seam me-2"></i>Cadastro de Produto</h3>
            <form method="POST" action="/produto" class="border p-4 rounded mt-3">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="codigoBarras" class="form-label">
                            <i class="bi bi-upc-scan me-1"></i> Código de Barras
                        </label>
                        <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" required>
                    </div>
                    <div class="col-md-6">
                        <label for="descricao" class="form-label">
                            <i class="bi bi-card-text me-1"></i> Descrição do Produto
                        </label>
                        <input type="text" class="form-control" id="descricao" name="descricao" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label for="precoCusto" class="form-label">
                            <i class="bi bi-tag me-1"></i> Preço de Custo (R$)
                        </label>
                        <input type="number" step="0.01" min="0" class="form-control" id="precoCusto" name="precoCusto" required>
                    </div>
                    <div class="col-md-4">
                        <label for="precoVenda" class="form-label">
                            <i class="bi bi-cash-coin me-1"></i> Preço de Venda (R$)
                        </label>
                        <input type="number" step="0.01" min="0" class="form-control" id="precoVenda" name="precoVenda" required>
                    </div>
                    <div class="col-md-4">
                        <label for="qtdEstoque" class="form-label">
                            <i class="bi bi-archive me-1"></i> Qtd em Estoque
                        </label>
                        <input type="number" min="0" class="form-control" id="qtdEstoque" name="qtdEstoque" required>
                    </div>
                </div>
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="dataValidade" class="form-label">
                            <i class="bi bi-calendar-event me-1"></i> Data de Validade
                        </label>
                        <input type="date" class="form-control" id="dataValidade" name="dataValidade" required>
                    </div>
                    <div class="col-md-6">
                        <label for="fabricante" class="form-label">
                            <i class="bi bi-building me-1"></i> Nome do Fabricante
                        </label>
                        <input type="text" class="form-control" id="fabricante" name="fabricante" required>
                    </div>
                </div>
                <button type="submit" class="btn btn-success">
                    <i class="bi bi-check-circle me-1"></i> Cadastrar Produto
                </button>
                <a href="/listaProdutos" class="btn btn-outline-secondary ms-2">
                    <i class="bi bi-table me-1"></i> Ver Lista
                </a>
            </form>
        </div>
    `);
    res.write(bootstrapScript);
    res.end();
});

app.post("/produto", estaAutenticado, (req, res) => {
    const { codigoBarras, descricao, precoCusto, precoVenda, dataValidade, qtdEstoque, fabricante } = req.body;
    const nomeUsuario = req.session.nomeUsuario;

    const campos = { codigoBarras, descricao, precoCusto, precoVenda, dataValidade, qtdEstoque, fabricante };
    const algumVazio = Object.values(campos).some(v => !v);

    if (algumVazio) {
        res.write(gerarHead("Cadastro de Produto"));
        res.write(gerarNavbar(nomeUsuario));
        res.write(`
            <div class="container mt-4">
                <h3><i class="bi bi-box-seam me-2"></i>Cadastro de Produto</h3>
                <div class="alert alert-danger mt-3">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> Por favor, preencha todos os campos obrigatórios.
                </div>
                <form method="POST" action="/produto" class="border p-4 rounded mt-2">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="codigoBarras" class="form-label">
                                <i class="bi bi-upc-scan me-1"></i> Código de Barras
                            </label>
                            <input type="text" class="form-control ${!codigoBarras ? 'is-invalid' : ''}" id="codigoBarras" name="codigoBarras" value="${codigoBarras || ''}">
                            ${!codigoBarras ? '<div class="invalid-feedback">Campo obrigatório.</div>' : ''}
                        </div>
                        <div class="col-md-6">
                            <label for="descricao" class="form-label">
                                <i class="bi bi-card-text me-1"></i> Descrição do Produto
                            </label>
                            <input type="text" class="form-control ${!descricao ? 'is-invalid' : ''}" id="descricao" name="descricao" value="${descricao || ''}">
                            ${!descricao ? '<div class="invalid-feedback">Campo obrigatório.</div>' : ''}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="precoCusto" class="form-label">
                                <i class="bi bi-tag me-1"></i> Preço de Custo (R$)
                            </label>
                            <input type="number" step="0.01" min="0" class="form-control ${!precoCusto ? 'is-invalid' : ''}" id="precoCusto" name="precoCusto" value="${precoCusto || ''}">
                            ${!precoCusto ? '<div class="invalid-feedback">Campo obrigatório.</div>' : ''}
                        </div>
                        <div class="col-md-4">
                            <label for="precoVenda" class="form-label">
                                <i class="bi bi-cash-coin me-1"></i> Preço de Venda (R$)
                            </label>
                            <input type="number" step="0.01" min="0" class="form-control ${!precoVenda ? 'is-invalid' : ''}" id="precoVenda" name="precoVenda" value="${precoVenda || ''}">
                            ${!precoVenda ? '<div class="invalid-feedback">Campo obrigatório.</div>' : ''}
                        </div>
                        <div class="col-md-4">
                            <label for="qtdEstoque" class="form-label">
                                <i class="bi bi-archive me-1"></i> Qtd em Estoque
                            </label>
                            <input type="number" min="0" class="form-control ${!qtdEstoque ? 'is-invalid' : ''}" id="qtdEstoque" name="qtdEstoque" value="${qtdEstoque || ''}">
                            ${!qtdEstoque ? '<div class="invalid-feedback">Campo obrigatório.</div>' : ''}
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="dataValidade" class="form-label">
                                <i class="bi bi-calendar-event me-1"></i> Data de Validade
                            </label>
                            <input type="date" class="form-control ${!dataValidade ? 'is-invalid' : ''}" id="dataValidade" name="dataValidade" value="${dataValidade || ''}">
                            ${!dataValidade ? '<div class="invalid-feedback">Campo obrigatório.</div>' : ''}
                        </div>
                        <div class="col-md-6">
                            <label for="fabricante" class="form-label">
                                <i class="bi bi-building me-1"></i> Nome do Fabricante
                            </label>
                            <input type="text" class="form-control ${!fabricante ? 'is-invalid' : ''}" id="fabricante" name="fabricante" value="${fabricante || ''}">
                            ${!fabricante ? '<div class="invalid-feedback">Campo obrigatório.</div>' : ''}
                        </div>
                    </div>
                    <button type="submit" class="btn btn-success">
                        <i class="bi bi-check-circle me-1"></i> Cadastrar Produto
                    </button>
                    <a href="/listaProdutos" class="btn btn-outline-secondary ms-2">
                        <i class="bi bi-table me-1"></i> Ver Lista
                    </a>
                </form>
            </div>
        `);
        res.write(bootstrapScript);
        res.end();
    } else {
        listaProdutos.push({ codigoBarras, descricao, precoCusto, precoVenda, dataValidade, qtdEstoque, fabricante });
        res.redirect("/listaProdutos");
    }
});

app.get("/listaProdutos", estaAutenticado, (req, res) => {
    const nomeUsuario = req.session.nomeUsuario;
    const ultimoAcesso = req.cookies?.ultimoAcesso || "Nenhum acesso anterior registrado";

    res.write(gerarHead("Lista de Produtos"));
    res.write(gerarNavbar(nomeUsuario));
    res.write(`
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3><i class="bi bi-table me-2"></i>Produtos Cadastrados</h3>
                <span class="badge bg-secondary fs-6">
                    <i class="bi bi-clock-history me-1"></i> Último acesso: ${ultimoAcesso}
                </span>
            </div>
    `);

    if (listaProdutos.length === 0) {
        res.write(`
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i> Nenhum produto cadastrado ainda.
            </div>
            <a href="/produto" class="btn btn-primary">
                <i class="bi bi-plus-circle me-1"></i> Cadastrar Produto
            </a>
        `);
    } else {
        res.write(`
            <div class="table-responsive">
                <table class="table table-striped table-hover table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>#</th>
                            <th><i class="bi bi-upc-scan me-1"></i> Cód. Barras</th>
                            <th><i class="bi bi-card-text me-1"></i> Descrição</th>
                            <th><i class="bi bi-tag me-1"></i> Preço Custo</th>
                            <th><i class="bi bi-cash-coin me-1"></i> Preço Venda</th>
                            <th><i class="bi bi-calendar-event me-1"></i> Validade</th>
                            <th><i class="bi bi-archive me-1"></i> Estoque</th>
                            <th><i class="bi bi-building me-1"></i> Fabricante</th>
                        </tr>
                    </thead>
                    <tbody>
        `);
        for (let i = 0; i < listaProdutos.length; i++) {
            const p = listaProdutos[i];
            const dataFormatada = p.dataValidade
                ? new Date(p.dataValidade + 'T00:00:00').toLocaleDateString('pt-BR')
                : '-';
            res.write(`
                <tr>
                    <td>${i + 1}</td>
                    <td>${p.codigoBarras}</td>
                    <td>${p.descricao}</td>
                    <td>R$ ${parseFloat(p.precoCusto).toFixed(2)}</td>
                    <td>R$ ${parseFloat(p.precoVenda).toFixed(2)}</td>
                    <td>${dataFormatada}</td>
                    <td>${p.qtdEstoque}</td>
                    <td>${p.fabricante}</td>
                </tr>
            `);
        }
        res.write(`
                    </tbody>
                </table>
            </div>
            <a href="/produto" class="btn btn-primary mt-2">
                <i class="bi bi-plus-circle me-1"></i> Cadastrar Novo Produto
            </a>
        `);
    }

    res.write(`</div>`);
    res.write(bootstrapScript);
    res.end();
});

app.get("/login", (req, res) => {
    const ultimoAcesso = req.cookies?.ultimoAcesso || "Nenhum acesso anterior registrado";

    res.write(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Login</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    </head>
    <body class="d-flex align-items-center justify-content-center vh-100 bg-body-tertiary">
        <div class="card shadow p-4" style="min-width: 360px; max-width: 420px; width: 100%;">
            <h4 class="mb-4 text-center">
                <i class="bi bi-shield-lock me-2"></i> Acesso ao Sistema
            </h4>
            <form action="/login" method="POST">
                <div class="mb-3">
                    <label for="nome" class="form-label">
                        <i class="bi bi-person me-1"></i> Nome
                    </label>
                    <input type="text" class="form-control" id="nome" name="nome" placeholder="Seu nome" required>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">
                        <i class="bi bi-envelope me-1"></i> Email
                    </label>
                    <input type="email" class="form-control" id="email" name="email" placeholder="nome@example.com" required>
                </div>
                <div class="mb-3">
                    <label for="senha" class="form-label">
                        <i class="bi bi-key me-1"></i> Senha
                    </label>
                    <input type="password" class="form-control" id="senha" name="senha" placeholder="Senha" required>
                </div>
                <button class="btn btn-primary w-100" type="submit">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Entrar
                </button>
            </form>
            <p class="text-muted mt-4 mb-0 text-center small">
                <i class="bi bi-clock-history me-1"></i> Último acesso: ${ultimoAcesso}
            </p>
        </div>
    </body>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
    </html>
    `);
    res.end();
});

app.post("/login", (req, res) => {
    const nome = req.body.nome;
    const email = req.body.email;
    const senha = req.body.senha;

    if (email === "admin@teste.com.br" && senha === "admin") {
        req.session.logado = true;
        req.session.nomeUsuario = nome;

        const agora = new Date();
        res.cookie("ultimoAcesso", agora.toLocaleString('pt-BR'), {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.redirect("/");
    } else {
        const ultimoAcesso = req.cookies?.ultimoAcesso || "Nenhum acesso anterior registrado";
        res.write(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Login</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
        </head>
        <body class="d-flex align-items-center justify-content-center vh-100 bg-body-tertiary">
            <div class="card shadow p-4" style="min-width: 360px; max-width: 420px; width: 100%;">
                <h4 class="mb-4 text-center">
                    <i class="bi bi-shield-lock me-2"></i> Acesso ao Sistema
                </h4>
                <div class="alert alert-danger">
                    <i class="bi bi-x-circle me-2"></i> Email ou senha inválidos!
                </div>
                <form action="/login" method="POST">
                    <div class="mb-3">
                        <label for="nome" class="form-label">
                            <i class="bi bi-person me-1"></i> Nome
                        </label>
                        <input type="text" class="form-control" id="nome" name="nome" value="${nome || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="email" class="form-label">
                            <i class="bi bi-envelope me-1"></i> Email
                        </label>
                        <input type="email" class="form-control" id="email" name="email" value="${email || ''}" required>
                    </div>
                    <div class="mb-3">
                        <label for="senha" class="form-label">
                            <i class="bi bi-key me-1"></i> Senha
                        </label>
                        <input type="password" class="form-control" id="senha" name="senha" required>
                    </div>
                    <button class="btn btn-primary w-100" type="submit">
                        <i class="bi bi-box-arrow-in-right me-1"></i> Entrar
                    </button>
                </form>
                <p class="text-muted mt-4 mb-0 text-center small">
                    <i class="bi bi-clock-history me-1"></i> Último acesso: ${ultimoAcesso}
                </p>
            </div>
        </body>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
        </html>
        `);
        res.end();
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
