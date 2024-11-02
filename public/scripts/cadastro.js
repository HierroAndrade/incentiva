const emailInput = document.getElementById("cadastro-input-email");
const passInput = document.getElementById("cadastro-input-senha");
const confirmPassInput = document.getElementById("cadastro-input-confirma-senha");
const createUserBtn = document.getElementById("cadastro-cadastrar-btn");
const errorMsg = document.getElementById("cadastro-error-msg")
const seePassBtn = document.getElementById("see-pass-btn");

let visibility = false;
seePassBtn.addEventListener("click", () => {
    if (!visibility) {
        seePassBtn.children[0].innerText = "visibility_off"
        visibility = true;
        passInput.setAttribute("type", "text")
        confirmPassInput.setAttribute("type", "text")
    } else {
        seePassBtn.children[0].innerText = "visibility"
        visibility = false;
        passInput.setAttribute("type", "password")
        confirmPassInput.setAttribute("type", "password")
    }
})

emailInput.addEventListener("focus", () => {
    errorMsg.textContent = ""
})

passInput.addEventListener("focus", () => {
    errorMsg.textContent = ""
})

confirmPassInput.addEventListener("focus", () => {
    errorMsg.textContent = ""
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarEmail(email) {
    return emailRegex.test(email);
}




const passCriteriaMsg = document.getElementById("password-criteria-msg");

function validarSenhaForte(senha) {
    const criterios = [
        { regex: /.{4,}/, msg: "A senha precisa ter pelo menos 4 caracteres." },
        { regex: /[a-z]/, msg: "A senha precisa ter pelo menos uma letra minúscula." },
        { regex: /[0-9]/, msg: "A senha precisa ter pelo menos um número." },
    ];

    let erros = criterios.filter(criterio => !criterio.regex.test(senha)).map(criterio => criterio.msg);

    passCriteriaMsg.textContent = erros.join(" ");
    return erros.length === 0;
}

createUserBtn.addEventListener('click', () => {

    passCriteriaMsg.textContent = "";

    if (!validarSenhaForte(passInput.value)) {
        errorMsg.textContent = "Por favor, corrija os erros da senha!";
        return;
    }

    if (emailInput.value == "" || passInput.value == "" || confirmPassInput.value == "") {
        errorMsg.innerText = "Preencha todos os campos!"

        return
    }

    if (!validarEmail(emailInput.value)) {
        document.getElementById("cadastro-error-msg").innerText = "Por favor, insira um email válido.";
    } else {
        if (passInput.value == confirmPassInput.value) {
            const bodyContent = {
                email: emailInput.value,
                password: passInput.value
            }

            //esta dando um erro chato

            fetch("/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyContent)
            }).then((response) => {
                if (response.ok) {
                    window.location.href = '/login'
                }
                return response.json();
            }).then((data) => {
                if (data.msg != "Cadastro realizado com sucesso!") {
                    errorMsg.innerText = data.msg;
                }
                console.log(data);

            }).catch((e) => {
                console.log(e);
            })
        } else {
            errorMsg.innerText = "As senhas não conferem!"
        }
    }


})
