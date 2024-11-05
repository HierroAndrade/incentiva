const nextBtn = document.getElementById("criacao-proximo");
const pjName = document.getElementById("criacao-pj-name");
const pjQuickDesc = document.getElementById("criacao-pj-quick-des");
const pjLocalization = document.getElementById("criacao-pj-localization");
const pjField = document.getElementById("criacao-pj-field");
const pjSchool = document.getElementById("criacao-pj-college-school");
const pjStatus = document.getElementById("criacao-pj-status");
const pjGoal = document.getElementById("criacao-pj-goal");
const pjTechniques = document.getElementById("criacao-pj-techniques");
const pjReason = document.getElementById("criacao-pj-why");
const pjSocietyImpacts = document.getElementById("criacao-pj-impacts");
const pjTypeOfProj = document.getElementById("criacao-pj-tipo-de-projeto");
const pjProgress = document.getElementById("criacao-pj-progress");
const pjDetalhamento = document.getElementById("criacao-pj-detalhamento");
const pjBackgroundImg = document.getElementById("criacao-pj-back-img");
const pjLogoImg = document.getElementById("criacao-pj-logo-img");
const divPostHome = document.getElementById("criacao-post-home");
const divKnowMore = document.getElementById("criacao-saiba-mais");
const goBackBtn = document.getElementById("criacao-saiba-mais-voltar");
const endUpCreationBtn = document.getElementById("criacao-saiba-mais-finalizar");
const modalError = document.getElementById("criacao-modal-error");
const modalAddMember = document.getElementById("criacao-modal-adicionar-membro");
const modalErrorOkBtn = document.getElementById("criacao-modal-error-ok")
const modalFecharAddmember = document.getElementById("criacao-modal-add-membro-fechar-btn")
const modalAddMemberBtn = document.getElementById("criacao-modal-add-membro-add-btn")
const addMemberBtn = document.getElementById("criacao-add-team-member");
const modalAddMemberInput = document.getElementById("criacao-add-member-input");
const addLinkBtn = document.getElementById("criacao-links-adicionar-link");
let pixKey;

function applyNumberInputLimit(inputElement, maxLength) {
    inputElement.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    });
}

applyNumberInputLimit(document.getElementById("cpf-part-1"), 3);
applyNumberInputLimit(document.getElementById("cpf-part-2"), 3);
applyNumberInputLimit(document.getElementById("cpf-part-3"), 3);
applyNumberInputLimit(document.getElementById("cpf-part-4"), 2);

function addProjectPriceField() {
    // Verifica se o campo já existe para evitar duplicação
    if (document.getElementById("criacao-preco-projeto")) {
        return;
    }

    // Cria o elemento de input para o preço do projeto
    const priceDiv = document.createElement("div");
    priceDiv.className = "criacao-pjbox";
    priceDiv.id = "criacao-preco-projeto";
    priceDiv.innerHTML = `
        <h2>Preço do Projeto</h2>
        <p>Defina o preço do seu projeto concluído.</p>
        <input type="number" id="criacao-projeto-preco" placeholder="R$" min="0" >
    `;

    ;


    // Insere o novo campo antes da div do Pix
    const pixDiv = document.getElementById("criacao-pix");
    pixDiv.parentNode.insertBefore(priceDiv, pixDiv);

    document.getElementById("criacao-projeto-preco").addEventListener("input", () => {
        document.getElementById("criacao-projeto-preco").value = document.getElementById("criacao-projeto-preco").value.replace(/\D/g, "").slice(0, 6);
    });
}

addLinkBtn.addEventListener("click", (e) => {
    const criacaoLinksContent = document.getElementById("criacao-links-content");

    // Criando o contêiner principal para o item de link
    const linkItem = document.createElement("div");
    linkItem.classList.add("criacao-links-item");

    // Criando o campo para o nome do link
    const linkNameInput = document.createElement("input");
    linkNameInput.type = "text";
    linkNameInput.classList.add("criacao-links-item-nome-link");
    linkNameInput.placeholder = "Nome do link";

    // Criando o campo para o link
    const linkInput = document.createElement("input");
    linkInput.type = "text";
    linkInput.classList.add("criacao-links-item-link");
    linkInput.placeholder = "Link";

    // Criando o botão para remover o link
    const removeBtn = document.createElement("button");
    removeBtn.classList.add("criacao-remove-item-link");
    removeBtn.addEventListener("click", () => removeOtherLink(removeBtn)); // Adiciona o evento para remover o link

    // Criando o ícone de fechar para o botão de remover
    const closeIcon = document.createElement("span");
    closeIcon.classList.add("material-symbols-outlined");
    closeIcon.textContent = "close";

    // Estrutura de elementos: Adiciona o ícone de fechar ao botão de remoção e os elementos ao linkItem
    removeBtn.appendChild(closeIcon);
    linkItem.appendChild(linkNameInput);
    linkItem.appendChild(linkInput);
    linkItem.appendChild(removeBtn);

    // Adiciona o novo linkItem ao contêiner
    criacaoLinksContent.appendChild(linkItem);
});

