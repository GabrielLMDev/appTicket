const btn_send_to_mail = document.getElementById("btn_send_to_mail");
const SEARCH_BY_MAIL_URL = "https://main.gabriellmdev.com/api/services/mail";
const SEND_MSG_URL = "https://bot.gabriellmdev.com/v1/messages";

btn_send_to_mail.addEventListener("click", async (event) => {
    await showModal("Ingresa el correo", `
        <form id="s_mail_to_Send">
            <div class="mb-3">
                <label for="s_MailInput" class="form-label">¿Correo Destinatario?</label>
                <input type="text" class="form-control" id="s_MailInput" name="s_MailInput" placeholder="Correo..." required />
                <label for="text_send" class="form-label mt-3">Texto a enviar</label>
                <textarea id="text_send" name="text_send" class="form-control" rows="5" placeholder="Texto..."></textarea>
                <label for="s_UrlInput" class="form-label">Imagen</label>
                <input type="text" class="form-control" id="s_UrlInput" name="s_UrlInput" placeholder="Imagen..."  />
            </div>
            <button type="submit" class="btn btn-primary search-btn w-100" id="btn_gen_send">Enviar</button>
        </form>`);

    const s_mail_to_Send = document.getElementById("s_mail_to_Send");
    s_mail_to_Send.addEventListener("submit", async (e) => {
        e.preventDefault();

        const btn_gen_send = document.getElementById('btn_gen_send');
        btn_gen_send.disabled = true;
        btn_gen_send.innerHTML = 'Enviando...';
        const formData = new FormData(s_mail_to_Send);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`${SEARCH_BY_MAIL_URL}/${data.s_MailInput}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.status) {

                console.log(result)
                const numbers = result.data.details;
                await processMSG(numbers, data.text_send, data.s_UrlInput);
            } else {
                alert("Sin datos encontrados con ese correo");
                btn_gen_send.disabled = false;
                btn_gen_send.innerHTML = 'Enviar';
            }
        } catch (error) {
            alert("Error de conexión: " + error);
            btn_gen_send.disabled = false;
            btn_gen_send.innerHTML = 'Enviar';
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

const processMSG = async (numbers, msg, urlImage) => {
    let success = 0;
    for (const number of numbers) {
        try {
            const response = await fetch(SEND_MSG_URL, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ number: '521' + number.numero, message: msg, urlMedia: urlImage })
            });

            const result = await response.json();

            if (result.success) {
                success++;
            }
        } catch (error) {
            alert("Error de conexión: " + error);
        }
    }
    alert(`Se enviaron: ${success} de manera exitosa`);
};