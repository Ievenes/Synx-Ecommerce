let usuario = null;
let token = null;

document.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token");
  usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!token || !usuario) {
    window.location.href = "login.html";
    return;
  }

  // Preenche dados do usuário
  document.getElementById("emailUsuario").value = usuario.email;
  document.getElementById("nomeUsuarioMenu").textContent = usuario.nome_completo || "Não informado";
  document.getElementById("nomeUsuarioInput").value = usuario.nome_completo || "Não informado";
  document.getElementById("telefoneUsuario").value = usuario.telefone || "Não informado";
  document.getElementById("cpfUsuario").value = usuario.cpf || "Não informado";
  document.getElementById("generoUsuario").value = usuario.genero ? usuario.genero.toUpperCase() : "NÃO INFORMADO";

  const dataNasc = usuario.data_nascimento;
  document.getElementById("dataNascimentoUsuario").value = dataNasc
    ? new Date(dataNasc).toLocaleDateString("pt-BR", { timeZone: "UTC" })
    : "Não informado";

  // Alternar abas
  const links = document.querySelectorAll("[data-aba]");
  const abas = document.querySelectorAll(".aba");

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const destino = link.getAttribute("data-aba");

      abas.forEach(aba => aba.classList.remove("ativa"));
      links.forEach(l => l.classList.remove("ativo"));

      document.getElementById(destino).classList.add("ativa");
      link.classList.add("ativo");

      if (destino === "endereco") {
        carregarEndereco(); // Garante que a lista apareça
      }
    });
  });

  document.getElementById("sair").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Abrir modal
  document.getElementById("btn-toggle-form").addEventListener("click", () => {
    document.getElementById("modal-endereco").classList.add("mostrar");
  });

  // Fechar modal
  document.getElementById("fechar-modal").addEventListener("click", () => {
    const form = document.getElementById("form-endereco");
    form.reset();
    form.removeAttribute("data-editando");
    document.getElementById("modal-endereco").classList.remove("mostrar");
  });

  // Auto preencher CEP
  document.getElementById("cep").addEventListener("blur", async () => {
    const cep = document.getElementById("cep").value.replace(/\D/g, "");
    if (cep.length !== 8) {
      alert("CEP inválido. Digite 8 dígitos.");
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      document.getElementById("rua").value = data.logradouro || "";
      document.getElementById("bairro").value = data.bairro || "";
      document.getElementById("cidade").value = data.localidade || "";
      document.getElementById("estado").value = data.uf || "";

    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
      alert("Erro ao consultar o CEP.");
    }
  });

  // Submeter novo endereço
  document.getElementById("form-endereco").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = document.getElementById("form-endereco");
    const idEditando = form.getAttribute("data-editando");

    const endereco = {
      id_usuario: usuario.id_usuario,
      rua: document.getElementById("rua").value,
      numero: document.getElementById("numero").value,
      complemento: document.getElementById("complemento").value,
      bairro: document.getElementById("bairro").value,
      cidade: document.getElementById("cidade").value,
      estado: document.getElementById("estado").value.toUpperCase(),
      cep: document.getElementById("cep").value
    };

    try {
      const url = idEditando
        ? `https://backend-lambda.onrender.com/enderecos/${idEditando}`
        : "https://backend-lambda.onrender.com/enderecos";

      const method = idEditando ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endereco)
      });

      const data = await response.json();

      if (response.ok) {
        alert(idEditando ? "Endereço atualizado!" : "Endereço salvo com sucesso!");
        form.reset();
        form.removeAttribute("data-editando");
        document.getElementById("modal-endereco").classList.remove("mostrar");
        carregarEndereco();
      } else {
        alert(data.erro || "Erro ao salvar.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro de conexão com o servidor.");
    }
  });
});

// Função global: excluir
window.excluirEndereco = async function (id) {
  if (!confirm("Tem certeza que deseja excluir este endereço?")) return;

  try {
    const response = await fetch(`https://backend-lambda.onrender.com/enderecos/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Endereço excluído com sucesso!");
      document.getElementById("form-endereco").reset();
      document.getElementById("form-endereco").removeAttribute("data-editando");
      document.getElementById("modal-endereco").classList.remove("mostrar");
      carregarEndereco();
    } else {
      alert("Erro ao excluir endereço.");
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
    alert("Erro de conexão com o servidor.");
  }
};

// Função global: editar
window.editarEndereco = async function (id) {
  try {
    const response = await fetch(`https://backend-lambda.onrender.com/enderecos/${id}`);
    const endereco = await response.json();

    document.getElementById("rua").value = endereco.rua;
    document.getElementById("numero").value = endereco.numero;
    document.getElementById("complemento").value = endereco.complemento;
    document.getElementById("bairro").value = endereco.bairro;
    document.getElementById("cidade").value = endereco.cidade;
    document.getElementById("estado").value = endereco.estado;
    document.getElementById("cep").value = endereco.cep;

    document.getElementById("form-endereco").setAttribute("data-editando", id);
    document.getElementById("modal-endereco").classList.add("mostrar");
  } catch (err) {
    console.error("Erro ao carregar dados para edição:", err);
    alert("Erro ao carregar dados do endereço.");
  }
};

// Carregar lista de endereços
async function carregarEndereco() {
  try {
    const response = await fetch(`https://backend-lambda.onrender.com/enderecos/usuario/${usuario.id_usuario}`);
    const enderecos = await response.json();

    const container = document.getElementById("lista-enderecos");
    container.innerHTML = "<h3>Endereço</h3>";

    if (enderecos.length === 0) {
      container.innerHTML += "<p>🚫 Nenhum endereço cadastrado.</p>";
      return;
    }

    enderecos.forEach((end) => {
      container.innerHTML += `
        <div class="endereco-item">
          <p><strong>Rua:</strong> ${end.rua}, ${end.numero}</p>
          <p><strong>Complemento:</strong> ${end.complemento || '-'}</p>
          <p><strong>Bairro:</strong> ${end.bairro}</p>
          <p><strong>Cidade:</strong> ${end.cidade} - ${end.estado}</p>
          <p><strong>CEP:</strong> ${end.cep}</p>
          <div class="acoes-endereco">
            <button onclick="editarEndereco('${end.id_endereco}')">✏️ Editar</button>
            <button onclick="excluirEndereco('${end.id_endereco}')">🗑️ Excluir</button>
          </div>
          <hr/>
        </div>
      `;
    });

  } catch (error) {
    console.error("Erro ao carregar endereço:", error);
    document.getElementById("lista-enderecos").innerHTML += "<p>Erro ao carregar endereço.</p>";
  }
}