function removeOtherLink(button) {
    button.parentElement.remove();
}

modalAddMemberBtn.addEventListener("click", async (e) => {

    authFetchJson("/user/get", "GET").then((response) => {
        console.log(response.status);
        if ((response.status == 401 || response.status == 403)) {
            window.location.replace("/login");
        } else {
            console.log(response);
            response.json().then(async (data) => {

                if (modalAddMemberInput.value == data.user.username) {
                    document.getElementById("criacao-modal-member-error").textContent = "Você não pode se adicionar"
                } else {


                    const criacaoTeamMembers = document.getElementsByClassName("criacao-team-member-item");

                    if (criacaoTeamMembers) {
                        let ok = true;
                        Array.from(criacaoTeamMembers).forEach((el) => {
                            console.log(el, " a ", modalAddMemberInput.value)
                            if (el.getAttribute("username") == modalAddMemberInput.value) {
                                ok = false;
                            }
                        })

                        if (ok) {
                            const json = await fetch("/user/get/" + modalAddMemberInput.value).then(async response => await response.json())
                            if (json.msg) {
                                document.getElementById("criacao-modal-member-error").textContent = json.msg;
                            } else {
                                document.getElementById("criacao-team-member-list").innerHTML += `
                                <div class="criacao-team-member-item" memberId=${json.user._id} username=${json.user.username} logo=${json.user.profile_img}>
                                                <p>#${json.user.username}</p>
                                                <button class="criacao-remove-this-member" onclick="removeMember(this)">
                                                    <span class="material-symbols-outlined">
                                                        delete
                                                    </span>
                                                </button>
                                            </div > `

                                document.getElementById("criacao-modal-adicionar-membro").close();
                            }
                        } else {
                            document.getElementById("criacao-modal-member-error").textContent = "Membro já adicionado.";
                        }
                    }



                }

            })
        }
    })




})

addMemberBtn.addEventListener("click", (e) => {

    modalAddMember.showModal();

})

modalFecharAddmember.addEventListener("click", (e) => {
    document.getElementById("criacao-modal-adicionar-membro").close();
})


function removeMember(btn) {
    btn.parentNode.remove()
}

modalErrorOkBtn.addEventListener("click", () => {
    document.getElementById("criacao-modal-error").close();

})
nextBtn.addEventListener("click", (e) => {

    if (!pjName.value || !pjQuickDesc.value || !pjBackgroundImg.files[0] || !pjLogoImg.files[0]) {
        document.getElementById("criacao-msg-error").textContent = "Preencha todos os campos!"
        modalError.showModal()
    } else {

        fetch("project/getAll")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar os projetos: ' + response.statusText);
                }
                return response.json();
            })
            .then(projects => {
                let ok = true;
                projects.forEach((p) => {
                    if (p.name == pjName.value) {
                        document.getElementById("criacao-msg-error").textContent = "Já existe um Projeto com o nome " + pjName.value
                        modalError.showModal()
                        ok = false;
                    }
                })

                if (ok) {
                    divKnowMore.style.display = ""

                    if (pjStatus.value == "Concluído") {
                        document.getElementById("criacao-pj-progress-number").textContent = 100 + "%"
                        pjProgress.max = 100;
                        pjProgress.value = 100;
                        pjProgress.disabled = true;

                        addProjectPriceField();
                    } else {
                        document.getElementById("criacao-pj-progress-number").textContent = 50 + "%"
                        pjProgress.value = 50;
                        pjProgress.disabled = false;
                        pjProgress.max = 99;
                        pjProgress.addEventListener("change", (e) => {
                            document.getElementById("criacao-pj-progress-number").textContent = e.target.value + "%";
                        })
                    }

                    divPostHome.style.display = "none"
                }

            })


    }
});


