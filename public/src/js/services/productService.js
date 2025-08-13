const API_BASE = 'https://main.gabriellmdev.com/api/apps';
/* const API_BASE = "http://localhost:3000/api/apps"; */

function getToken() {
    return localStorage.getItem("token");
}


export async function setProduct(formData) {
    const product = buildProductObject(formData);
    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(product)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'No se pudo guardar');
        return result;
    } catch (err) {
        throw err;
    }
}

// ✏️ Actualizar producto
export async function updateProduct(id, formData) {
    const product = buildProductObject(formData);
    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(product)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'No se pudo actualizar');
        return result;
    } catch (err) {
        throw err;
    }
}

// 🔍 Obtener todos los productos
export async function getProducts() {
    try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener productos');
        return data.apps;
    } catch (err) {
        throw err;
    }
}

// 🔍 Obtener uno por ID
export async function getProductById(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener producto');
        return data;
    } catch (err) {
        throw err;
    }
}

// 🗑️ Eliminar producto
export async function deleteProduct(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Error al eliminar producto');
        return result;
    } catch (err) {
        throw err;
    }
}


export function buildProductObject(form) {
    return {
        available: form.available_app.value.trim().toLowerCase() === "true", // Asegura que devuelva un booleano
        group: form.group_app.value.trim(),
        name: form.name_app.value.trim(),
        price: form.price_app.value.trim(),
        reseller: form.reseller_app.value.trim(),
        src: form.src_app.value.trim(),
        tag: form.tag_app.value.trim(),
    };
}
