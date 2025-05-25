document.addEventListener('DOMContentLoaded', async function () {
    await getAppsList();
    document.getElementById("platform").addEventListener("change", showPrice);
});

//GLOBAL CONSTANTS//
const pricesList = [];
const diasPorMes = {
    1: 25,
    2: 55,
    3: 80
};
const phoneInput = document.getElementById('phone');
const form = document.getElementById("formTicket");

const API_URL = "https://apistreaming.gabriellmdev.com/api/prices";
const SEARCH_BY_NUMBER_URL = "https://apistreaming.gabriellmdev.com/api/search/number";
const SEARCH_BY_MAIL_URL = "https://apistreaming.gabriellmdev.com/api/search/mail";
const UPDATE_APP_URL = "https://apistreaming.gabriellmdev.com/api/update";
const ADD_DATA = "https://apistreaming.gabriellmdev.com/api/send-data";
const UPDATE_DATA = "https://apistreaming.gabriellmdev.com/api/update-data";


const textarea = document.getElementById("copyTextarea");
const textareaTl = document.getElementById("copyTextareaTl");

const warrantyDisplay = document.getElementById("warrantyDisplay");
const changeDateStart = document.getElementById("startDate");
const copyButton = document.getElementById("copyButton");
const copyButtonTl = document.getElementById("copyButtonTl");
const changeDateEnd = document.getElementById("endDate");

const btnPrices = document.getElementById("btnPrices");
const btnClean = document.getElementById("btnClean");
const btnConsult = document.getElementById("btnConsult");
const btnConsultMail = document.getElementById("btnConsultMail");
const btnUpdate = document.getElementById("btnUpdate");

const searchUserForm = document.getElementById("searchUser");
const searchMailForm = document.getElementById("searchMail");

const divSearch = document.getElementById("divSearch");
const divSearchMail = document.getElementById("divSearchMail");
const divProducts = document.getElementById("divProducts");

const modalFormDataAccount = document.getElementById("modalFormDataAccount");
const modalFormProductUpdate = document.getElementById("modalFormProductUpdate");

//GLOBAL VARIABLES//
let filteredData;
let dataTicketSearch = [];

//EVENTS//
phoneInput.addEventListener('paste', (event) => {

    event.preventDefault();

    const clipboardData = event.clipboardData || window.clipboardData;
    let pastedData = clipboardData.getData('text');

    pastedData = pastedData.replace(/\s+/g, '').replace(/^\+52/, '');

    phoneInput.value = pastedData;
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loaderOverlay = document.getElementById('loaderOverlay');
    loaderOverlay.style.display = 'flex'; // Mostrar el loader en pantalla completa

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
    const formData = new FormData(form);
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
        const response = await fetch(ADD_DATA, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filteredData)
        });

        // Verifica que la respuesta sea válida
        if (!response.ok) {
            console.log(response);
            throw new Error("Error en la respuesta del servidor");
        }

        // Intenta parsear la respuesta JSON
        const result = await response.json();

        if (result.success) {
            await setTicket(filteredData.platform, filteredData.warranty);
        } else {
            alert("Error al enviar datos: " + result.error);
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    } finally {
        loaderOverlay.style.display = 'none'; // Ocultar el loader una vez completado
    }
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

copyButton.addEventListener("click", (event) => {
    copyToClipboard();
});

copyButtonTl.addEventListener("click", (event) => {
    copyToClipboardTl();
});

btnPrices.addEventListener("click", (event) => {
    const pricesTL = pricesList.map(item => `${setEmoji(new Date())} __${item.name}:__ **$${item.price}** ${item.available ? "" : "__(AGOTADO)__"}`).join('\n');
    const pricesWS = pricesList.map(item => `${setEmoji(new Date())} _${item.name}:_ *$${item.price}* ${item.available ? "" : "_(AGOTADO)_"}`).join('\n');

    textarea.value = `${setEmojiTittle(new Date())} _*PRECIOS DE HOY: ${setFormatDate(new Date())}*_ ${setEmojiTittle(new Date())}\n\n${pricesWS}`;
    textareaTl.value = `${setEmojiTittle(new Date())} **PRECIOS DE HOY: ${setFormatDate(new Date())}** ${setEmojiTittle(new Date())}\n\n${pricesTL}`;
});

