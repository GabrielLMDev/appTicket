import {
    setService,
    getServiceByNumber,
    getServiceByMail,
    updateService
} from './services/userServices.js';

import {
    sendService
} from './services/sendingService.js';


let filteredData;

const setOrder = document.getElementById("formTicket");
setOrder.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loaderOverlay = document.getElementById('loaderOverlay');
    loaderOverlay.style.display = 'flex';

    let startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 25);

    let warranty;

    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;

    const startDateObj = new Date(startDateInput);
    const endDateObj = new Date(endDateInput);

    if (!isNaN(startDateObj) && !isNaN(endDateObj)) {
        startDate = formatDateToDDMMYYYY(startDateObj);
        endDate = formatDateToDDMMYYYY(endDateObj);

        const diferenciaEnMilisegundos = endDateObj - startDateObj;
        warranty = diferenciaEnMilisegundos / (1000 * 60 * 60 * 24);
    } else {
        console.error('Fechas inválidas');
        warranty = 0;
    }

    // Captura los datos del formulario
    const formData = new FormData(setOrder);
    const data = Object.fromEntries(formData.entries());
    const platform = document.getElementById('platform');
    const provider = document.getElementById('provider');
    const priceDisplay = document.getElementById('priceDisplay').innerText;
    const selectedPlatform = platform.options[platform.selectedIndex].text;
    const selectedProvider = provider.options[provider.selectedIndex].text;
    let phone = data.phone;
    // Filtrar y reordenar los datos antes de enviarlos
    filteredData = {
        id: null,
        phone: phone.toString(),
        platform: selectedPlatform,
        mail: data.email,
        profile: data.profile,
        pin: data.pin,
        provider: selectedProvider,
        startDate: startDate,
        endDate: endDate,
        price: priceDisplay,
        password: data.password,
        warranty: warranty
    };

    console.log(filteredData);


    try {
        const response = await setService(filteredData);

        if (response.status) {
            const myModal = new bootstrap.Modal('#Modal_SEND', {
                keyboard: false
            })
            myModal.show();

            const btn_send_ws = document.getElementById('btn_send_ws');
            btn_send_ws.addEventListener("click", async (event) => {
                const isNew = true;
                const message_response = await sendService(isNew, filteredData.phone, filteredData, filteredData.profile);

                if (message_response.success) {
                    alert(`Cuenta Agregada y Mensaje Enviado`);
                    myModal.hide();
                    myModal.dispose()
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());
                    setOrder.reset();
                } else {
                    alert(`Cuenta Agregada y Mensaje NO Enviado`);
                }
            });
        } else {
            alert(`${response.message}`);
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    } finally {
        loaderOverlay.style.display = 'none'; // Ocultar el loader una vez completado
    }
});

const updateOrder = document.getElementById("modalFormDataAccount");
updateOrder.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loaderOverlay = document.getElementById('loaderOverlay');
    loaderOverlay.style.display = 'flex';

    const idModal = document.getElementById("idModal").innerHTML;
    const numberModal = document.getElementById("numberModal").innerHTML;
    const platformModal = document.getElementById("platformModal").innerHTML;
    const mailModal = document.getElementById("mailModal").value;
    const profileModal = document.getElementById("profileModal").value;
    const pinModal = document.getElementById("pinModal").value;
    const providerModal = document.getElementById("providerModal").innerHTML;
    const startDateModal = document.getElementById("startDateModal").value;
    const endDateModal = document.getElementById("endDateModal").value;
    const priceModal = document.getElementById("priceModal").innerHTML;
    const passwordModal = document.getElementById("passwordModal").value;

    console.log("Tipo de dato del ID_MODAL => " + typeof idModal);

    const updateData = {
        id: idModal,
        phone: numberModal,
        platform: platformModal,
        mail: mailModal,
        profile: profileModal,
        pin: pinModal,
        provider: providerModal,
        startDate: startDateModal,
        endDate: endDateModal,
        price: priceModal,
        password: passwordModal,
    }

    try {
        const response = await updateService(idModal, updateData);
        if (response.status) {
            alert(`${response.message}`);
            updateOrder.reset();
        } else {
            alert(`${response.message}`);
        }

        const modalElement = document.getElementById('dataAccount');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());

    } catch (error) {
        alert("Error de conexión: " + error.message);
    } finally {
        loaderOverlay.style.display = 'none';
    }

});

