/* const API_BASE = 'https://apiartesanias-production.up.railway.app/api/apps'; */
const API_BASE = "http://localhost:3000/api/services";

function getToken() {
    return localStorage.getItem("token");
}


export async function setService(data) {
    try {
        const response = await fetch(API_BASE, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return result;

    } catch (err) {
        throw err;
    }
}

export async function updateService(id, data) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        return result;

    } catch (err) {
        throw err;
    }
}

export async function getServiceByNumber(data) {
    try {
        const res = await fetch(`${API_BASE}/actives/${data}`);
        const result = await res.json();
        return result;

    } catch (err) {
        throw err;
    }
}

export async function getServiceByMail(data) {
    try {
        const res = await fetch(`${API_BASE}/mail/${data}`);
        const result = await res.json();
        return result;
    } catch (err) {
        throw err;
    }
}

