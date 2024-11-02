
const modalError = document.getElementById("criacao-modal-error");
const modalErrorOkBtn = document.getElementById("criacao-modal-error-ok");


modalErrorOkBtn.addEventListener("click", () => {
    document.getElementById("criacao-modal-error").close();

})

async function enviaCodigo(email) {
    try {
        const response = await fetch("/user/verificaEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email }) // Enviando o email no corpo da requisição
        });

        const data = await response.json(); // Parseia a resposta como JSON

        if (response.status === 200) {
            document.getElementById("criacao-msg-error").textContent = "Código enviado com sucesso para o email " + email;
            modalError.showModal()
            // Aqui você pode exibir uma mensagem de sucesso ou realizar outras ações
        } else {
            console.error("Erro ao enviar código:", data.message);
            // Exibir uma mensagem de erro ao usuário
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

const codigoInput = document.getElementById("codigo-input");
codigoInput.addEventListener("input", () => {
    // Remover caracteres não numéricos e limitar o valor a 999999
    codigoInput.value = codigoInput.value.replace(/\D/g, "").slice(0, 6);
});