goBackBtn.addEventListener("click", (e) => {
    divKnowMore.style.display = "none"
    divPostHome.style.display = ""
})

pjName.addEventListener("input", (e) => {
    document.getElementsByClassName("criacao-previsu-project-name-style")[0].textContent = e.target.value;
})

pjQuickDesc.addEventListener("input", (e) => {
    document.getElementsByClassName("criacao-previsu-post-desc-box")[0].textContent = e.target.value;
})

document.getElementsByClassName("criacao-previsu-infos-style")[0].textContent = pjField.value;
pjField.addEventListener("change", (e) => {
    document.getElementsByClassName("criacao-previsu-infos-style")[0].textContent = e.target.value;
})

document.getElementsByClassName("criacao-previsu-infos-style")[1].textContent = pjLocalization.value;
pjLocalization.addEventListener("change", (e) => {
    document.getElementsByClassName("criacao-previsu-infos-style")[1].textContent = e.target.value;
})

document.getElementsByClassName("criacao-previsu-infos-style")[2].textContent = pjStatus.value;
pjStatus.addEventListener("change", (e) => {
    document.getElementsByClassName("criacao-previsu-infos-style")[2].textContent = e.target.value;
})

document.getElementsByClassName("criacao-previsu-infos-style")[3].textContent = pjSchool.value;
pjSchool.addEventListener("change", (e) => {
    document.getElementsByClassName("criacao-previsu-infos-style")[3].textContent = e.target.value;
})

const backgImgFileDescription = document.getElementById('criacao-pj-back-name');
const backImgPreviewImage = document.getElementsByClassName("criacao-previsu-project-img-style")[0];

pjBackgroundImg.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Verifica se o arquivo é uma imagem
        if (!file.type.startsWith('image/')) {
            document.getElementById("criacao-msg-error").textContent = "Por favor, selecione um arquivo de imagem válido"
            modalError.showModal()
            backgImgFileDescription.textContent = 'Nenhuma imagem selecionada';
            backImgPreviewImage.src = '';
            return;
        }

        backgImgFileDescription.textContent = file.name;

        const fileReader = new FileReader();
        fileReader.onload = () => {
            backImgPreviewImage.src = fileReader.result;
        };
        fileReader.readAsDataURL(file);
    } else {
        backgImgFileDescription.textContent = 'Nenhuma imagem selecionada';
        backImgPreviewImage.src = '';
    }
});

const logoFileDescription = document.getElementById('criacao-pj-logo-name');
const logoPreviewImage = document.getElementsByClassName("criacao-previsu-avatar-project-img-style")[0];

pjLogoImg.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Verifica se o arquivo é uma imagem
        if (!file.type.startsWith('image/')) {
            document.getElementById("criacao-msg-error").textContent = "Por favor, selecione um arquivo de imagem válido"
            modalError.showModal()
            logoFileDescription.textContent = 'Nenhuma imagem selecionada';
            logoPreviewImage.src = '';
            return;
        }

        logoFileDescription.textContent = file.name;

        const fileReader = new FileReader();
        fileReader.onload = () => {
            logoPreviewImage.src = fileReader.result;
            document.getElementById("p-sm-know-more-pj-logo").src = fileReader.result;
        };
        fileReader.readAsDataURL(file);
    } else {
        logoFileDescription.textContent = 'Nenhuma imagem selecionada';
        logoPreviewImage.src = '';
    }
});

const extraImgFileInput = document.getElementById("criacao-pj-extra-img");
const extraImgfileNameDisplay = document.getElementById("criacao-pj-extra-img-name");
const extraImgpreviewContainer = document.getElementById("criacao-preview-container");
const extraImgmaxFiles = 10;
let selectedFiles = [];

