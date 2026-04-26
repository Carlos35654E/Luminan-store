const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const axios = require('axios');

exports.notificarTelegram = onDocumentCreated("mensajes/{docId}", async (event) => {
    const nuevoDato = event.data.data();
    
    // AQUÍ VAN TUS DATOS, NO LOS OLVIDES
    const token = '8774952289:AAFFa5lDsQFB7Br57lnSRGVtA_x4E5fFTK4'; 
    const chatId = '6905944815';
    
    const texto = `🔔 ¡Nuevo mensaje en Luminan!\n\nDe: ${nuevoDato.nombre}\nDice: ${nuevoDato.mensaje}\n\nDatos Adicionales:\n\nCorreo: ${nuevoDato.correo}\nFecha: ${nuevoDato.fecha}`;

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