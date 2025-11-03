const API_URL = 'http://localhost:3004/produtos';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('secao-destaques')) {
        carregarDestaques();
        carregarTodosProdutos();
    } else if (document.getElementById('detalhe-produto-container')) {
        carregarDetalhesProduto();
    } else if (document.getElementById('form-cadastro-produto')) {
        iniciarFormularioCadastro();
    } else if (document.getElementById('form-editar-produto')) {
        iniciarFormularioEdicao();
    }
});

// --- FUNÇÕES DE LEITURA (READ) ---

// Busca TODOS os produtos da API
async function fetchProdutos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar produtos. Status: ' + response.status);
        return await response.json();
    } catch (error) {
        console.error(error);
        const container = document.getElementById('cards-container') || document.getElementById('carrossel-inner-container');
        if (container) container.innerHTML = "<p class='text-danger text-center'>Falha ao carregar produtos. Verifique se o servidor JSON (npm start) está a rodar.</p>";
        return [];
    }
}

// Busca UM produto da API pelo ID
async function fetchProdutoPorId(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Produto não encontrado. Status: ' + response.status);
        return await response.json();
    } catch (error) {
        console.error(error);
        const container = document.getElementById('detalhe-produto-container');
        if (container) container.innerHTML = `<p class='text-danger text-center'>Produto com ID ${id} não encontrado.</p>`;
        return null;
    }
}

async function carregarDestaques() {
    const container = document.getElementById('carrossel-inner-container');
    if (!container) return;
    container.innerHTML = '';

    const produtos = await fetchProdutos();
    const produtosDestaque = produtos.filter(p => p.destaque === true);

    if (produtosDestaque.length === 0) {
        container.innerHTML = '<div class="carousel-item active"><div class="d-block w-100 bg-secondary" style="height: 400px; display: grid; place-items: center; color: white;">Nenhum produto em destaque.</div></div>';
        return;
    }

    produtosDestaque.forEach((produto, index) => {
        const activeClass = (index === 0) ? 'active' : '';
        const itemHtml = `
            <div class="carousel-item ${activeClass}">
                <img src="${produto.imagem_principal}" class="d-block w-100" alt="${produto.nome}">
                <div class="carousel-caption d-none d-md-block">
                    <h5>${produto.nome}</h5>
                    <p>${produto.descricao}</p>
                    <a href="detalhe.html?id=${produto.id}" class="btn btn-primary">Ver Detalhes</a>
                </div>
            </div>
        `;
        container.innerHTML += itemHtml;
    });
}

async function carregarTodosProdutos() {
    const container = document.getElementById('cards-container');
    if (!container) return;
    container.innerHTML = '';

    const produtos = await fetchProdutos();

    if (produtos.length === 0 && !container.innerHTML.includes('text-danger')) { 
        container.innerHTML = '<p class="text-center">Nenhum produto cadastrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const cardHtml = `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="${produto.imagem_principal}" class="card-img-top" alt="${produto.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${produto.nome}</h5>
                        <p class="card-text">${produto.descricao}</p>
                    </div>
                    <div class="card-footer">
                        <a href="detalhe.html?id=${produto.id}" class="btn btn-outline-primary w-100">
                            Ver Produto
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHtml;
    });
}

