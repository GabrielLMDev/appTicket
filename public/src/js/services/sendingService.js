const API_BASE = "https://bot.gabriellmdev.com/send_account";

export async function sendService(isNew, number, message, type) {
    console.log(message)
    const isComplete = type == "COMPLETA" ? `\n\n‼️ *ACCESO A TODOS LOS PERFILES Y PARA 10 O MÁS DISPOSITIVOS* ‼️` : `\n\n‼️ *ACCESO ÚNICAMENTE PARA UN PERFIL Y UN DISPOSITIVO* ‼️`
    const BODY_MSG = `> ⓘ Este mensaje es generado y enviado por el bot si quieres contratar o hacer cualquier aclaración envía mensaje al "Inge". 5538495677\n\n${isNew == true ? "" : "*REPOSICIÓN*\n\n"}`
        +`${setEmojiTittle(new Date())} *${message.platform}* ${setEmojiTittle(new Date())}`
        + `\n\n📧 *Correo:* ${message.mail}`
        + `\n🔑 *Contraseña:* ${message.password === "NO DISPONIBLE" ? "~NO DISPONIBLE~" : message.password}`
        + `\n🔐 *PIN:* ${message.pin === "1" ? "NINGUNO" : message.pin === "0" ? "NINGUNO" : message.pin}`
        + `\n🙋‍♂️ *PERFIL:* ${message.profile}`
        + `${isComplete}`
        + `\n\n📅 Fecha de activación: ${message.startDate}`
        + `\n📅 Vence el: ${message.endDate}`
        + `\n\n✅ *GARANTÍA DE ${message.warranty} DÍAS* ✅`
        + `\n\n*CUENTAS STREAMING "EL INGE", GRACIAS POR TU PREFERENCIA.*`;

    try {
        const response = await fetch(API_BASE, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ number: number, message: BODY_MSG })
        });

        const result = await response.json();
        return result;

    } catch (err) {
        throw err;
    }
}

function setEmojiTittle(date) {
    const month = new Date(date).getMonth();
    switch (month) {
        case 0: return "🎉🇲🇽";
        case 1: return "💘🎎";
        case 2: return "🌸🙏";
        case 3: return "🐣✝️";
        case 4: return "🎊🇲🇽";
        case 5: return "🎓👨‍🎓";
        case 6: return "🌞🏖️";
        case 7: return "🌽🎭";
        case 8: return "🇲🇽🎉";
        case 9: return "💀🕯️";
        case 10: return "🕯️💀";
        case 11: return "🎄🧑‍🎄";
        default: return "🌞";
    }
}