extraImgFileInput.addEventListener("change", () => {
    const files = Array.from(extraImgFileInput.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    // Verifica se todos os arquivos são imagens
    if (validFiles.length !== files.length) {
        document.getElementById("criacao-msg-error").textContent = "Por favor, selecione um arquivo de imagem válido"
        modalError.showModal()
        extraImgFileInput.value = "";
        return;
    }

    if (validFiles.length + selectedFiles.length > extraImgmaxFiles) {
        document.getElementById("criacao-msg-error").textContent = `Você só pode selecionar até ${extraImgmaxFiles} imagens.`;
        modalError.showModal();
        extraImgFileInput.value = "";
        return;
    }

    validFiles.forEach(file => selectedFiles.push(file));
    updatePreview();
    extraImgFileInput.value = "";
});
function updatePreview() {
    extraImgpreviewContainer.innerHTML = "";
    selectedFiles.forEach((file, index) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const imgElement = document.createElement("img");
            imgElement.classList.add("criacao-saiba-mais-extra-img-item");
            imgElement.src = fileReader.result;
            imgElement.style.marginRight = "10px";


            const removeButton = document.createElement("button");
            removeButton.classList.add("criacao-saiba-mais-extra-img-item-remove-btn");
            removeButton.textContent = "X";
            removeButton.style.display = "block";
            removeButton.onclick = () => removeImage(index);

            const container = document.createElement("div");
            container.classList.add("criacao-saiba-mais-extra-img-item-div");
            container.appendChild(imgElement);
            container.appendChild(removeButton);
            extraImgpreviewContainer.appendChild(container);
        };
        fileReader.readAsDataURL(file);
    });

    extraImgfileNameDisplay.textContent = `${selectedFiles.length} de ${extraImgmaxFiles} `;
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    updatePreview();
}


endUpCreationBtn.addEventListener("click", async () => {

    let selectPix = document.getElementById("criacao-tipo-pix")
    let prePixKey = "";
    if (selectPix.value == "cpf") {
        pixKey = undefined;
        prePixKey = document.getElementById("cpf-part-1").value + document.getElementById("cpf-part-2").value + document.getElementById("cpf-part-3").value + document.getElementById("cpf-part-4").value
        if (prePixKey.length == 11) {
            pixKey = prePixKey;
        } else {
            document.getElementById("criacao-msg-error").textContent = "Digite um CPF válido!"
            modalError.showModal()
            return
        }
    } else if (selectPix.value == "telefone") {
        pixKey = undefined;
        prePixKey = document.getElementById("number-part-1").value + document.getElementById("number-part-2").value + document.getElementById("number-part-3").value
        if (prePixKey.length == 11) {
            pixKey = prePixKey;
        } else {
            document.getElementById("criacao-msg-error").textContent = "Digite um número telefone válido!"
            modalError.showModal()
            return
        }
    } else if (selectPix.value == "email") {
        pixKey = undefined;
        prePixKey = document.getElementById("input-email-pix").value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(prePixKey)) {
            pixKey = prePixKey;
        } else {
            document.getElementById("criacao-msg-error").textContent = "Digite um email válido!"
            modalError.showModal()
            return
        }
    } else if (selectPix.value == "aleatoria") {
        pixKey = undefined;
        pixKey = document.getElementById("input-chave-aleatoria-pix").value;
    }


    if (!pjGoal.value || !pjTechniques.value || !pjReason.value || !pjSocietyImpacts.value || !pjDetalhamento.value || !pjBackgroundImg.files[0] || !pjLogoImg.files[0] || !document.getElementsByClassName("criacao-links-item")[0].children[1].value || !pixKey) {

        document.getElementById("criacao-msg-error").textContent = `Algum campo não foi preenchido`
        modalError.showModal()
        return;
    }


    let membersId = [];
    let membersHtmlArray = Array.from(document.getElementsByClassName("criacao-team-member-item"));

    membersHtmlArray.forEach((e) => {
        membersId.push(e.getAttribute("memberId"));
    });



    let links = [];
    let linksHtmlArray = Array.from(document.getElementsByClassName("criacao-links-item"));
    linksHtmlArray.forEach((e) => {
        let name = e.children[0].value; // O valor do input de nome do link
        let link = e.children[1].value; // O valor do input do link

        // Adiciona o link ao array como um objeto com as propriedades 'name' e 'link'
        links.push({ name, link });
    });



    const precoInput = document.getElementById("criacao-projeto-preco");
    let projectData;
    if (precoInput) {
        if (!precoInput.value) {
            document.getElementById("criacao-msg-error").textContent = `Insira o valor do projeto`
            modalError.showModal()
            return;
        } else {
            projectData = {
                name: pjName.value,
                quick_description: pjQuickDesc.value,
                localization: pjLocalization.value,
                field: pjField.value,
                instituition: pjSchool.value,
                status: pjStatus.value,
                type_of_project: pjTypeOfProj.value,
                goal: pjGoal.value,
                preco: Number(precoInput.value),
                team_members: membersId,
                pix: pixKey,
                links,
                knowledge_used: pjTechniques.value,
                reason_for_creation: pjReason.value,
                society_impacts: pjSocietyImpacts.value,
                progress: pjProgress.value,
                extra_informations: pjDetalhamento.value
            };

        }
    } else {
        projectData = {
            name: pjName.value,
            quick_description: pjQuickDesc.value,
            localization: pjLocalization.value,
            field: pjField.value,
            instituition: pjSchool.value,
            status: pjStatus.value,
            type_of_project: pjTypeOfProj.value,
            goal: pjGoal.value,
            team_members: membersId,
            pix: pixKey.value,
            links,
            knowledge_used: pjTechniques.value,
            reason_for_creation: pjReason.value,
            society_impacts: pjSocietyImpacts.value,
            progress: pjProgress.value,
            extra_informations: pjDetalhamento.value
        };
    }


    try {

        const response = await fetch("project/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")} `
            },
            body: JSON.stringify(projectData)
        });

        const result = await response.json();

        if (response.ok) {
            const projectId = result.projeto._id;
            await attachImages(projectId);
        } else {
            document.getElementById("criacao-msg-error").textContent = result.message || "Erro ao criar o projeto."
            modalError.showModal()
        }
    } catch (error) {
        console.error("Erro ao criar o projeto:", error);
        document.getElementById("criacao-msg-error").textContent = "Erro ao criar o projeto.";
        modalError.showModal();
    }
});

async function attachImages(projectId) {
    if (!projectId) {
        document.getElementById("criacao-msg-error").textContent = "Projeto não encontrado.";
        modalError.showModal();
        return;
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("imagemFundo", pjBackgroundImg.files[0]);
    formData.append("imagemLogo", pjLogoImg.files[0]);

    selectedFiles.forEach((file) => {
        formData.append("imagensExtras", file);
    });

    try {

        const response = await fetch("project/attachImages", {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")} `
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById("criacao-msg-error").textContent = "Projeto e imagens anexadas com sucesso!";
            modalError.showModal();
            window.location.replace("/home")
        } else {
            document.getElementById("criacao-msg-error").textContent = result.message || "Erro ao anexar as imagens.";
            modalError.showModal();

        }
    } catch (error) {
        console.error("Erro ao anexar as imagens:", error);
        document.getElementById("criacao-msg-error").textContent = result.message || "Erro ao anexar as imagens.";
        modalError.showModal();

    }
}


