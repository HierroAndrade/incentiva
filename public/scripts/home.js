
const modalError = document.getElementById("criacao-modal-error");
const modalErrorOkBtn = document.getElementById("criacao-modal-error-ok")

modalErrorOkBtn.addEventListener("click", () => {
    document.getElementById("criacao-modal-error").close();

})



const homePostsDiv = document.getElementById("home-posts");
let homePostsIds = 0;
let likedProjects = [];

fetch("project/getAll")
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar os projetos: ' + response.statusText);
        }
        return response.json();
    })
    .then(projects => {

        console.log(projects)
        projects.forEach(pj => {

            console.log(pj.likedBy)
            if (pj.likedBy.length > 0) {
                addProject(pj._id, pj.name, pj.quick_description, pj.field, pj.localization, pj.status, pj.instituition, pj.logo_img, pj.background_img, pj.likedBy.length)
            } else {
                addProject(pj._id, pj.name, pj.quick_description, pj.field, pj.localization, pj.status, pj.instituition, pj.logo_img, pj.background_img, 0)
            }
        });

        document.querySelectorAll(".home-see-more-box").forEach((button) => {
            button.addEventListener("click", () => {
                const projectId = button.closest(".home-posts-style").getAttribute("projectId");
                if (projectId) {
                    window.location.href = `/projetos/saiba-mais/${projectId}`;
                }
            });
        });

        fetch('/user/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then((response => response.json())).then(data => {
            likedProjects = data.user.projects_liked;

            const likeButtons = document.querySelectorAll(".home-like-style");

            likeButtons.forEach(button => {
                const projectId = button.parentElement.parentElement.parentElement.getAttribute('projectid');
                if (likedProjects.includes(projectId)) {
                    // Projeto já curtido, altera o estilo do botão para curtido
                    button.style.color = "#198CF8";
                    button.children[0].style.color = "#198CF8";
                    button.setAttribute("liked", "liked");
                } else {
                    // Projeto não curtido, estilo padrão
                    button.style.color = "#222222";
                    button.children[0].style.color = "#222222";
                    button.setAttribute("liked", "noliked");
                }
            });
        })



    })
    .catch(error => {
        console.error('Erro ao buscar os projetos:', error);
    });



function likePost(btn, projectId) {
    if (btn.getAttribute("liked") == "noliked") {
        // Enviar requisição de like


        fetch('/project/like', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ projectId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Atualiza o estado do botão para curtido
                    btn.style.color = "#198CF8";
                    btn.children[0].style.color = "#198CF8";
                    btn.children[1].innerText = parseInt(btn.children[1].innerText) + 1
                    btn.setAttribute("liked", "liked");
                    console.log("O projeto foi curtido pelo usuário");

                    fetch('/user/like', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({ projectId })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                console.log("O usuário curtiu o projeto");
                            } else {
                                console.error('Erro ao USUÁRIO curtir o projeto:', data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao curtir o projeto:', error);
                        });


                } else {
                    console.error('Erro ao curtir o projeto:', data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao curtir o projeto:', error);
            });


    } else if (btn.getAttribute("liked") == "liked") {
        // Enviar requisição de dislike

        fetch('/project/dislike', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ projectId })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    console.log("O projeto foi descurtido pelo usuário")

                    btn.style.color = "#222222";
                    btn.children[0].style.color = "#222222";
                    btn.setAttribute("liked", "noliked");
                    btn.children[1].innerText = parseInt(btn.children[1].innerText) - 1
                    fetch('/user/dislike', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({ projectId })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                console.log("O usuário descurtiu o projeto")
                            } else {
                                console.error('Erro ao descurtir o projeto:', data.message);
                            }
                        })
                        .catch(error => {
                            console.error('Erro ao descurtir o projeto:', error);
                        });
                } else {
                    console.error('Erro ao descurtir o projeto:', data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao descurtir o projeto:', error);
            });
    }
}



function addProject(pjId, pjNome, pjQuickDesc, pjField, pjLocal, pjStatus, pjSchool, pjLogoImgSrc, pjBackImgSrc, pjLikes) {
    homePostsIds++;
    homePostsDiv.innerHTML += `
    <div class="home-posts-style" id="home-post-${homePostsIds}" projectId=${pjId}>
                    <div class="home-project-img-box">
                        <img src=${pjBackImgSrc} class="home-project-img-style">
                    </div>

                    <div class="home-post-short-info-box">
                        <div class="home-short-info-box">
                            <img src=${pjLogoImgSrc} class="home-avatar-project-img-style">
                            <div class="home-some-info">
                                <div class="home-project-name-style">
                                    ${pjNome}
                                </div>
                                <div class="home-type-location-instituicao-status-box">
                                    <div class="home-infos-style">
                                        ${pjField}

                                    </div>
                                    &bullet;
                                    <div class="home-infos-style">  ${pjLocal} </div>
                                    &bullet;
                                    <div class="home-infos-style">  ${pjStatus}</div>
                                    &bullet;
                                    <div class="home-infos-style">  ${pjSchool}</div>
                                </div>
                            </div>
                        </div>

                        <div class="home-share-btn-style" onclick="copyLink(this)">
                            <span class="material-symbols-outlined">
                                link
                            </span>
                        </div>
                    </div>
                    <div class="home-post-desc-box">
                        <p> ${pjQuickDesc}</p>
                    </div>
                    <div class="home-post-interactions-box">
                        <div class="home-main-interactions-box">
                            <button class="home-like-style" liked="noliked" onclick="likePost(this, this.parentElement.parentElement.parentElement.getAttribute('projectid'))">
                                <span class="material-symbols-outlined">
                                    thumb_up
                                </span>
                                <strong class="home-likes-number">
                                    ${pjLikes}
                                </strong>
                            </button >
                            
                         
                        </div>
                        <div class="home-see-more-box">
                            <span>
                                Saiba Mais
                            </span>
                        </div>
                    </div>
                </div>
    `


}

