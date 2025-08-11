document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = loginForm.email.value;
            const senha = loginForm.senha.value;

            try {
                console.log("Enviando para o backend:", { email, senha });

                const response = await fetch("https://backend-lambda.onrender.com/usuarios/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, senha }),
                });

                console.log("Status da resposta:", response.status);

                const data = await response.json();
                console.log("Resposta JSON:", data);

                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("usuario", JSON.stringify(data.usuario));
                    alert("Login realizado com sucesso!");
                    window.location.href = "index.html";
                } else {
                    alert(data.erro || "Credenciais inválidas.");
                }
            } catch (err) {
                console.error("Erro na requisição:", err);
                alert("Erro na conexão com o servidor.");
            }
        }
        );
    }
        });
