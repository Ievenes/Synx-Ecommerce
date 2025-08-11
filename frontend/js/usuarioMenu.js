document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const containerLogado = document.getElementById("usuario-logado");
  const containerNaoLogado = document.getElementById("usuario-nao-logado");
  const containerCadastrado = document.getElementById("cadastrar-usuario");
  const nomeUsuarioSpan = document.getElementById("nome-usuario");

  if (usuario && nomeUsuarioSpan) {
    containerLogado.style.display = "inline-block";
    containerNaoLogado.style.display = "none";
    containerCadastrado.style.display = "none";
    nomeUsuarioSpan.textContent = usuario.nome_completo.split(" ")[0]; // mostra só o primeiro nome

    // ✅ Adiciona botão para Painel do Administrador, se for adm ou sa
    if (usuario.nivel_acesso === "adm" || usuario.nivel_acesso === "sa") {
      const menu = document.querySelector(".usuario-menu");
      const adminLink = document.createElement("a");
      adminLink.href = "painel-admin.html";
      adminLink.textContent = "🔐 Painel do Administrador";
      menu.insertBefore(adminLink, document.getElementById("sair-btn"));
    }
  }

  // Toggle do menu
  const btnUsuario = document.getElementById("btn-usuario");
  const dropdown = document.getElementById("usuario-logado");
  btnUsuario?.addEventListener("click", () => {
    dropdown.classList.toggle("ativo");
  });

  // Sair
  const sairBtn = document.getElementById("sair-btn");
  sairBtn?.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });
});
