const modalError = document.getElementById("criacao-modal-error");
const modalErrorOkBtn = document.getElementById("criacao-modal-error-ok")

modalErrorOkBtn.addEventListener("click", () => {
    document.getElementById("criacao-modal-error").close();

})


const pjBackgroundImg = document.getElementById("edicao-pj-back-img")
const backgImgFileDescription = document.getElementById('edicao-pj-back-name');
// const backImgPreviewImage = document.getElementsByClassName("edicao-previsu-project-img-style")[0];

pjBackgroundImg.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Verifica se o arquivo é uma imagem
        if (!file.type.startsWith('image/')) {

            document.getElementById("criacao-msg-error").textContent = "Por favor, selecione um arquivo de imagem válido"
            modalError.showModal()
            return;
        }

        backgImgFileDescription.textContent = file.name;

        const fileReader = new FileReader();
        fileReader.onload = () => {
            // backImgPreviewImage.src = fileReader.result;
        };
        fileReader.readAsDataURL(file);
    } else {
        backgImgFileDescription.textContent = 'Nenhuma imagem selecionada';
        // backImgPreviewImage.src = '';
    }
});

const pjLogoImg = document.getElementById("edicao-pj-logo-img")
const logoFileDescription = document.getElementById('edicao-pj-logo-name');
// const logoPreviewImage = document.getElementsByClassName("edicao-previsu-avatar-project-img-style")[0];

pjLogoImg.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Verifica se o arquivo é uma imagem
        if (!file.type.startsWith('image/')) {
            document.getElementById("criacao-msg-error").textContent = "Por favor, selecione um arquivo de imagem válido";
            modalError.showModal();
            return;
        }

        logoFileDescription.textContent = file.name;

        const fileReader = new FileReader();
        fileReader.onload = () => {
            // logoPreviewImage.src = fileReader.result;
            // document.getElementById("p-sm-know-more-pj-logo").src = fileReader.result;
        };
        fileReader.readAsDataURL(file);
    } else {
        logoFileDescription.textContent = 'Nenhuma imagem selecionada';
        // logoPreviewImage.src = '';
    }
});



