import {
    setProduct,
    updateProduct,
    getProducts,
    deleteProduct,
    getProductById
} from './services/productService.js';

document.addEventListener("DOMContentLoaded", await getApps());
document.getElementById("platform").addEventListener("change", showPrice);

document.getElementById('btn_add_product').addEventListener('click', function () {
    document.getElementById('modalProductoLabel').innerHTML = "Agregar Producto";
    document.getElementById("form_Actions_App").reset();
    document.getElementById("action_form").value = '';
    document.getElementById("action_form").value = 'create';
    document.getElementById("form_main_btn").innerHTML = 'Crear';
    const myModal = new bootstrap.Modal(document.getElementById('modal_Product_Actions'));
    myModal.show();
});


const btnUpdate = document.getElementById('btnUpdate');
const productsTable = document.getElementById('productsTable');
btnUpdate.addEventListener("click", async () => {
    const apps = await getProducts();

    document.getElementById("divSearch").style.display = "none";
    document.getElementById("divSearchMail").style.display = "none";
    document.getElementById("divProducts").style.display = "block";

    try {
        productsTable.innerHTML = '';
        apps.forEach((app) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${app.name}</td>
                <td>$${app.price}</td>
                <td>$${app.reseller}</td>
                <td>${app.group}</td>
                <td>${app.available}</td>
                <td class="d-flex">
                    <button class="btn_Update_App btn btn-success mx-1 w-100" 
                        id="${app.id}" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modal_Product_Actions">Editar</button>
                    <button class="btn_Delete_App btn btn-danger mx-1 w-100" 
                        id="${app.id}">Eliminar</button>
                </td>
            `;
            productsTable.appendChild(tr);
        });
        productsTable.dataset.apps = JSON.stringify(apps);

    } catch (error) {
        console.error(error);
    }
});
productsTable.addEventListener('click', async (e) => {
    const apps = JSON.parse(productsTable.dataset.apps || "[]");

    // Botón editar
    if (e.target.classList.contains('btn_Update_App')) {
        const buttonId = e.target.id;
        const selectedRow = apps.find(row => String(row.id) === String(buttonId));
        if (selectedRow) {
            document.getElementById("form_Actions_App").reset();
            document.getElementById("form_main_btn").innerHTML = 'Actualizar';
            document.getElementById("action_form").value = '';
            document.getElementById("action_form").value = 'update';
            document.getElementById('modalProductoLabel').innerHTML = "Actualizar Producto";
            document.getElementById("id_app").value = selectedRow.id;
            document.getElementById("name_app").value = selectedRow.name;
            document.getElementById("price_app").value = selectedRow.price;
            document.getElementById("reseller_app").value = selectedRow.reseller;
            document.getElementById("group_app").value = selectedRow.group;
            document.getElementById("available_app").value = selectedRow.available;
            document.getElementById("src_app").value = selectedRow.src;
            document.getElementById("tag_app").value = selectedRow.tag;

        }
    }

    if (e.target.classList.contains('btn_Delete_App')) {
        const buttonId = e.target.id;
        const response = await deleteProduct(buttonId);
        alert(response.message);
        if (response.status) {
            localStorage.removeItem('productosCache');
            window.location.href = "home.html";
        }
    }
});

const form_Actions_App = document.getElementById('form_Actions_App');
form_Actions_App.addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = this;
    const id = document.getElementById('id_app').value;
    let action = null;
    action = document.getElementById('action_form').value;
    console.log(`Este es el id: ${id} y este el action ${action}`)


    const loaderOverlay = document.getElementById('loaderOverlay');
    loaderOverlay.style.display = 'flex';


    if (action == "create") {
        const btn = document.getElementById("form_main_btn");
        btn.disabled = true;
        btn.innerHTML = 'Guardando...';
        try {
            const response = await setProduct(form);

            if (response.status) {
                alert(`${response.message} => ${response.id}`);
                localStorage.removeItem('productosCache');
                window.location.href = "home.html";
            } else {
                alert(`${response.message}`);
                const btn = document.getElementById("form_main_btn");
                btn.disabled = false;
                btn.innerHTML = 'Enviar';
            }
        } catch (error) {
            alert("Error de conexión: " + error.message);
        } finally {
            loaderOverlay.style.display = 'none'; // Ocultar el loader una vez completado
        }
    } else {
        const btn = document.getElementById("form_main_btn");
        btn.disabled = true;
        btn.innerHTML = 'Actualizando...';
        try {
            const response = await updateProduct(id, form);

            if (response.status) {
                alert(`${response.message}`);
                localStorage.removeItem('productosCache');
                window.location.href = "home.html";
            } else {
                alert(`${response.message}`);
                const btn = document.getElementById("form_main_btn");
                btn.disabled = false;
                btn.innerHTML = 'Actualizar';
            }
        } catch (error) {
            alert("Error de conexión: " + error.message);
        } finally {
            loaderOverlay.style.display = 'none'; // Ocultar el loader una vez completado
        }
    }

})

async function getApps() {
    const cache = JSON.parse(localStorage.getItem('productosCache')) || {};
    const ahora = Date.now();

    // Tiempo del cache (5 días)
    const tiempoCache = 5 * 24 * 60 * 60 * 1000;

    if (cache.data && ahora - cache.timestamp < tiempoCache) {
        console.log("✅ Usando productos del cache");
        renderOptions(cache.data);
        return;
    }

    try {
        console.log("🌐 Consultando productos desde la API");
        const data = await getProducts();

        localStorage.setItem('productosCache', JSON.stringify({
            data,
            timestamp: ahora
        }));
        renderOptions(data);
    } catch (err) {
        console.error("❌ Error al consultar productos:", err);
    }
}

function renderOptions(data) {

    const selectElement = document.getElementById("platform");
    // Limpiar select antes de agregar nuevas opciones
    selectElement.innerHTML = '<option disabled selected>Selecciona una opción</option>';

    // Iterar sobre los resultados y agregarlos al <select>
    data.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = doc.name;
        option.setAttribute("data-precio", doc.price);
        selectElement.appendChild(option);
    });
}

function showPrice() {
    const selectElement = document.getElementById("platform");
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const price = selectedOption.getAttribute("data-precio");

    const priceDisplay = document.getElementById("priceDisplay");
    priceDisplay.textContent = price ? `${price}` : "N/A";
}