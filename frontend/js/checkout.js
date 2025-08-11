document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!token || !usuario) {
        window.location.href = "login.html";
        return;
    }

    carregarResumoCarrinho();
    carregarEndereco();

    document.getElementById("confirmar-pedido").addEventListener("click", () => {
        const enderecoSelecionado = document.querySelector("input[name='endereco']:checked");

        if (!enderecoSelecionado) {
            alert("❌ Por favor, selecione um endereço para entrega.");
            return;
        }

        const nomeEndereco = enderecoSelecionado.getAttribute("data-label");
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

        if (carrinho.length === 0) {
            alert("❌ Seu carrinho está vazio.");
            return;
        }

        alert(`✅ Pedido confirmado com sucesso!\n${nomeEndereco} selecionado\nItens: ${carrinho.length}`);

        localStorage.removeItem("carrinho");
        window.location.href = "index.html";
    });

    async function carregarEndereco() {
        try {
            const response = await fetch(`https://backend-lambda.onrender.com/enderecos/usuario/${usuario.id_usuario}`);
            const enderecos = await response.json();
            const container = document.getElementById("lista-enderecos");

            container.innerHTML = "";

            if (enderecos.length === 0) {
                container.innerHTML = "<p>🚫 Nenhum endereço cadastrado.</p>";
                return;
            }

            enderecos.forEach((endereco, index) => {
                const radio = document.createElement("input");
                radio.type = "radio";
                radio.name = "endereco";
                radio.value = endereco.id_endereco;
                radio.id = `endereco-${index}`;
                radio.setAttribute("data-label", `Endereço ${index + 1}`);
                if (index === 0) radio.checked = true;

                const label = document.createElement("label");
                label.setAttribute("for", `endereco-${index}`);
                label.innerHTML = `
        <p><strong>Rua:</strong> ${endereco.rua}, ${endereco.numero}</p>
        <p><strong>Complemento:</strong> ${endereco.complemento || '-'}</p>
        <p><strong>Bairro:</strong> ${endereco.bairro}</p>
        <p><strong>Cidade:</strong> ${endereco.cidade} - ${endereco.estado}</p>
        <p><strong>CEP:</strong> ${endereco.cep}</p>
        <hr/>
      `;

                container.appendChild(radio);
                container.appendChild(label);
            });

        } catch (error) {
            console.error("Erro ao carregar endereço:", error);
            document.getElementById("lista-enderecos").innerHTML = "<p>Erro ao carregar endereço.</p>";
        }
    }

    function carregarResumoCarrinho() {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        const lista = document.getElementById("lista-checkout");
        const total = document.getElementById("total-checkout");

        if (carrinho.length === 0) {
            lista.innerHTML = "<li>Seu carrinho está vazio.</li>";
            total.innerHTML = "";
            return;
        }

        let totalGeral = 0;
        carrinho.forEach(produto => {
            const li = document.createElement("li");
            li.textContent = `${produto.nome} x${produto.quantidade} - R$ ${(produto.preco * produto.quantidade).toFixed(2)}`;
            lista.appendChild(li);
            totalGeral += produto.preco * produto.quantidade;
        });

        total.innerHTML = `<strong>Total: R$ ${totalGeral.toFixed(2)}</strong>`;
    }
});
