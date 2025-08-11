const protectURL_PRODUCTION = "https://apiartesanias-production.up.railway.app/api/auth/verify";
const protectURL_DEV = "http://localhost:3000/api/auth/verify";

(async function validateToken() {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    try {
        const res = await fetch(protectURL_DEV, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Token inválido");

        const data = await res.json();
    } catch (err) {
        alert(err);
        localStorage.removeItem("token");
        window.location.href = "index.html";
    }
})();

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = decodeURIComponent(
            atob(base64Url).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(base64);
    } catch (e) {
        return null;
    }
}

const token = localStorage.getItem('token');
const user = parseJwt(token);

// Validar token y rol
if (!token || !user) {
    alert("🔒 Acceso denegado. Por favor inicia sesión.");
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}