btnClean.addEventListener("click", (event) => {
    textarea.value = "";
    textareaTl.value = "";
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

btnUpdate.addEventListener("click", async (event) => {
    divSearchMail.style.display = "none";
    divSearch.style.display = "none";
    divProducts.style.display = "block"
    try {
        // Obtén el tbody de la tabla
        const productsTable = document.getElementById('productsTable');
        productsTable.innerHTML = ''; // Limpia los datos previos
        pricesList.forEach((app) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                    <td>${app.name}</td>
                    <td>$${app.price}</td>
                    <td>$${app.reseller}</td>
                    <td>${app.group}</td>
                    <td>${app.available}</td>
                    <td><button class="btnUpdateProduct btn btn-success px-1 w-100" id="${app.id}" data-bs-toggle="modal" data-bs-target="#modalProducts">Editar</button></td>
                `;
            productsTable.appendChild(tr);

            const btnUpdateProduct = document.querySelectorAll('.btnUpdateProduct');

            btnUpdateProduct.forEach(button => {
                button.addEventListener('click', (event) => {
                    const buttonId = event.target.id; // Obtén el ID del botón presionado
                    // Busca el objeto correspondiente al ID (convertimos ambos a string para evitar discrepancias)
                    const selectedRow = pricesList.find(row => String(row.id) === String(buttonId));
                    if (selectedRow) {
                        document.getElementById("idModalProduct").innerHTML = selectedRow.id;
                        document.getElementById("platformModalProduct").value = selectedRow.name;
                        document.getElementById("priceModalProduct").value = selectedRow.price;
                        document.getElementById("resellerModalProduct").value = selectedRow.reseller;
                        document.getElementById("groupModalProduct").value = selectedRow.group;
                        document.getElementById("availableModalProduct").value = selectedRow.available;
                        document.getElementById("srcModalProduct").value = selectedRow.src;
                        document.getElementById("tagModalProduct").value = selectedRow.tag;
                    } else {
                        console.log(`No se encontró ningún dato para el ID: ${buttonId}`);
                    }
                });
            });
        });

    } catch (error) {
        console.error(error);
    }
});

searchUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let row = "";
    let countRow = 1;
    let searchInput = document.getElementById("searchInput").value;
    fetchGoogleSheetData(searchInput);
});

searchMailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let row = "";
    let countRow = 1;
    let searchInput = document.getElementById("searchMailInput").value;
    fetchGoogleSheetDataMail(searchInput);
});

searchInput.addEventListener('paste', (event) => {

    event.preventDefault();

    const clipboardData = event.clipboardData || window.clipboardData;
    let pastedData = clipboardData.getData('text');

    pastedData = pastedData.replace(/\s+/g, '').replace(/^\+52/, '');

    searchInput.value = pastedData;
});

modalFormDataAccount.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loaderOverlay = document.getElementById('loaderOverlay');
    loaderOverlay.style.display = 'flex'; // Mostrar el loader en pantalla completa

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

    try {
        const response = await fetch(UPDATE_DATA, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                updateData: {
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
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        console.log('Respuesta del servidor:', result);

        if (result.success) {
            console.log("Datos enviados a Sheets");
            alert("Cuenta Actualizada");

            const modalElement = document.getElementById('dataAccount');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        } else {
            alert("Error al enviar datos: " + result.error);
        }

    } catch (error) {
        alert("Error de conexión: " + error.message);
    } finally {
        loaderOverlay.style.display = 'none';
    }

});

modalFormProductUpdate.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loaderOverlay = document.getElementById('loaderOverlay');
    loaderOverlay.style.display = 'flex'; // Mostrar el loader en pantalla completa

    const idModalProduct = document.getElementById("idModalProduct").innerHTML;
    const platformModalProduct = document.getElementById("platformModalProduct").value;
    const priceModalProduct = document.getElementById("priceModalProduct").value;
    const groupModalProduct = document.getElementById("groupModalProduct").value;
    const availableModalProduct = document.getElementById("availableModalProduct").value;
    const resellerModalProduct = document.getElementById("resellerModalProduct").value;
    const srcModalProduct = document.getElementById("srcModalProduct").value;
    const tagModalProduct = document.getElementById("tagModalProduct").value;

    try {
        fetch(UPDATE_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dataApp: {
                    idProduct: idModalProduct,
                    id: idModalProduct,
                    name: platformModalProduct,
                    group: groupModalProduct,
                    price: priceModalProduct,
                    available: availableModalProduct == "true" ? true : false,
                    reseller: resellerModalProduct,
                    src: srcModalProduct,
                    tag: tagModalProduct,
                }
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del servidor:', data);
                if (data.success === true) {
                    // Cerrar el modal
                    const modalElement = document.getElementById('modalProducts');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();

                    // Eliminar manualmente cualquier backdrop si persiste
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach(backdrop => backdrop.remove());

                    alert("App Actualizada");
                }
            })
            .catch(error => {
                console.error('Error al enviar la solicitud:', error);
            })
    } catch (error) {
        alert("Error de conexión: " + error.message);
    } finally {
        loaderOverlay.style.display = 'none'; // Ocultar el loader una vez completado
    }
});


//FUNCTIONS//
async function getAppsList() {
    const selectElement = document.getElementById("platform");
    try {
        const response = await fetch(API_URL);

        // Verifica si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Mostrar los resultados
        console.log('Datos recibidos desde la API:', data);

        // Limpiar select antes de agregar nuevas opciones
        selectElement.innerHTML = '<option disabled selected>Selecciona una opción</option>';

        // Iterar sobre los resultados y agregarlos al <select>
        data.forEach(doc => {
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = doc.name;
            option.setAttribute("data-precio", doc.price);
            selectElement.appendChild(option);

            pricesList.push({
                id: doc.id,
                name: doc.name,
                price: doc.price,
                available: doc.available,
                group: doc.group,
                reseller: doc.reseller,
                src: doc.src,
                tag: doc.tag,

            });
        });

    } catch (error) {
        // Manejo de errores (CORS, red, etc.)
        console.error('Ocurrió un error al hacer la petición:', error.message);
        return null;
    }
}

function showPrice() {
    const selectElement = document.getElementById("platform");
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const price = selectedOption.getAttribute("data-precio");

    const priceDisplay = document.getElementById("priceDisplay");
    priceDisplay.textContent = price ? `${price}` : "N/A";
}

function formatDateToDDMMYYYY(date) {
    const day = String(date.getUTCDate()).padStart(2, '0'); // Usar UTC
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Los meses comienzan en 0
    const year = date.getUTCFullYear(); // Usar UTC
    return `${day}/${month}/${year}`;
}

function setFormatDate(date) {
    return new Date(date).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

async function setTicket(platform, warranty) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    console.log("Inicio ticket.");
    try {
        let ticketWS = `${setEmojiTittle(new Date())} *${platform}* ${setEmojiTittle(new Date())}`
            + `\n\n📧 *Correo: ${data.email}*`
            + `\n🔑 *Contraseña: ${data.password}*`
            + `\n🔐 *PIN ${data.pin === "1" ? "NINGUNO" : data.pin === "0" ? "NINGUNO" : data.pin}*`
            + `\n🙋‍♂️ *PERFIL: ${data.profile}*`
            + `\n\n‼️ *NO CAMBIAR NADA DE LA CUENTA O SE PIERDE LA GARANTÍA*`
            + `\n‼️ *ACCESO ÚNICAMENTE PARA UN DISPOSITIVO* ‼️`
            + `\n❗ _*Favor de respetar MAYÚSCULAS Y SÍMBOLOS en el correo y contraseña ya que se podría bloquear la cuenta si no se ingresan correctamente*_ ❗`
            + `\n🚫 *Los nombres de los perfiles no se deben de cambiar* 🚫`
            + `\n\n📅 Fecha de activación: ${data.startDate}`
            + `\n📅 Vence el: ${data.endDate}`
            + `\n⚠️ _Cuenta sujeta a posible cambio en caso de fallar_ ⚠️`
            + `\n\n✅ *GARANTÍA DE ${warranty} DÍAS* ✅`
            + `\n\n _*RECUERDA QUE MAS PERSONAS USAN DIFERENTES PERFILES, SI CAMBIAN TU NOMBRE , TU PIN DE ACCESO O CIERRAN TU SESIÓN REPORTALO DE INMEDIATO CONMIGO Y RESOLVERE TU SITUACION*_`
            + `\n\n _*El periodo de espera por reposición o validación de garantia es de 1 hora hasta 72 horas, no te preocupes todo el tiempo se repone.*_`
            + `\n\n *CUENTAS STREAMING "EL INGE", GRACIAS POR TU PREFERENCIA.*`;

        let ticketTL = `${setEmojiTittle(new Date())} **${platform}** ${setEmojiTittle(new Date())}`
            + `\n\n📧 **Correo: ${data.email}**`
            + `\n🔑 **Contraseña: ${data.password}**`
            + `\n🔐 **PIN ${data.pin === "1" ? "NINGUNO" : data.pin === "0" ? "NINGUNO" : data.pin}**`
            + `\n🙋‍♂️ **PERFIL: ${data.profile}**`
            + `\n\n‼️ **NO CAMBIAR NADA DE LA CUENTA O SE PIERDE LA GARANTÍA**`
            + `\n‼️ **ACCESO ÚNICAMENTE PARA UN DISPOSITIVO** ‼️`
            + `\n❗__Favor de respetar MAYÚSCULAS Y SÍMBOLOS en el correo y contraseña ya que se podría bloquear la cuenta si no se ingresan correctamente__ ❗`
            + `\n🚫 __Los nombres de los perfiles no se deben de cambiar__ 🚫`
            + `\n\n📅 Fecha de activación: ${data.startDate}`
            + `\n📅 Vence el: ${data.endDate}`
            + `\n⚠️ __Cuenta sujeta a posible cambio en caso de fallar__ ⚠️`
            + `\n\n✅ **GARANTÍA DE ${warranty} DÍAS** ✅`
            + `\n\n **RECUERDA QUE MAS PERSONAS USAN DIFERENTES PERFILES, SI CAMBIAN TU NOMBRE , TU PIN DE ACCESO O CIERRAN TU SESIÓN REPORTALO DE INMEDIATO CONMIGO Y RESOLVERE TU SITUACION**`
            + `\n\n __El periodo de espera por reposición o validación de garantia es de 1 hora hasta 72 horas, no te preocupes todo el tiempo se repone.__`
            + `\n\n **CUENTAS STREAMING "EL INGE", GRACIAS POR TU PREFERENCIA.**`;
        textarea.value = ticketWS;
        textareaTl.value = ticketTL;
        console.log("Datos añadidos al ticket.");
        alert("Datos enviados correctamente");
        form.reset();
    } catch (error) {
        console.error("Error al agregar datos: ", error);
    }
}

function copyToClipboard() {
    textarea.select();
    textarea.setSelectionRange(0, 99999); // Para dispositivos móviles
    document.execCommand("copy"); // Método clásico (compatible con navegadores más antiguos)

    // Muestra un mensaje al usuario
    const copyButton = document.getElementById("copyButton");
    copyButton.textContent = "¡Copiado!";
    setTimeout(() => {
        copyButton.textContent = "Copiar";
    }, 2000);
}

function copyToClipboardTl() {
    textareaTl.select();
    textareaTl.setSelectionRange(0, 99999); // Para dispositivos móviles
    document.execCommand("copy"); // Método clásico (compatible con navegadores más antiguos)

    // Muestra un mensaje al usuario
    const copyButtonTl = document.getElementById("copyButtonTl");
    copyButtonTl.textContent = "¡Copiado!";
    setTimeout(() => {
        copyButtonTl.textContent = "Copiar";
    }, 2000);
}

function setEmojiTittle(date) {
    const month = new Date(date).getMonth();
    switch (month) {
        case 0: return "🎉🇲🇽";        // Enero: Año Nuevo
        case 1: return "💘🎎";         // Febrero: Día del Amor y la Amistad
        case 2: return "🌸🙏";         // Marzo: Primavera / Natalicio de Benito Juárez
        case 3: return "🐣✝️";         // Abril: Semana Santa (varía pero cae usualmente aquí)
        case 4: return "🎊🇲🇽";        // Mayo: Día del Trabajo, Día de la Madre, Batalla de Puebla
        case 5: return "🎓👨‍🎓";       // Junio: Fin de cursos / Día del Padre
        case 6: return "🌞🏖️";         // Julio: Vacaciones de verano
        case 7: return "🌽🎭";         // Agosto: Fiestas tradicionales / regreso a clases
        case 8: return "🇲🇽🎉";        // Septiembre: Grito de Independencia (15-16)
        case 9: return "💀🕯️";         // Octubre: Preparativos Día de Muertos
        case 10: return "🕯️💀";        // Noviembre: Día de Muertos / Revolución Mexicana (20)
        case 11: return "🎄🧑‍🎄";       // Diciembre: Navidad / Las Posadas / Nochebuena
        default: return "🌞";
    }
}

function setEmoji(date) {
    const month = new Date(date).getMonth();
    switch (month) {
        case 0: return "🎆";          // Año Nuevo
        case 1: return "💝";          // San Valentín
        case 2: return "🇲🇽";          // Natalicio de Benito Juárez
        case 3: return "🌿";          // Semana Santa / Pascua
        case 4: return "🌹";          // Día de la Madre
        case 5: return "🎓";          // Fin de cursos / Día del Padre
        case 6: return "🍧";          // Vacaciones
        case 7: return "📚";          // Regreso a clases
        case 8: return "🥳";          // Grito de Independencia
        case 9: return "🎃";          // Preparación Día de Muertos
        case 10: return "🕯️";         // Día de Muertos / Revolución
        case 11: return "🎁";         // Navidad / Posadas
        default: return "✅";
    }
}

async function fetchGoogleSheetData(Input) {

    const numberInput = parseInt(Input, 10);

    try {
        const response = await fetch(SEARCH_BY_NUMBER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ number: numberInput }),
        });

        // Verifica si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        // Mostrar los resultados
        console.log('Datos recibidos desde la API:', data);

        // Obtén el tbody de la tabla
        const tableBody = document.getElementById('accountsUserTable');
        tableBody.innerHTML = ''; // Limpia los datos previos

        if (data.length > 0) {
            // Agrega las filas al tbody
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
                    <td><button class="btnGuarantee btn btn-success p-1 m-1" id="${row.id}" data-bs-toggle="modal" data-bs-target="#dataAccount">Editar</button>
                    <button class="btnGTicket btn btn-primary p-1 m-1" id="${row.id}">Ticket</button>
                    <button class="btnSend btn btn-primary p-1 m-1" id="${row.id}">Enviar</button></td>
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

            const btnGTicket = document.querySelectorAll('.btnGTicket');
            btnGTicket.forEach(button => {
                button.addEventListener('click', (event) => {
                    const buttonId = event.target.id; // Obtén el ID del botón presionado

                    // Busca el objeto correspondiente al ID (convertimos ambos a string para evitar discrepancias)
                    const selectedRow = data.find(row => String(row.id) === String(buttonId));
                    if (selectedRow) {
                        dataTicketSearch = {
                            id: selectedRow.id,
                            account: selectedRow.cuenta,
                            mail: selectedRow.correo,
                            profile: selectedRow.perfil,
                            pin: selectedRow.pin,
                            startDate: selectedRow.fechaInicio,
                            endDate: selectedRow.fechaTermino,
                            password: selectedRow.password,
                        }
                        setTicketFromSearch(dataTicketSearch);
                    } else {
                        console.log(`No se encontró ningún dato para el ID: ${buttonId}`);
                    }
                });
            });

            const btnSend = document.querySelectorAll('.btnSend');
            btnSend.forEach(button => {
                button.addEventListener('click', (event) => {
                    const buttonId = event.target.id; // Obtén el ID del botón presionado

                    // Busca el objeto correspondiente al ID (convertimos ambos a string para evitar discrepancias)
                    const selectedRow = data.find(row => String(row.id) === String(buttonId));
                    if (selectedRow) {
                        dataTicketSearch = {
                            id: selectedRow.id,
                            number: selectedRow.numero,
                            account: selectedRow.cuenta,
                            mail: selectedRow.correo,
                            profile: selectedRow.perfil,
                            pin: selectedRow.pin,
                            startDate: selectedRow.fechaInicio,
                            endDate: selectedRow.fechaTermino,
                            password: selectedRow.password,
                        }
                        sendWhatsapp(dataTicketSearch.number, dataTicketSearch);
                    } else {
                        console.log(`No se encontró ningún dato para el ID: ${buttonId}`);
                    }
                });
            });

        } else {
            // Si no hay resultados, agrega una fila indicando que no hay datos
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="5" class="text-center">No se encontraron resultados para ese número telefónico.</td>
            `;
            tableBody.appendChild(tr);
        }

    } catch (error) {
        // Manejo de errores (CORS, red, etc.)
        console.error('Ocurrió un error al hacer la petición:', error.message);
        return null;
    }
}

async function fetchGoogleSheetDataMail(Input) {
    const mailInput = Input;
    try {
        const response = await fetch(SEARCH_BY_MAIL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mail: mailInput }),
        });

        // Verifica si la respuesta fue exitosa
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        // Mostrar los resultados
        console.log('Datos recibidos desde la API:', data);

        // Obtén el tbody de la tabla
        const tableBody = document.getElementById('accountsMailTable');
        tableBody.innerHTML = ''; // Limpia los datos previos

        if (data.length > 0) {
            // Agrega las filas al tbody
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
                    <td><button class="btnGuarantee btn btn-success p-1" id="${row.id}" data-bs-toggle="modal" data-bs-target="#dataAccount">Editar</button>
                    <button class="btnGTicket btn btn-primary p-1" id="${row.id}">Ticket</button>
                    <button class="btn btn-primary p-1" id="${row.id}">Enviar</button></td>
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

            const btnGTicket = document.querySelectorAll('.btnGTicket');
            btnGTicket.forEach(button => {
                button.addEventListener('click', (event) => {
                    const buttonId = event.target.id; // Obtén el ID del botón presionado

                    // Busca el objeto correspondiente al ID (convertimos ambos a string para evitar discrepancias)
                    const selectedRow = data.find(row => String(row.id) === String(buttonId));
                    if (selectedRow) {
                        dataTicketSearch = {
                            id: selectedRow.id,
                            account: selectedRow.cuenta,
                            mail: selectedRow.correo,
                            profile: selectedRow.perfil,
                            pin: selectedRow.pin,
                            startDate: selectedRow.fechaInicio,
                            endDate: selectedRow.fechaTermino,
                            password: selectedRow.password,
                        }
                        setTicketFromSearch(dataTicketSearch);
                    } else {
                        console.log(`No se encontró ningún dato para el ID: ${buttonId}`);
                    }
                });
            });

        } else {
            // Si no hay resultados, agrega una fila indicando que no hay datos
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="5" class="text-center">No se encontraron resultados para ese número telefónico.</td>
            `;
            tableBody.appendChild(tr);
        }
    } catch (error) {
        console.error('Error al obtener los datos de Google Sheets:', error);
    }
}

async function sendWhatsapp(number, data) {
    let numero = number;
    let mensaje = `*REPOSICIÓN*\n\n\n${setEmojiTittle(new Date())} *${data.account}* ${setEmojiTittle(new Date())}`
        + `\n\n📧 *Correo: ${data.mail}*`
        + `\n🔑 *Contraseña: ${data.password}*`
        + `\n🔐 *PIN ${data.pin === "1" ? "NINGUNO" : data.pin === "0" ? "NINGUNO" : data.pin}*`
        + `\n🙋‍♂️ *PERFIL: ${data.profile}*`
        + `\n\n‼️ *NO CAMBIAR NADA DE LA CUENTA O SE PIERDE LA GARANTÍA*`
        + `\n‼️ *ACCESO ÚNICAMENTE PARA UN DISPOSITIVO* ‼️`
        + `\n❗ _*Favor de respetar MAYÚSCULAS Y SÍMBOLOS en el correo y contraseña ya que se podría bloquear la cuenta si no se ingresan correctamente*_ ❗`
        + `\n🚫 *Los nombres de los perfiles no se deben de cambiar* 🚫`
        + `\n\n📅 Fecha de activación: ${data.startDate}`
        + `\n📅 Vence el: ${data.endDate}`
        + `\n⚠️ _Cuenta sujeta a posible cambio en caso de fallar_ ⚠️`
        + `\n\n✅ *GARANTÍA DE ${differenceDays(data.startDate, data.endDate)} DÍAS* ✅`
        + `\n\n _*RECUERDA QUE MAS PERSONAS USAN DIFERENTES PERFILES, SI CAMBIAN TU NOMBRE , TU PIN DE ACCESO O CIERRAN TU SESIÓN REPORTALO DE INMEDIATO CONMIGO Y RESOLVERE TU SITUACION*_`
        + `\n\n _*El periodo de espera por reposición o validación de garantia es de 1 hora hasta 72 horas, no te preocupes todo el tiempo se repone.*_`
        + `\n\n *CUENTAS STREAMING "EL INGE", GRACIAS POR TU PREFERENCIA.*`;

    const URL_API = "http://localhost:3002/send-message";
    try {
        const response = await fetch(URL_API, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numero: numero, mensaje: mensaje })
        });
        // Verifica que la respuesta sea válida
        if (!response.ok) {
            console.log(response);
            throw new Error("Error en la respuesta del servidor");
        }
        const result = await response.json();

        if (result.success) {
            console.log("ENVIADO A WS");
            alert("ENVIADO A WHATSAPP");
        } else {
            alert("Error al enviar datos: " + result.error);
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
    console.log(number + "->" + mensaje)
}

async function setTicketFromSearch(data) {
    try {
        let warranty = new Date(data.endDate) - new Date(data.startDate);
        let ticketWS = `${setEmojiTittle(new Date())} *${data.account}* ${setEmojiTittle(new Date())}`
            + `\n\n📧 *Correo: ${data.mail}*`
            + `\n🔑 *Contraseña: ${data.password}*`
            + `\n🔐 *PIN ${data.pin === "1" ? "NINGUNO" : data.pin === "0" ? "NINGUNO" : data.pin}*`
            + `\n🙋‍♂️ *PERFIL: ${data.profile}*`
            + `\n\n‼️ *NO CAMBIAR NADA DE LA CUENTA O SE PIERDE LA GARANTÍA*`
            + `\n‼️ *ACCESO ÚNICAMENTE PARA UN DISPOSITIVO* ‼️`
            + `\n❗ _*Favor de respetar MAYÚSCULAS Y SÍMBOLOS en el correo y contraseña ya que se podría bloquear la cuenta si no se ingresan correctamente*_ ❗`
            + `\n🚫 *Los nombres de los perfiles no se deben de cambiar* 🚫`
            + `\n\n📅 Fecha de activación: ${data.startDate}`
            + `\n📅 Vence el: ${data.endDate}`
            + `\n⚠️ _Cuenta sujeta a posible cambio en caso de fallar_ ⚠️`
            + `\n\n✅ *GARANTÍA DE ${differenceDays(data.startDate, data.endDate)} DÍAS* ✅`
            + `\n\n _*RECUERDA QUE MAS PERSONAS USAN DIFERENTES PERFILES, SI CAMBIAN TU NOMBRE , TU PIN DE ACCESO O CIERRAN TU SESIÓN REPORTALO DE INMEDIATO CONMIGO Y RESOLVERE TU SITUACION*_`
            + `\n\n _*El periodo de espera por reposición o validación de garantia es de 1 hora hasta 72 horas, no te preocupes todo el tiempo se repone.*_`
            + `\n\n *CUENTAS STREAMING "EL INGE", GRACIAS POR TU PREFERENCIA.*`;

        let ticketTL = `${setEmojiTittle(new Date())} **${data.account}** ${setEmojiTittle(new Date())}`
            + `\n\n📧 **Correo: ${data.mail}**`
            + `\n🔑 **Contraseña: ${data.password}**`
            + `\n🔐 **PIN ${data.pin === "1" ? "NINGUNO" : data.pin === "0" ? "NINGUNO" : data.pin}**`
            + `\n🙋‍♂️ **PERFIL: ${data.profile}**`
            + `\n\n‼️ **NO CAMBIAR NADA DE LA CUENTA O SE PIERDE LA GARANTÍA**`
            + `\n‼️ **ACCESO ÚNICAMENTE PARA UN DISPOSITIVO** ‼️`
            + `\n❗__Favor de respetar MAYÚSCULAS Y SÍMBOLOS en el correo y contraseña ya que se podría bloquear la cuenta si no se ingresan correctamente__ ❗`
            + `\n🚫 __Los nombres de los perfiles no se deben de cambiar__ 🚫`
            + `\n\n📅 Fecha de activación: ${data.startDate}`
            + `\n📅 Vence el: ${data.endDate}`
            + `\n⚠️ __Cuenta sujeta a posible cambio en caso de fallar__ ⚠️`
            + `\n\n✅ **GARANTÍA DE ${differenceDays(data.startDate, data.endDate)} DÍAS** ✅`
            + `\n\n **RECUERDA QUE MAS PERSONAS USAN DIFERENTES PERFILES, SI CAMBIAN TU NOMBRE , TU PIN DE ACCESO O CIERRAN TU SESIÓN REPORTALO DE INMEDIATO CONMIGO Y RESOLVERE TU SITUACION**`
            + `\n\n __El periodo de espera por reposición o validación de garantia es de 1 hora hasta 72 horas, no te preocupes todo el tiempo se repone.__`
            + `\n\n **CUENTAS STREAMING "EL INGE", GRACIAS POR TU PREFERENCIA.**`;
        textarea.value = ticketWS;
        textareaTl.value = ticketTL;
        dataTicketSearch = [];
    } catch (error) {
        console.error("Error al agregar datos: ", error);
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