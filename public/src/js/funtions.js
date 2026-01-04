const diasPorMes = {
    1: 28,
    2: 56,
    3: 84
};
const phoneInput = document.getElementById('phone');

const warrantyDisplay = document.getElementById("warrantyDisplay");
const changeDateStart = document.getElementById("startDate");
const changeDateEnd = document.getElementById("endDate");

const btnConsult = document.getElementById("btnConsult");
const btnConsultMail = document.getElementById("btnConsultMail");
const btn_renew_rev = document.getElementById("btn_renew_rev");

const divSearch = document.getElementById("divSearch");
const divSearchMail = document.getElementById("divSearchMail");
const divProducts = document.getElementById("divProducts");

//EVENTS//
phoneInput.addEventListener('paste', (event) => {
    event.preventDefault();

    const clipboardData = event.clipboardData || window.clipboardData;
    let pastedData = clipboardData.getData('text');

    pastedData = pastedData.replace(/\s+/g, '').replace(/^\+52/, '');

    phoneInput.value = pastedData;
});

changeDateStart.addEventListener("change", () => {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    if (!isNaN(startDate) && !isNaN(endDate)) { // Verificar que ambas fechas sean válidas
        const diferenciaEnMilisegundos = endDate - startDate;
        const diferenciaEnDias = diferenciaEnMilisegundos / (1000 * 60 * 60 * 24);
        warrantyDisplay.innerHTML = `Diferencia en días: ${diferenciaEnDias}`;
    } else {
        warrantyDisplay.innerHTML = `Por favor, selecciona ambas fechas.`;
    }
});

changeDateEnd.addEventListener("change", () => {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    if (!isNaN(startDate) && !isNaN(endDate)) { // Verificar que ambas fechas sean válidas
        const diferenciaEnMilisegundos = endDate - startDate;
        const diferenciaEnDias = diferenciaEnMilisegundos / (1000 * 60 * 60 * 24);
        warrantyDisplay.innerHTML = `Diferencia en días: ${diferenciaEnDias}`;
    } else {
        warrantyDisplay.innerHTML = `Por favor, selecciona ambas fechas.`;
    }
});

btnConsult.addEventListener("click", (event) => {
    divSearch.style.display = "block";
    divSearchMail.style.display = "none";
    divProducts.style.display = "none"
});

btnConsultMail.addEventListener("click", (event) => {
    divSearchMail.style.display = "block";
    divSearch.style.display = "none"
    divProducts.style.display = "none"
});

btn_renew_rev.addEventListener("click", (event) => {
window.location.href = "renew.html";
})

searchInput.addEventListener('paste', (event) => {

    event.preventDefault();

    const clipboardData = event.clipboardData || window.clipboardData;
    let pastedData = clipboardData.getData('text');

    pastedData = pastedData.replace(/\s+/g, '').replace(/^\+52/, '');

    searchInput.value = pastedData;
});

function differenceDays(dateArgs1, dateArgs2) {
    // Divide las fechas por "/" y convierte a formato ISO (YYYY-MM-DD)
    const partsDate1 = dateArgs1.split('/');
    const partsDate2 = dateArgs2.split('/');

    const date1 = new Date(`${partsDate1[2]}-${partsDate1[1]}-${partsDate1[0]}`);
    const date2 = new Date(`${partsDate2[2]}-${partsDate2[1]}-${partsDate2[0]}`);

    const differenceMilliseconds = Math.abs(date1 - date2);

    // Convierte la diferencia a días
    return Math.floor(differenceMilliseconds / (1000 * 60 * 60 * 24));
}

// Cuando se selecciona un radio
document.querySelectorAll('input[name="meses"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const meses = parseInt(e.target.value);
        const diasExtra = diasPorMes[meses];

        const hoy = new Date();
        const endDate = new Date(hoy);
        endDate.setDate(hoy.getDate() + diasExtra);

        const startISO = hoy.toISOString().split('T')[0];
        const endISO = endDate.toISOString().split('T')[0];

        changeDateStart.value = startISO;
        changeDateEnd.value = endISO;

        const startFormatted = formatToDDMMYYYY(startISO);
        const endFormatted = formatToDDMMYYYY(endISO);

        const dias = differenceDays(startFormatted, endFormatted);
        warrantyDisplay.innerHTML = `Diferencia en días: ${dias}`;
    });
});

// Convierte yyyy-mm-dd a dd/mm/yyyy
function formatToDDMMYYYY(fechaISO) {
    const [yyyy, mm, dd] = fechaISO.split('-');
    return `${dd}/${mm}/${yyyy}`;
}