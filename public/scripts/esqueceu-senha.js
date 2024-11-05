
const modalError = document.getElementById("criacao-modal-error");
const modalErrorOkBtn = document.getElementById("criacao-modal-error-ok")


modalErrorOkBtn.addEventListener("click", () => {
    document.getElementById("criacao-modal-error").close();

})

document.getElementById("esqueceu-senha-codigo").addEventListener("input", () => {
    // Remover caracteres não numéricos e limitar o valor a 999999
    document.getElementById("esqueceu-senha-codigo").value = document.getElementById("esqueceu-senha-codigo").value.replace(/\D/g, "").slice(0, 6);
});


document.addEventListener("DOMContentLoaded", function () {
    const esqueceuSenha1 = document.getElementById("esqueceu-senha1-conteudo-principal");
    const esqueceuSenha2 = document.getElementById("esqueceu-senha2-conteudo-principal");
    const esqueceuSenha3 = document.getElementById("esqueceu-senha3-conteudo-principal");

    const btnEnviar = document.getElementById("esqueceu-senha1-enviar-btn");
    const btnConcluir = document.getElementById("esqueceu-senha2-concluir-btn");
    const btnRedefinir = document.getElementById("esqueceu-senha3-redefinir-btn");

    // Mostrar apenas a tela inicial
    // esqueceuSenha2.style.display = "none";
    // esqueceuSenha3.style.display = "none";

    // Função para exibir a segunda tela de verificação
    function mostrarVerificacao() {
        esqueceuSenha1.style.display = "none";
        esqueceuSenha2.style.display = "";
    }

    // Função para exibir a terceira tela de redefinição de senha
    function mostrarRedefinirSenha() {
        esqueceuSenha2.style.display = "none";
        esqueceuSenha3.style.display = "";
    }

    // Função para exibir mensagens de erro ou sucesso
    function exibirMensagem(tipo, mensagem) {
        document.getElementById("criacao-msg-error").textContent = mensagem
        modalError.showModal()
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validarEmail(email) {
        return emailRegex.test(email);
    }


    document.getElementById("reenviar-codigo").addEventListener("click", async function () {
        const email = document.getElementById("cadastro-input-email").value;


        if (!email) {
            exibirMensagem('erro', 'Por favor, preencha o campo de email.');
            return;
        }



        if (!validarEmail(email)) {
            document.getElementById("criacao-msg-error").textContent = "Por favor, insira um email válido."
            modalError.showModal()
        } else {
            try {
                const response = await fetch("user/esqueci-senha", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

                console.log("1-", email)

                const result = await response.json();
                if (response.ok) {
                    exibirMensagem('sucesso', "Código enviado para o email " + email);
                    mostrarVerificacao(); // Avançar para a próxima tela
                } else {
                    exibirMensagem('erro', result.message);
                }
            } catch (error) {
                exibirMensagem('erro', 'Erro ao enviar o código. Tente novamente.');
            }
        }

    })


    btnEnviar.addEventListener("click", async function () {
        const email = document.getElementById("cadastro-input-email").value;

        if (!email) {
            exibirMensagem('erro', 'Por favor, preencha o campo de email.');
            return;
        }



        if (!validarEmail(email)) {
            document.getElementById("criacao-msg-error").textContent = "Por favor, insira um email válido."
            modalError.showModal()
            return
        } else {
            try {

                const response = await fetch("user/esqueci-senha", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                });

                console.log("1-", email)

                const result = await response.json();
                if (response.ok) {
                    exibirMensagem('sucesso', "Código enviado para o email " + email);
                    mostrarVerificacao();
                } else {
                    exibirMensagem('erro', result.message);

                }
            } catch (error) {
                exibirMensagem('erro', 'Erro ao enviar o código. Tente novamente.');
            }
        }

    });

    // Etapa 2: Verificar código
    btnConcluir.addEventListener("click", async function () {
        const codigo = document.getElementById("esqueceu-senha-codigo").value;
        const email = document.getElementById("cadastro-input-email").value; // reutilizando o email preenchido na etapa 1

        if (!codigo) {
            exibirMensagem('erro', 'Por favor, insira o código de verificação.');
            return;
        }

        try {
            const response = await fetch("user/verificaCodigoSenha", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, codigo })
            });

            const result = await response.json();
            if (response.ok) {
                exibirMensagem('sucesso', result.message);
                mostrarRedefinirSenha(); // Avançar para a tela de redefinir senha
            } else {
                exibirMensagem('erro', result.message);
            }
        } catch (error) {
            exibirMensagem('erro', 'Erro ao verificar o código. Tente novamente.');
        }
    });

    // Etapa 3: Redefinir senha
    btnRedefinir.addEventListener("click", async function () {
        const email = document.getElementById("cadastro-input-email").value;
        const novaSenha = document.getElementById("esqueceu-senha3-input-senha").value;
        const confirmaSenha = document.getElementById("esqueceu-senha3-input-confirma-senha").value;

        if (!novaSenha || !confirmaSenha) {
            exibirMensagem('erro', 'Por favor, preencha ambos os campos de senha.');
            return;
        }

        function validarSenhaForte(senha) {
            const criterios = [
                { regex: /.{4,}/, msg: "A senha precisa ter pelo menos 4 caracteres." },
                { regex: /[a-z]/, msg: "A senha precisa ter pelo menos uma letra minúscula." },
                { regex: /[0-9]/, msg: "A senha precisa ter pelo menos um número." },
            ];

            let erros = criterios.filter(criterio => !criterio.regex.test(senha)).map(criterio => criterio.msg);

            console.log(erros)


            if (erros[0]) {
                exibirMensagem('erro', erros.join(" "));
                return true;
            } else {
                return false;
            }
        }


        if (validarSenhaForte(document.getElementById("esqueceu-senha3-input-senha").value)) {
            return;
        }



        if (novaSenha !== confirmaSenha) {
            exibirMensagem('erro', 'As senhas não coincidem.');
            return;
        }

        try {
            const response = await fetch("/user/redefinirSenha", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, novaSenha, confirmaSenha })
            });

            const result = await response.json();
            if (response.ok) {
                exibirMensagem('sucesso', result.message);
                window.location.href = "/login"; // Redirecionar para a página de login após redefinir a senha
            } else {
                exibirMensagem('erro', result.message);
            }
        } catch (error) {
            exibirMensagem('erro', 'Erro ao redefinir a senha. Tente novamente.');
        }
    });
});
