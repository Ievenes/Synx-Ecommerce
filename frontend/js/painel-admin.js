document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario"));

  if (!token || !usuarioLogado || !["adm", "sa"].includes(usuarioLogado.nivel_acesso)) {
    alert("❌ Acesso não autorizado.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuarioMenu").textContent = usuarioLogado.nome_completo.split(" ")[0];

  await carregarUsuarios();

  document.getElementById("sair").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Alternar entre abas
  document.querySelectorAll("[data-aba]").forEach(botao => {
    botao.addEventListener("click", e => {
      e.preventDefault();

      document.querySelectorAll(".aba").forEach(aba => aba.classList.remove("ativa"));
      document.querySelectorAll("nav ul li a").forEach(a => a.classList.remove("ativo"));

      const abaAlvo = botao.getAttribute("data-aba");
      document.getElementById(abaAlvo).classList.add("ativa");
      botao.classList.add("ativo");

      if (abaAlvo === "produtos") {
        carregarProdutos();
      }
    });
  });
});

// ====================== USUÁRIOS =========================

let todosUsuarios = [];

async function carregarUsuarios() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("https://backend-lambda.onrender.com/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Erro ao buscar usuários");

    todosUsuarios = await res.json();
    renderizarUsuarios(todosUsuarios);

  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    alert("Erro ao carregar usuários.");
  }
}

function renderizarUsuarios(lista) {
  const tbody = document.getElementById("tabela-usuarios");
  tbody.innerHTML = "";

  lista.forEach(user => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.nome_completo}</td>
      <td>${user.email}</td>
      <td>${user.nivel_acesso}</td>
      <td>
        <select onchange="alterarNivel('${user.id_usuario}', this.value)">
          ${gerarOpcoesNivel(user.nivel_acesso)}
        </select>
      </td>
      <td>
        <button onclick="editarUsuario('${user.id_usuario}')">✏️</button>
        <button onclick="excluirUsuario('${user.id_usuario}')">🗑️</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function gerarOpcoesNivel(nivelAtual) {
  const niveis = [
    { valor: "user", rotulo: "Usuário Padrão" },
    { valor: "vendedor", rotulo: "Vendedor" },
    { valor: "logistica", rotulo: "Logística" },
    { valor: "adm", rotulo: "Administrador" },
    { valor: "sa", rotulo: "Supervisor" }
  ];

  return niveis
    .map(({ valor, rotulo }) => {
      const selecionado = valor === nivelAtual ? "selected" : "";
      return `<option value="${valor}" ${selecionado}>${rotulo}</option>`;
    })
    .join("");
}

async function alterarNivel(id_usuario, novoNivel) {
  const token = localStorage.getItem("token");

  const confirmar = confirm(`Deseja realmente alterar o nível para "${novoNivel}"?`);
  if (!confirmar) return;

  try {
    const res = await fetch(`https://backend-lambda.onrender.com/usuarios/${id_usuario}/nivel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nivel_acesso: novoNivel })
    });

    if (!res.ok) {
      const erro = await res.json();
      throw new Error(erro.erro || "Erro ao atualizar");
    }

    alert("✅ Nível de acesso atualizado com sucesso!");
    carregarUsuarios();

  } catch (err) {
    console.error("Erro ao atualizar nível:", err);
    alert(`❌ Falha ao atualizar: ${err.message}`);
  }
}

// ====================== FILTRAGEM =========================

document.addEventListener("DOMContentLoaded", () => {
  const inputBusca = document.getElementById("busca-usuario");
  if (inputBusca) {
    inputBusca.addEventListener("input", () => {
      const termo = inputBusca.value.toLowerCase();
      const filtrados = todosUsuarios.filter(u =>
        u.nome_completo.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
      );
      renderizarUsuarios(filtrados);
    });
  }
});

// ========== BOTÕES EDITAR/EXCLUIR ==========

function editarUsuario(id) {
  alert(`🛠️ Em breve: editar usuário ${id}`);
}

function excluirUsuario(id) {
  const confirmar = confirm("Deseja excluir este usuário?");
  if (!confirmar) return;

  const token = localStorage.getItem("token");

  fetch(`https://backend-lambda.onrender.com/usuarios/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao excluir usuário.");
      alert("🗑️ Usuário excluído com sucesso!");
      carregarUsuarios();
    })
    .catch(err => {
      console.error("Erro ao excluir:", err);
      alert("Erro ao excluir usuário.");
    });
}


// ====================== PRODUTOS =========================

async function carregarProdutos() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("https://backend-lambda.onrender.com/produtos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Erro ao buscar produtos");

    const produtos = await res.json();
    const tbody = document.getElementById("tabela-produtos");
    tbody.innerHTML = "";

    produtos.forEach(produto => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${produto.codigo}</td>
        <td>${produto.nome}</td>
        <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
        <td>${produto.categoria || "-"}</td>
        <td>
          <button onclick="editarProduto('${produto.id_produto}')">✏️</button>
          <button onclick="excluirProduto('${produto.id_produto}')">🗑️</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    alert("Erro ao carregar produtos.");
  }
}