async function carregarDetalhesProduto() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = params.get('id');

    if (!idProduto) {
        window.location.href = 'index.html';
        return;
    }

    const produto = await fetchProdutoPorId(idProduto);
    if (!produto) return; 

    document.title = produto.nome + " - Detalhes";

    const infoContainer = document.getElementById('info-gerais');
    infoContainer.innerHTML = `
        <div class="col-md-6">
            <img src="${produto.imagem_principal}" class="img-fluid rounded shadow-lg" alt="${produto.nome}">
        </div>
        <div class="col-md-6">
            <h2>${produto.nome}</h2>
            <h4 class="text-muted">${produto.marca}</h4>
            <h3 class="text-primary my-3">${produto.preco}</h3>
            <p class="lead">${produto.descricao}</p>
            <hr>
            <h5>Sobre o produto:</h5>
            <p>${produto.conteudo}</p>

            <div class="mt-4">
                <a href="editar_produto.html?id=${produto.id}" class="btn btn-warning me-2">
                    <i class="bi bi-pencil-fill"></i> Editar
                </a>
                <button id="btn-excluir" class="btn btn-danger">
                    <i class="bi bi-trash-fill"></i> Excluir
                </button>
            </div>
        </div>
    `;

    // Adiciona o o botão de exclusão (DELETE)
    document.getElementById('btn-excluir').addEventListener('click', () => {
        excluirProduto(produto.id);
    });

    const galeriaContainer = document.getElementById('galeria-container');
    if (produto.galeria && produto.galeria.length > 0) {
        galeriaContainer.innerHTML = '';
        produto.galeria.forEach(foto => {
            const fotoHtml = `
                <div class="col">
                    <div class="card">
                        <img src="${foto.imagem}" class="card-img-top" alt="${foto.titulo}">
                        <div class="card-body">
                            <p class="card-text text-center">${foto.titulo}</p>
                        </div>
                    </div>
                </div>
            `;
            galeriaContainer.innerHTML += fotoHtml;
        });
    } else {
        const secaoGaleria = document.getElementById('fotos-vinculadas');
        if (secaoGaleria) {
           secaoGaleria.innerHTML = "<p class='text-center'>Não há fotos extras para este produto.</p>";
        }
    }
}


// --- FUNÇÃO DE CRIAÇÃO (CREATE) ---

function iniciarFormularioCadastro() {
    const form = document.getElementById('form-cadastro-produto');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const novoProduto = {
            nome: document.getElementById('nome').value,
            marca: document.getElementById('marca').value,
            preco: document.getElementById('preco').value,
            imagem_principal: document.getElementById('imagem_principal').value,
            descricao: document.getElementById('descricao').value,
            conteudo: document.getElementById('conteudo').value,
            destaque: document.getElementById('destaque').checked,
            galeria: []
        };

        // Envia para a API (POST)
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(novoProduto)
            });

            if (!response.ok) throw new Error('Erro ao cadastrar produto');

            alert('Produto cadastrado com sucesso!');
            window.location.href = 'index.html';

        } catch (error) {
            console.error(error);
            alert('Falha no cadastro. Verifique o console.');
        }
    });
}

// --- FUNÇÃO DE EXCLUSÃO (DELETE) ---

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir produto');

        alert('Produto excluído com sucesso!');
        window.location.href = 'index.html';

    } catch (error) {
        console.error(error);
        alert('Falha ao excluir. Verifique o console.');
    }
}


// --- FUNÇÕES DE ATUALIZAÇÃO ---

async function iniciarFormularioEdicao() {
    const params = new URLSearchParams(window.location.search);
    const idProduto = params.get('id');

    if (!idProduto) {
        alert('ID do produto não fornecido');
        window.location.href = 'index.html';
        return;
    }

    const produto = await fetchProdutoPorId(idProduto);
    if (!produto) return;

    // Preenche o formulário
    document.getElementById('nome').value = produto.nome;
    document.getElementById('marca').value = produto.marca;
    document.getElementById('preco').value = produto.preco;
    document.getElementById('imagem_principal').value = produto.imagem_principal;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('conteudo').value = produto.conteudo;
    document.getElementById('destaque').checked = produto.destaque;

    // Adiciona o (PUT)
    const form = document.getElementById('form-editar-produto');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Monta o objeto ATUALIZADO
        const produtoAtualizado = {
            nome: document.getElementById('nome').value,
            marca: document.getElementById('marca').value,
            preco: document.getElementById('preco').value,
            imagem_principal: document.getElementById('imagem_principal').value,
            descricao: document.getElementById('descricao').value,
            conteudo: document.getElementById('conteudo').value,
            destaque: document.getElementById('destaque').checked,
            galeria: produto.galeria 
        };

        // Envia para a API (PUT)
        try {
            const response = await fetch(`${API_URL}/${idProduto}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produtoAtualizado)
            });

            if (!response.ok) throw new Error('Erro ao atualizar produto');

            alert('Produto atualizado com sucesso!');
            window.location.href = `detalhe.html?id=${idProduto}`;

        } catch (error) {
            console.error(error);
            alert('Falha na atualização. Verifique o console.');
        }
    });
}