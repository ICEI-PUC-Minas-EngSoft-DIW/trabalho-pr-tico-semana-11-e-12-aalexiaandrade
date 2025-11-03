// INÍCIO DO CÓDIGO DA APLICAÇÃO


document.addEventListener('DOMContentLoaded', () => {

  if (document.getElementById('secao-destaques')) {

    carregarDestaques();

    carregarTodosProdutos();

  } else if (document.getElementById('detalhe-produto-container')) {

    carregarDetalhesProduto();

  }

});

// FUNÇÕES DA INDEX.HTML



function carregarDestaques() {

  const container = document.getElementById('carrossel-inner-container');

  if (!container) return;

  container.innerHTML = '';

  const produtosDestaque = dados.produtos.filter(p => p.destaque === true);

  if (produtosDestaque.length === 0) return;

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



function carregarTodosProdutos() {

  const container = document.getElementById('cards-container');

  if (!container) return;



  container.innerHTML = '';

  dados.produtos.forEach(produto => {



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





//  FUNÇÕES DA DETALHE.HTML

function carregarDetalhesProduto() {

  const params = new URLSearchParams(window.location.search);

  const idProduto = params.get('id');



  if (!idProduto) {

    window.location.href = 'index.html';

    return;

  }



  const produto = dados.produtos.find(p => p.id == idProduto);



  if (!produto) {

    alert('Produto não encontrado!');

    window.location.href = 'index.html';

    return;

  }

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

      <button class="btn btn-success btn-lg mt-3">Comprar Agora</button>

    </div>

  `;



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