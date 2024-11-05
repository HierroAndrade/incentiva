
const modalError = document.getElementById("criacao-modal-error");
const modalErrorOkBtn = document.getElementById("criacao-modal-error-ok")

modalErrorOkBtn.addEventListener("click", () => {
    document.getElementById("criacao-modal-error").close();

})
const projectId = document.getElementById("saiba-mais-km").getAttribute("projectId");
let projectForUse;



const progressNumber = (parseInt(document.getElementById("p-sm-know-more-pj-progress-number").getAttribute("progress")))

const progressBar = document.getElementById("p-sm-know-more-pj-progress-show");
const progressFill = document.getElementById("p-sm-know-more-pj-progress-show-percentage");

const updateProgress = (progresso) => {
    const parentWidth = progressBar.offsetWidth;
    const maxWidth = parentWidth === 200 ? 200 : 600;
    progressFill.style.width = ((progresso / 100) * maxWidth) + "px";
};

// Exemplo de uso:
updateProgress(progressNumber);



document.getElementsByClassName("p-sm-style-clickable")[0].addEventListener("click", () => {
    document.getElementById("saiba-mais-integrantes").showModal();
})

document.getElementById("saiba-mais-fechar-integrantes-dialog-btn").addEventListener("click", () => {
    document.getElementById("saiba-mais-integrantes").close();
})


document.getElementsByClassName("p-sm-style-clickable")[1].addEventListener("click", () => {
    document.getElementById("saiba-mais-incentivos").showModal();
})

document.getElementById("saiba-mais-fechar-incentivos-dialog-btn").addEventListener("click", () => {
    document.getElementById("saiba-mais-incentivos").close();
})

