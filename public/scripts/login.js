const emailInput = document.getElementById('login-input-email');
const passwordInput = document.getElementById('login-input-senha');
const loginBtn = document.getElementById('login-entrar-btn');
const msgError = document.getElementById("login-error-msg")
let res;

const seePassBtn = document.getElementById("see-pass-btn");

let visibility = false;
seePassBtn.addEventListener("click", () => {
    if (!visibility) {
        seePassBtn.children[0].innerText = "visibility_off"
        visibility = true;
        passwordInput.setAttribute("type", "text")
    } else {
        seePassBtn.children[0].innerText = "visibility"
        visibility = false;
        passwordInput.setAttribute("type", "password")
    }
})



emailInput.addEventListener("focus", () => {
    msgError.textContent = ""
})

passwordInput.addEventListener("focus", () => {
    msgError.textContent = ""
})

loginBtn.addEventListener('click', (e) => {

    if (emailInput.value == "" || passwordInput.value == "") {
        msgError.textContent = ("Algum dos campos está vazio!");

    } else {

        const bodyContent = {
            email: emailInput.value,
            password: passwordInput.value
        }

        fetch("/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Basic " + btoa(`${bodyContent.email}:${bodyContent.password}`) },

        }).then((response) => {
            res = response;
            return response.json();
        }).then((data) => {
            if (res.status == 200) {
                localStorage.setItem("token", data.token);
                if (data.verified) {
                    if (!data.username) {
                        window.location.replace("/etapa-perfil");
                    }
                    else {
                        window.location.replace("/home");
                    }
                } else {
                    window.location.replace("/verificacao-email");
                }


            } else {
                msgError.textContent = data.msg;
            }



        }).catch((e) => {
            console.log(e);
        })
    }

})