document.getElementById("criacao-saiba-mais-previsualizar").addEventListener("click", () => {


    const projetoNome = document.getElementById("criacao-pj-name").value;
    const projetoStatus = document.getElementById("criacao-pj-status").value;
    const projetoTipo = document.getElementById("criacao-pj-tipo-de-projeto").value;
    const projetoArea = document.getElementById("criacao-pj-field").value;
    const projetoLocalizacao = document.getElementById("criacao-pj-localization").value;
    const projetoInstituicao = document.getElementById("criacao-pj-college-school").value;
    const projetoDescricao = document.getElementById("criacao-pj-quick-des").value;
    const objetivo = document.getElementById("criacao-pj-goal").value;
    const tecnicas = document.getElementById("criacao-pj-techniques").value;
    const motivo = document.getElementById("criacao-pj-why").value;
    const impactos = document.getElementById("criacao-pj-impacts").value;
    const detalhamento = document.getElementById("criacao-pj-detalhamento").value;
    const progresso = document.getElementById("criacao-pj-progress").value;



    // document.getElementById("p-sm-know-more-pj-progress-show-percentage").style.width = ((progresso / 100) * 600) + "px"

    const progressBar = document.getElementById("p-sm-know-more-pj-progress-show");
    const progressFill = document.getElementById("p-sm-know-more-pj-progress-show-percentage");

    const updateProgress = (progresso) => {
        if (progressBar.offsetWidth > 500) {
            progressFill.style.width = ((progresso / 100) * 600) + "px";

        }
        else {
            progressFill.style.width = ((progresso / 100) * 200) + "px";

        }
    };

    // Exemplo de uso:

    document.getElementById("p-sm-know-more-pj-progress-number").textContent = progresso + "%"
    document.getElementById("p-sm-know-more-pj-name").textContent = projetoNome;
    document.getElementById("p-sm-know-more-pj-status-value").textContent = projetoStatus;
    document.getElementById("p-sm-know-more-pj-type-of-proj").textContent = projetoTipo;
    document.getElementById("p-sm-know-more-pj-field").textContent = projetoArea;
    document.getElementById("p-sm-know-more-pj-localization").textContent = projetoLocalizacao;
    document.getElementById("p-sm-know-more-pj-college").textContent = projetoInstituicao;
    document.getElementById("p-sm-know-more-pj-quick-desc").textContent = projetoDescricao;
    document.getElementById("p-sm-know-more-detalhamento").textContent = detalhamento;

    document.querySelector("#p-sm-know-more-pj-questions .p-sm-know-more-question:nth-of-type(1) p").textContent = objetivo;
    document.querySelector("#p-sm-know-more-pj-questions .p-sm-know-more-question:nth-of-type(2) p").textContent = tecnicas;
    document.querySelector("#p-sm-know-more-pj-questions .p-sm-know-more-question:nth-of-type(3) p").textContent = motivo;
    document.querySelector("#p-sm-know-more-pj-questions .p-sm-know-more-question:nth-of-type(4) p").textContent = impactos;


    const extraImagesContainer = document.getElementById("p-sm-extra-images-container");
    extraImagesContainer.innerHTML = "";
    selectedFiles.forEach(file => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            const imgElement = document.createElement("img");
            imgElement.src = event.target.result;
            imgElement.className = "p-sm-extra-image-style";
            extraImagesContainer.appendChild(imgElement);
        };
        fileReader.readAsDataURL(file);
    });

    document.getElementById("criacao-pre-visualizar-sm").showModal();
    updateProgress(document.getElementById("criacao-pj-progress").value);
    document.getElementById("p-sm-know-more-content-btn-fechar").addEventListener("click", (e) => {
        document.getElementById("criacao-pre-visualizar-sm").close();
    })
});