if (!projectId) {
    console.error("projectId não encontrado");
} else {
    // Fazendo a requisição Fetch
    fetch(`/project/getById/${projectId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }
            return response.json();
        })
        .then((project) => {
            console.log("Projeto obtido:", project);
            projectForUse = project;


        })
        .catch((error) => {
            console.error("Erro ao buscar o projeto:", error);
        });
}



function iniciaIncentivo() {
    document.getElementById("transacao-etapa-inicial-incentivo").showModal();
}

function iniciaCompra() {
    document.getElementById("transacao-etapa-inicial-compra").showModal();
}


Array.from(document.getElementsByClassName("transacao-fechar-dialog-btn")).forEach((el) => {
    el.addEventListener("click", () => {
        el.parentElement.parentElement.close()
    })
})

let incentivoValue;




function getNumberObject(number) {
    if (!number)
        return;
    number = number.replaceAll(/[+\s()-]/g, "");
    let country = "+55";
    if (number.length >= 13) {
        country = "+" + number.substring(0, 2);
        number = number.substring(2);
    }
    else if (number.length < 11)
        return;
    let area = number.substring(0, 2);
    number = number.substring(2);
    if (number[0] != "9")
        return;

    return { country, area, number };

}

const inputElement = document.getElementById('incentivo-item-incentivo-input');

inputElement.addEventListener('input', function () {
    // Remove qualquer caractere que não seja um dígito e garante o limite de até 6 dígitos
    inputElement.value = inputElement.value.replace(/[^0-9]/g, '').slice(0, 6);
});

function applyNumberInputLimit(inputElement, maxLength) {
    inputElement.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, maxLength);
    });
}




applyNumberInputLimit(document.getElementById("number-part-1"), 2);
applyNumberInputLimit(document.getElementById("number-part-2"), 5);
applyNumberInputLimit(document.getElementById("number-part-3"), 4);
applyNumberInputLimit(document.getElementById("cpf-part-1"), 3);
applyNumberInputLimit(document.getElementById("cpf-part-2"), 3);
applyNumberInputLimit(document.getElementById("cpf-part-3"), 3);
applyNumberInputLimit(document.getElementById("cpf-part-4"), 2);

applyNumberInputLimit(document.getElementById("compra-number-part-1"), 2);
applyNumberInputLimit(document.getElementById("compra-number-part-2"), 5);
applyNumberInputLimit(document.getElementById("compra-number-part-3"), 4);
applyNumberInputLimit(document.getElementById("compra-cpf-part-1"), 3);
applyNumberInputLimit(document.getElementById("compra-cpf-part-2"), 3);
applyNumberInputLimit(document.getElementById("compra-cpf-part-3"), 3);
applyNumberInputLimit(document.getElementById("compra-cpf-part-4"), 2);

function trimInputs(inputs) {
    return inputs.map(input => input.trim());
}
function calcValidatorDigit(digits, weights) {
    const sum = digits
        .map((digit, index) => Number(digit) * weights[index])
        .reduce((sum, current) => sum + current);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
}
function validateCPF(cpf) {
    if (typeof cpf != "string")
        return false;
    cpf = cpf.replaceAll(".", "").replaceAll("-", "");

    const cpfArray = Array.from(cpf);

    if (cpfArray.length != 11 || cpfArray.every(c => c == cpf[0]))
        return false;

    const firstValidatorDigit = calcValidatorDigit(Array.from(cpf.substring(0, 9)), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    const secondValidatorDigit = calcValidatorDigit(Array.from(cpf.substring(0, 9) + firstValidatorDigit), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);

    return cpf.slice(9) == `${firstValidatorDigit}${secondValidatorDigit}`;
}
document.getElementById("incentivo-item-realizar-pagamento").addEventListener("click", async (e) => {
    e.preventDefault();

    // Pegando e limpando os valores
    let numeroTelefone = trimInputs([
        document.getElementById("number-part-1").value,
        document.getElementById("number-part-2").value,
        document.getElementById("number-part-3").value
    ]).join('');

    let nomeCompleto = document.getElementById("incentivo-item-nome-completo-input").value.trim();
    let email = document.getElementById("incentivo-item-e-mail-input").value.trim();
    let cpf = trimInputs([
        document.getElementById("cpf-part-1").value,
        document.getElementById("cpf-part-2").value,
        document.getElementById("cpf-part-3").value,
        document.getElementById("cpf-part-4").value
    ]).join('');
    let incentivo = document.getElementById("incentivo-item-incentivo-input").value.trim();

    // Verificação: caso algum campo esteja vazio após o trim






    if (!validateCPF(cpf)) {
        document.getElementById("criacao-msg-error").textContent = "CPF inválido!"
        modalError.showModal()
        return
    }

    let validatedNumber = getNumberObject(numeroTelefone)

    if (!validatedNumber) {
        document.getElementById("criacao-msg-error").textContent = "Número de telefone inválido!"
        modalError.showModal()
        return
    }

    if (!numeroTelefone || !nomeCompleto || !email || !cpf || !incentivo) {
        document.getElementById("criacao-msg-error").textContent = "Por favor, preencha todos os campos corretamente."
        modalError.showModal()
        return;
    }

    // Envio dos dados
    const response = await authFetchJson("/project/transacaoIncentivo", {
        method: "POST",
        body: JSON.stringify({
            projectId,
            value: Number(Number(incentivo).toFixed(2).replace(/[.,]/g, "")),
            customer: {
                phone: getNumberObject(numeroTelefone),
                name: nomeCompleto,
                email,
                tax_id: cpf
            }
        })
    });

    const json = await response.json();
    window.location.href = json.redirect_url;
});


document.getElementById("compra-item-nome-completo-input").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ.,;!?()'" -]/g, "").slice(0, 100);
});

document.getElementById("compra-item-nome-completo-input").addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ.,;!?()'" -]/g, "").slice(0, 100);
});


// Mesma lógica para o botão "compra-item-realizar-pagamento"
document.getElementById("compra-item-realizar-pagamento").addEventListener("click", async (e) => {
    e.preventDefault();

    let numeroTelefone = trimInputs([
        document.getElementById("compra-number-part-1").value,
        document.getElementById("compra-number-part-2").value,
        document.getElementById("compra-number-part-3").value
    ]).join('');

    let nomeCompleto = document.getElementById("compra-item-nome-completo-input").value.trim();
    let email = document.getElementById("compra-item-e-mail-input").value.trim();
    let cpf = trimInputs([
        document.getElementById("compra-cpf-part-1").value,
        document.getElementById("compra-cpf-part-2").value,
        document.getElementById("compra-cpf-part-3").value,
        document.getElementById("compra-cpf-part-4").value
    ]).join('');


    if (!validateCPF(cpf)) {
        document.getElementById("criacao-msg-error").textContent = "CPF inválido!"
        modalError.showModal()
        return
    }

    let validatedNumber = getNumberObject(numeroTelefone)

    if (!validatedNumber) {
        document.getElementById("criacao-msg-error").textContent = "Número de telefone inválido!"
        modalError.showModal()
        return
    }


    if (!numeroTelefone || !nomeCompleto || !email || !cpf) {
        document.getElementById("criacao-msg-error").textContent = "Por favor, preencha todos os campos corretamente."
        modalError.showModal()
        return;
    }

    const response = await authFetchJson("/project/transacaoCompra", {
        method: "POST",
        body: JSON.stringify({
            projectId,
            customer: {
                phone: getNumberObject(numeroTelefone),
                name: nomeCompleto,
                email,
                tax_id: cpf
            }
        })
    });

    const json = await response.json();
    window.location.href = json.redirect_url;
});
