const authURL_PRODUCTION = "https://apiartesanias-production.up.railway.app/api/auth/login";
const authURL_DEV = "http://localhost:3000/api/auth/login";

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const btn = document.getElementById("btnLogin");
    btn.disabled = true;
    btn.innerHTML = 'Guardando...';

    const user = document.getElementById("user").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch(authURL_DEV, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error desconocido");

        localStorage.setItem("token", data.token);
        window.location.href = "home.html";
    } catch (err) {
        const errBox = document.getElementById("error");
        errBox.style.display = "block";
        errBox.innerText = err.message;
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Guardar';
    }
});


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
if (token || user) {
    alert("🔒 Ya hay sesion.");
    window.location.href = "home.html";
}