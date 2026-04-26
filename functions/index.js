const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const axios = require('axios');

exports.notificarTelegram = onDocumentCreated("mensajes/{docId}", async (event) => {
    const nuevoDato = event.data.data();

    // AQUÍ VAN TUS DATOS, NO LOS OLVIDES
    const token = '8774952289:AAFFa5lDsQFB7Br57lnSRGVtA_x4E5fFTK4';
    const chatId = '6905944815';

    let fechaStr = "No disponible";
    if (nuevoDato.fecha) {
        // Verificar si es un Timestamp de Firestore y tiene el método toDate
        if (typeof nuevoDato.fecha.toDate === 'function') {
            fechaStr = nuevoDato.fecha.toDate().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
        } else {
            // Si por alguna razón es solo un string u otro formato
            fechaStr = nuevoDato.fecha.toString();
        }
    }

    const texto = `🔔 ¡Nuevo mensaje en Luminan!\n\nDe: ${nuevoDato.nombre}\nDice: ${nuevoDato.mensaje}\n\nDatos Adicionales:\n\nCorreo: ${nuevoDato.correo}\nFecha: ${fechaStr}`;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: texto
        });
        console.log("Mensaje enviado");
    } catch (error) {
        console.error('falle al mandar el mensaje: ', error);
    }
});