// Funções de ação base
function editarProduto(id) {
  alert(`🛠️ Em breve: editar produto ${id}`);
}

function excluirProduto(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este produto?");
  if (!confirmar) return;

  const token = localStorage.getItem("token");

  fetch(`https://backend-lambda.onrender.com/produtos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Erro ao excluir");
      alert("🗑️ Produto excluído com sucesso!");
      carregarProdutos();
    })
    .catch(err => {
      console.error("Erro ao excluir produto:", err);
      alert("Erro ao excluir produto.");
    });
}

// Abrir modal com dados preenchidos
function editarProduto(id) {
  const token = localStorage.getItem("token");

  fetch("https://backend-lambda.onrender.com/produtos", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(produtos => {
      const produto = produtos.find(p => p.id_produto === id);
      if (!produto) return alert("Produto não encontrado.");

      document.getElementById("edit-id-produto").value = produto.id_produto;
      document.getElementById("edit-codigo").value = produto.codigo;
      document.getElementById("edit-nome").value = produto.nome;
      document.getElementById("edit-preco").value = produto.preco;
      document.getElementById("edit-categoria").value = produto.categoria;
      document.getElementById("edit-imagem").value = produto.imagem;
      document.getElementById("edit-descricao").value = produto.descricao;

      document.getElementById("titulo-modal-produto").textContent = "✏️ Editar Produto";
      document.getElementById("modal-editar-produto").classList.add("mostrar");
    })
    .catch(err => {
      console.error("Erro ao carregar produto:", err);
      alert("Erro ao carregar produto.");
    });
}

// Fechar modal ao clicar no X ou fora do conteúdo
document.addEventListener("click", e => {
  const modal = document.getElementById("modal-editar-produto");
  const conteudo = document.querySelector(".modal-conteudo");

  if (
    e.target.id === "fechar-modal-produto" ||
    (e.target === modal && !conteudo.contains(e.target))
  ) {
    modal.classList.remove("mostrar");
  }
});

// Submeter formulário
document.getElementById("form-editar-produto").addEventListener("submit", async e => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const id = document.getElementById("edit-id-produto").value;
  const body = {
    codigo: document.getElementById("edit-codigo").value.trim(),
    nome: document.getElementById("edit-nome").value.trim(),
    preco: parseFloat(document.getElementById("edit-preco").value),
    categoria: document.getElementById("edit-categoria").value.trim(),
    imagem: document.getElementById("edit-imagem").value.trim(),
    descricao: document.getElementById("edit-descricao").value.trim()
  };

  if (!body.codigo || !body.nome || isNaN(body.preco) || !body.categoria) {
    alert("❌ Preencha os campos obrigatórios: código, nome, preço e categoria.");
    return;
  }

  const url = id
    ? `https://backend-lambda.onrender.com/produtos/${id}`
    : `https://backend-lambda.onrender.com/produtos`;
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("Erro ao salvar produto");
    alert(`✅ Produto ${id ? "atualizado" : "cadastrado"} com sucesso!`);
    document.getElementById("modal-editar-produto").classList.remove("mostrar");
    carregarProdutos();

  } catch (err) {
    console.error("Erro ao salvar produto:", err);
    alert("Erro ao salvar produto.");
  }
});

// Abrir modal para novo produto
document.getElementById("btn-adicionar-produto").addEventListener("click", () => {
  document.getElementById("form-editar-produto").reset();
  document.getElementById("edit-id-produto").value = "";
  document.getElementById("titulo-modal-produto").textContent = "➕ Cadastrar Produto";
  document.getElementById("modal-editar-produto").classList.add("mostrar");
});
