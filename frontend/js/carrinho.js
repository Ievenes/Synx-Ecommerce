document.addEventListener("DOMContentLoaded", () => {
  const botoesCarrinho = document.querySelectorAll(".btn-adicionar-carrinho");
  const btnCarrinho = document.getElementById("btn-carrinho");
  const menuCarrinho = document.getElementById("carrinho-menu");

  // Toggle do carrinho
  btnCarrinho?.addEventListener("click", () => {
    menuCarrinho.classList.toggle("ativo");
    exibirCarrinho();
  });

  botoesCarrinho.forEach((botao) => {
    botao.addEventListener("click", () => {
      const produto = {
        nome: botao.getAttribute("data-nome"),
        preco: parseFloat(botao.getAttribute("data-preco")),
        imagem: botao.getAttribute("data-imagem"),
        quantidade: 1
      };

      adicionarAoCarrinho(produto);
      atualizarContadorCarrinho(); // Aqui é ok também
    });
  });

  // ✅ ESSENCIAL: Chamar isso ao carregar a página!
  atualizarContadorCarrinho();
  exibirCarrinho();
});


function adicionarAoCarrinho(produto) {
  let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const existente = carrinho.find(item => item.nome === produto.nome);

  if (existente) {
    existente.quantidade += 1;
  } else {
    carrinho.push(produto);
  }

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarContadorCarrinho(); // ✅ chamando a função
  exibirCarrinho();
  alert(`${produto.nome} adicionado ao carrinho!`);
}

// ✅ fora da função acima!
function atualizarContadorCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
  const contador = document.getElementById("contador-carrinho");
  if (contador) {
    contador.textContent = `(${totalItens})`;
  }
}


function exibirCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const lista = document.getElementById("lista-carrinho");
  const vazio = document.querySelector(".carrinho-menu .vazio");
  const total = document.getElementById("total-carrinho");

  lista.innerHTML = "";
  total.innerHTML = "";

  if (carrinho.length === 0) {
    vazio.style.display = "block";
    return;
  }

  vazio.style.display = "none";

  let totalGeral = 0;
  carrinho.forEach(produto => {
    const li = document.createElement("li");
    li.textContent = `${produto.nome} x${produto.quantidade} - R$ ${(produto.preco * produto.quantidade).toFixed(2)}`;
    lista.appendChild(li);
    totalGeral += produto.preco * produto.quantidade;
  });

  total.innerHTML = `<strong>Total: R$ ${totalGeral.toFixed(2)}</strong>`;
}
document.getElementById("finalizar-compra")?.addEventListener("click", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    alert("Você precisa estar logado para finalizar a compra.");
    window.location.href = "login.html";
  } else {
    window.location.href = "checkout.html";
  }
});