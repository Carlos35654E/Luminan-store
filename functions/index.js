const functions = require("firebase-functions/v1"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios"); 

// CONFIGURACIÓN DE GEMINI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.preguntarGemini = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    const prompt = req.body.prompt || "Hola";
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            systemInstruction: `Eres Luminan AI, el asistente virtual de la marca de ropa "Luminan Store". 
            Tu objetivo es ayudar a los clientes con un tono elegante, moderno, conciso y amable.
            
            Catálogo de productos (usa esta información para recomendar):
            - Calzado: Zapatillas Urbanas ($45), Botas Tácticas ($55), Botas de Combate ($62), Zapatillas Geobasket ($85), Botas Chrome ($110), Vomero 5 ($28), Ramones Lona ($70), Tacones Terciopelo ($60), Tacones Suela Roja ($95), Botines Rosados ($85), Zapatillas Balenciaga ($58).
            - Ropa de Mujer: Vestido Seda Esmeralda ($150), Abrigo Trench Beige ($120), Vestido de Noche Negro ($85), Traje Blanco Moderno ($112), Traje Otoño ($95), Vestido Invierno ($88), Vestido Capucha ($60), Conjunto Minimalista ($73), Bolso Monogram Diseñador ($199.90), Bolso Nylon Negro ($185).
            - Ropa de Hombre: Chaqueta Cuero Moto ($85), Camiseta Oversize ($12), Sudadera Minimalista ($25), Chaqueta Blouson Nappa ($95), Pantalones Pana ($35), Pack Camisetas Algodón ($11), Jeans 5 Bolsillos ($40), Camisa Manga Larga ($27.50), Polo Manga Corta ($22), Pantalones Skinny y Formales ($35-$89).
            
            Información general:
            - Categorías: Hombre, Mujer, Calzado y Alta Costura.
            - Contacto: Teléfono +503 1234 5678, Email contact@luminanstore.com.
            - Estilo: Mezcla de Streetwear y Alta Costura.
            
            Reglas:
            1. Si el usuario pide un producto que está en la lista de arriba, háblale sobre él. Si no sabes algo muy específico, invita al usuario a revisar el catálogo de la página.
            2. Mantén respuestas concisas (máximo 2 párrafos cortos) y usa emojis para ser amigable.
            3. No inventes precios ni productos que no existan en la lista anterior.`
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ respuesta: response.text() });
    } catch (error) {
        console.error("Error en preguntarGemini:", error);
        res.status(500).json({ error: error.message || "Error interno al generar contenido" });
    }
});

// BOT DE TELEGRAM
exports.sendContactNotification = functions.firestore
    .document("mensajes/{mensajeId}")
    .onCreate(async (snapshot, context) => {
        const contactData = snapshot.data();
        const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = "6905944815"; 
        const message = `Nuevo mensaje de contacto:\n\nNombre: ${contactData.nombre}\nEmail: ${contactData.correo}\nMensaje: ${contactData.mensaje}`;

        try {
            await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
                chat_id: chatId,
                text: message,
            });
            console.log("Notificación enviada a Telegram");
        } catch (error) {
            console.error("Error al enviar notificación a Telegram:", error);
        }
    });