document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmaSenha = document.getElementById("confirmaSenha").value;

    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch("https://backend-lambda.onrender.com/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome_completo: nome, email, senha }),
      });

      const data = await response.json();

      if (response.status === 201) {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "login.html";
      } else {
        alert(data.erro || "Erro ao cadastrar usuário.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro na conexão com o servidor.");
    }
  });
});
