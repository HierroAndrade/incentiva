

let counterStep = 0;

let goBackBtn = document.getElementById("etapa-perfil-voltar");
let continueBtn = document.getElementById("etapa-perfil-continuar-finalizar");
let circlesDivChild = document.getElementById("etapa-perfil-three-circles").children;
let etapaPerfilBtnsDiv = document.getElementById("etapa-perfil-buttons");
let etapaPerfilConteudo1 = document.getElementById("etapa-perfil-conteudo-1");
let etapaPerfilConteudo2 = document.getElementById("etapa-perfil-conteudo-2");
let etapaPerfilConteudo3 = document.getElementById("etapa-perfil-conteudo-3");
let inputUsername = document.getElementById("etapa-perfil-pesquisa-nome-input");
circlesDivChild[0].style.backgroundColor = "#198CF8";

goBackBtn.disabled = true;
goBackBtn.style.display = "none"
etapaPerfilBtnsDiv.style.justifyContent = "flex-end";
continueBtn.addEventListener("click", async (e) => {
    if (counterStep == 0) {
        if (inputUsername.value.trim() == "") {
            inputUsername.setAttribute("error", "")

            return
        } else {
            const json = await fetch("/user/get/" + inputUsername.value).then(async response => await response.json())

            if (json.user != null) {
                inputUsername.setAttribute("error", "")
                inputUsername.value = "";
                inputUsername.setAttribute("placeholder", "Já existe um usuário com este nome!")
                return
            }
        }

    }
    counterStep++

    if (counterStep == 1) {

        goBackBtn.disabled = false;
        goBackBtn.style.display = "block";
        etapaPerfilBtnsDiv.style.justifyContent = "space-between";
        circlesDivChild[0].style.backgroundColor = "#bbbbbb";
        circlesDivChild[1].style.backgroundColor = "#198CF8";
        etapaPerfilConteudo1.style.display = "none";
        etapaPerfilConteudo2.style.display = "block";
    } else if (counterStep == 2) {
        etapaPerfilBtnsDiv.style.justifyContent = "space-between";
        circlesDivChild[1].style.backgroundColor = "#bbbbbb";
        circlesDivChild[2].style.backgroundColor = "#198CF8";
        etapaPerfilConteudo2.style.display = "none";
        etapaPerfilConteudo3.style.display = "block";
        continueBtn.textContent = "Finalizar"
    } else if (counterStep > 2) {
        authFetchJson("/user/edit", {
            method: "PUT",
            body: JSON.stringify({
                username: inputUsername.value,
                bio: document.getElementById("etapa-perfil-biografia").value
            })
        }).then(async response => {
            if (response.status != 200) {
                let json = await response.json();
                console.log(json);
            }
            else {
                const formData = new FormData();
                formData.append('user_logo', document.getElementById("etapa-perfil-foto").files[0])

                fetch("/user/attachLogo", {
                    method: "PUT",
                    body: formData,
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    }
                }).then(response => response.json())
                    .then(data => {
                        window.location.replace("/home");
                    })


            }

        })


    }
})

const inputFile = document.getElementById('etapa-perfil-foto');
const fileDescription = document.getElementById('etapa-perfil-foto-de-perfil-descricao');
const previewImage = document.getElementById("etapa-perfil-foto-previsu");


inputFile.addEventListener('change', (event) => {
    const file = event.target.files[0];

    console.log(file);
    if (file) {

        fileDescription.textContent = file.name;


        const fileReader = new FileReader();
        fileReader.onload = () => {
            previewImage.src = fileReader.result;
        };
        fileReader.readAsDataURL(file);
    } else {
        fileDescription.textContent = 'Nenhuma imagem selecionada';
        previewImage.src = '';
    }
});

goBackBtn.addEventListener("click", (e) => {
    counterStep--;
    if (counterStep == 0) {
        goBackBtn.disabled = true;
        goBackBtn.style.display = "none";
        etapaPerfilBtnsDiv.style.justifyContent = "flex-end";
        circlesDivChild[1].style.backgroundColor = "#bbbbbb";
        circlesDivChild[0].style.backgroundColor = "#198CF8";
        etapaPerfilConteudo1.style.display = "flex";
        etapaPerfilConteudo2.style.display = "none";
    } else if (counterStep == 1) {
        etapaPerfilBtnsDiv.style.justifyContent = "space-between";
        circlesDivChild[1].style.backgroundColor = "#198CF8";
        circlesDivChild[2].style.backgroundColor = "#bbbbbb";
        etapaPerfilConteudo2.style.display = "block";
        etapaPerfilConteudo3.style.display = "none";
        continueBtn.textContent = "Continuar"
    }
})

//fazer o front end de pegar as imagens