function copyLink(btn) {
    const projectId = btn.parentElement.parentElement.getAttribute('projectid');
    const text = window.location.protocol + "//" + window.location.host + "/projetos/saiba-mais/" + projectId;

    navigator.clipboard.writeText(text).then(() => {

        document.getElementById("criacao-msg-error").textContent = "Link Copiado!"
        modalError.showModal()
    }).catch(err => {
        console.error("Erro ao copiar o texto: ", err);
    });
}



const searchInput = document.getElementById("home-search-input");
const homePostsDivision = document.getElementById("home-posts");

searchInput.addEventListener("keyup", (event) => {
    const query = event.target.value.trim();

    if (query) {
        // Busca projetos que correspondem ao termo de pesquisa
        fetch(`/project/search?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(projects => {
                homePostsDivision.innerHTML = ''; // Limpa projetos existentes

                projects.forEach(pj => {
                    addProject(
                        pj._id,
                        pj.name,
                        pj.quick_description,
                        pj.field,
                        pj.localization,
                        pj.status,
                        pj.instituition,
                        pj.logo_img,
                        pj.background_img,
                        pj.likedBy.length
                    );
                });

                document.querySelectorAll(".home-see-more-box").forEach((button) => {
                    button.addEventListener("click", () => {
                        const projectId = button.closest(".home-posts-style").getAttribute("projectId");
                        if (projectId) {
                            window.location.href = `/projetos/saiba-mais/${projectId}`;
                        }
                    });
                });
            })
            .catch(error => console.error('Erro ao buscar projetos:', error));
    } else {
        // Se o campo de pesquisa estiver vazio, buscar todos os projetos
        fetch('/project/getAll')
            .then(response => response.json())
            .then(projects => {
                homePostsDivision.innerHTML = ''; // Limpa projetos existentes

                projects.forEach(pj => {
                    addProject(
                        pj._id,
                        pj.name,
                        pj.quick_description,
                        pj.field,
                        pj.localization,
                        pj.status,
                        pj.instituition,
                        pj.logo_img,
                        pj.background_img,
                        pj.likedBy.length
                    );
                });

                document.querySelectorAll(".home-see-more-box").forEach((button) => {
                    button.addEventListener("click", () => {
                        const projectId = button.closest(".home-posts-style").getAttribute("projectId");
                        if (projectId) {
                            window.location.href = `/projetos/saiba-mais/${projectId}`;
                        }
                    });
                });
            })
            .catch(error => console.error('Erro ao buscar todos os projetos:', error));
    }
});


const editProfileBtn = document.getElementById("home-perfil-editar-btn").addEventListener("click", () => {
    document.getElementById("editar-perfil-modal").showModal()
    document.getElementById("close-edit-modal-btn").addEventListener("click", () => {
        document.getElementById("editar-perfil-modal").close()
    })
})



document.getElementById("edit-username").addEventListener("input", () => {
    document.getElementById("edit-username").value = document.getElementById("edit-username").value.replace(/[^a-zA-Z0-9À-ÿ.()'" _-]/g, "").slice(0, 14);
});

document.getElementById("edit-bio").addEventListener("input", () => {

    document.getElementById("edit-bio").value = document.getElementById("edit-bio").value.replace(/[^a-zA-ZÀ-ÿ0-9.,;!?()'" \-´`^~]/g, "").slice(0, 200);

})

const inputFile = document.getElementById('edit-perfil-foto');
const fileDescription = document.getElementById('edit-perfil-foto-de-perfil-descricao');
const previewImage = document.getElementById('edit-perfil-foto-previsu'); // Corrigido para o ID do <img>

inputFile.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        // Verifica se o arquivo é uma imagem
        if (file.type.startsWith('image/')) {
            fileDescription.textContent = file.name;

            const fileReader = new FileReader();
            fileReader.onload = () => {
                previewImage.src = fileReader.result; // Atribui ao src da imagem
            };
            fileReader.readAsDataURL(file);
        } else {
            fileDescription.textContent = 'Por favor, selecione um arquivo de imagem válido.';
            previewImage.src = ''; // Limpa a pré-visualização
            inputFile.value = ''; // Reseta o campo de input
        }
    } else {
        fileDescription.textContent = 'Nenhuma imagem selecionada';
        previewImage.src = '';
    }
});
