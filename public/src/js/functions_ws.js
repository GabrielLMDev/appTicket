const btn_send_to_mail = document.getElementById("btn_send_to_mail");
const SEARCH_BY_MAIL_URL = "https://apistreaming.gabriellmdev.com/api/search/numbers-by-mail";

btn_send_to_mail.addEventListener("click", async (event) => {
    await showModal("Ingresa el correo", `
        <form id="s_mail_to_Send">
            <div class="mb-3">
                <label for="s_MailInput" class="form-label">¿Correo Destinatario?</label>
                <input type="text" class="form-control" id="s_MailInput" name="s_MailInput" placeholder="Correo..." required />
                <label for="text_send" class="form-label mt-3">Texto a enviar</label>
                <textarea id="text_send" name="text_send" class="form-control" rows="5" placeholder="Texto..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary search-btn w-100">Enviar</button>
        </form>`);

    const s_mail_to_Send = document.getElementById("s_mail_to_Send");
    s_mail_to_Send.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(s_mail_to_Send);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(SEARCH_BY_MAIL_URL, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mail: data.s_MailInput, msg: data.text_send })
            });
            // Verifica que la respuesta sea válida
            if (!response.ok) {
                console.log(response);
                throw new Error("Error en la respuesta del servidor");
            }
            const result = await response.json();

            if (result.success) {
                alert("Datos encontrados")
            } else {
                alert("Sin datos encontrados con ese correo");
            }
        } catch (error) {
            alert("Error de conexión: " + error.message);
        }
    });
});

function showModal(title, body) {
    // Eliminar cualquier modal existente con el mismo ID
    const existing = document.getElementById("generatedModal");
    if (existing) existing.remove();

    // Crear el contenedor del modal
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "generatedModal";
    modal.tabIndex = -1;
    modal.setAttribute("aria-labelledby", "generatedModalLabel");
    modal.setAttribute("aria-hidden", "true");

    // Modal inner HTML
    modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title" id="generatedModalLabel">${title}</h5>
          <button type="button" class="btn-close" data-mdb-dismiss="modal" aria-label="Cerrar"></button>
        </div>

        <div class="modal-body">
          ${body}
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-mdb-dismiss="modal">Cerrar</button>
        </div>

      </div>
    </div>
  `;

    // Agregar al body
    document.body.appendChild(modal);

    // Crear y mostrar el modal usando MDB
    const modalInstance = new mdb.Modal(modal);
    modalInstance.show();
}