function formatDateToDDMMYYYY(date) {
    const day = String(date.getUTCDate()).padStart(2, '0'); // Usar UTC
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
    const year = date.getUTCFullYear(); // Usar UTC
    return `${day}/${month}/${year}`;
}

const search_service_by_number = document.getElementById("search_service_by_number");
search_service_by_number.addEventListener("submit", async (e) => {

    e.preventDefault();
    const btnSearchByNumber = document.getElementById('btnSearchByNumber');
    btnSearchByNumber.innerHTML = 'Buscando...'
    btnSearchByNumber.disabled = true;
    let searchInput = document.getElementById("searchInput").value;

    try {
        const response = await getServiceByNumber(searchInput);
        if (response.status) {
            console.log(response.data.details);
            await renderServices(response.data.details);
        } else {
            alert(`Error desde server=> ${response.error}`)
        }

        btnSearchByNumber.innerHTML = 'Buscar'
        btnSearchByNumber.disabled = false;
    } catch (error) {
        alert(error);
        btnSearchByNumber.innerHTML = 'Buscar'
        btnSearchByNumber.disabled = false;
    }
});

const search_service_by_mail = document.getElementById("search_service_by_mail");
search_service_by_mail.addEventListener("submit", async (e) => {

    e.preventDefault();
    const btnSearchByMail = document.getElementById('btnSearchByMail');
    btnSearchByMail.innerHTML = 'Buscando...'
    btnSearchByMail.disabled = true;

    let searchInput = document.getElementById("searchMailInput").value;

    try {
        const response = await getServiceByMail(searchInput);
        if (response.status) {
            console.log(response.data.details);
            await renderServices(response.data.details)
        } else {
            alert(`Error desde server=> ${response.error}`)
        }
        btnSearchByMail.innerHTML = 'Buscar'
        btnSearchByMail.disabled = false;
    } catch (error) {
        alert(error);
        btnSearchByNumber.innerHTML = 'Buscar'
        btnSearchByNumber.disabled = false;
    }
});