function atualizarPlaceholder() {




    const selectTipoPix = document.getElementById('criacao-tipo-pix');
    const inputPixValue = document.getElementById('criacao-projeto-pix-value');
    const changeInputModelDiv = document.getElementById('criacao-change-input-model');

    switch (selectTipoPix.value) {
        case 'cpf':
            changeInputModelDiv.innerHTML = `
            <div id="customized-cpf"><input type="text" id="cpf-part-1" autocomplete="off"><span>.</span><input type="text"
                            id="cpf-part-2" autocomplete="off"><span>.</span><input type="text" id="cpf-part-3" autocomplete="off"><span>-</span>
                        <input type="text" id="cpf-part-4" autocomplete="off">
            </div>
            `

            applyNumberInputLimit(document.getElementById("cpf-part-1"), 3);
            applyNumberInputLimit(document.getElementById("cpf-part-2"), 3);
            applyNumberInputLimit(document.getElementById("cpf-part-3"), 3);
            applyNumberInputLimit(document.getElementById("cpf-part-4"), 2);
            break;
        case 'telefone':
            changeInputModelDiv.innerHTML = `
            <div id="customized-input-telefone">
                        <span>(</span><input type="text" id="number-part-1" autocomplete="off"><span>)</span><input type="text"
                          id="number-part-2" autocomplete="off"><span>-</span><input type="text" id="number-part-3" autocomplete="off">
            </div>
            `
            applyNumberInputLimit(document.getElementById("number-part-1"), 2);
            applyNumberInputLimit(document.getElementById("number-part-2"), 5);
            applyNumberInputLimit(document.getElementById("number-part-3"), 4);
            break;
        case 'email':
            changeInputModelDiv.innerHTML = `
           
                        <input type="email" id="input-email-pix" maxlength="50" placeholder="email@email.com">
            
            `
            break;
        case 'aleatoria':
            changeInputModelDiv.innerHTML = `
            
                        <input type="text" id="input-chave-aleatoria-pix" maxlength="36" placeholder="Chave Aleatória">
           
            `
            break;
    }

    // Limpar o valor do input ao mudar o tipo de chave
    inputPixValue.value = '';
}