async function renderServices(data) {
    const tableBody = document.getElementById('services_table');
    tableBody.innerHTML = '';
    if (data.length > 0) {
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                    <th scope="row">${row.id}</th>
                    <td>${row.numero}</td>
                    <td>${row.cuenta}</td>
                    <td>${row.correo}</td>
                    <td>${row.perfil}</td>
                    <td>${row.pin}</td>
                    <td>${row.fechaInicio}</td>
                    <td>${row.fechaTermino}</td>
                    <td class="row">
                    <div class"d-flex">
                    <button class="btnGuarantee btn btn-success m-1" id="${row.id}" data-bs-toggle="modal" data-bs-target="#dataAccount">Editar</button>
                    <button class="btnSendRepo btn btn-primary m-1 w-auto" id="${row.id}">Enviar Reposición</button>
                    <button class="btnSend btn btn-primary m-1 w-auto" id="${row.id}">Enviar Cuenta</button>
                    </div>
                    </td>
                `;
            tableBody.appendChild(tr);
        });

        const buttonsGuarantee = document.querySelectorAll('.btnGuarantee');
        buttonsGuarantee.forEach(button => {
            button.addEventListener('click', (event) => {
                const buttonId = event.target.id; // Obtén el ID del botón presionado
                console.log("Button ID:", buttonId); // Depuración
                console.log("Filtered Data IDs:", data.map(row => row.id)); // Depuración

                // Busca el objeto correspondiente al ID (convertimos ambos a string para evitar discrepancias)
                const selectedRow = data.find(row => String(row.id) === String(buttonId));
                if (selectedRow) {
                    console.log(`Datos del ID ${buttonId}:`, selectedRow);
                    document.getElementById("idModal").innerHTML = selectedRow.id;
                    document.getElementById("numberModal").innerHTML = selectedRow.numero;
                    document.getElementById("platformModal").innerHTML = selectedRow.cuenta;
                    document.getElementById("mailModal").value = selectedRow.correo;
                    document.getElementById("profileModal").value = selectedRow.perfil;
                    document.getElementById("pinModal").value = selectedRow.pin;
                    document.getElementById("providerModal").innerHTML = selectedRow.proveedor;
                    document.getElementById("startDateModal").value = selectedRow.fechaInicio;
                    document.getElementById("endDateModal").value = selectedRow.fechaTermino;
                    document.getElementById("priceModal").innerHTML = selectedRow.importe;
                    document.getElementById("passwordModal").value = selectedRow.password;
                } else {
                    console.log(`No se encontró ningún dato para el ID: ${buttonId}`);
                }
            });
        });

        const btnSend = document.querySelectorAll('.btnSend');
        btnSend.forEach(button => {
            button.addEventListener('click', async (event) => {
                const buttonId = event.target.id; // Obtén el ID del botón presionado

                // Busca el objeto correspondiente al ID (convertimos ambos a string para evitar discrepancias)
                const selectedRow = data.find(row => String(row.id) === String(buttonId));
                if (selectedRow) {
                    const dataService = {
                        id: selectedRow.id,
                        number: selectedRow.numero,
                        platform: selectedRow.cuenta,
                        mail: selectedRow.correo,
                        profile: selectedRow.perfil,
                        pin: selectedRow.pin,
                        warranty: differenceDays(selectedRow.fechaInicio, selectedRow.fechaTermino),
                        startDate: selectedRow.fechaInicio,
                        endDate: selectedRow.fechaTermino,
                        password: selectedRow.password,
                    }
                    const isNew = true;
                    const result = await sendService(isNew, dataService.number, dataService, dataService.profile);
                    if (result.success) {
                        alert("ENVIADO CORRECTAMENTE");
                    } else {
                        alert("Error al enviar datos: " + result.error);
                    }

                } else {
                    console.log(`No se encontró ningún dato para el ID: ${buttonId}`);
                }
            });
        });

        const btnSendRepo = document.querySelectorAll('.btnSendRepo');
        btnSendRepo.forEach(button => {
            button.addEventListener('click', async (event) => {
                const buttonId = event.target.id; // Obtén el ID del botón presionado

                // Busca el objeto correspondiente al ID (convertimos ambos a string para evitar discrepancias)
                const selectedRow = data.find(row => String(row.id) === String(buttonId));
                if (selectedRow) {
                    const dataService = {
                        id: selectedRow.id,
                        number: selectedRow.numero,
                        platform: selectedRow.cuenta,
                        mail: selectedRow.correo,
                        profile: selectedRow.perfil,
                        pin: selectedRow.pin,
                        warranty: differenceDays(selectedRow.fechaInicio, selectedRow.fechaTermino),
                        startDate: selectedRow.fechaInicio,
                        endDate: selectedRow.fechaTermino,
                        password: selectedRow.password,
                    }
                    const isNew = false;
                    const result = await sendService(isNew, dataService.number, dataService, dataService.profile);
                    if (result.success) {
                        alert("ENVIADO CORRECTAMENTE");
                    } else {
                        alert("Error al enviar datos: " + result.error);
                    }

                } else {
                    console.log(`No se encontró ningún dato para el ID: ${buttonId}`);
                }
            });
        });

    } else {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                <td colspan="9" class="text-center">No se encontraron resultados para esta búsqueda.</td>
            `;
        tableBody.appendChild(tr);
    }
}

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