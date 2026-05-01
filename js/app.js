import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, serverTimestamp, doc, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBbJ132Nypi8r326QCkxeKc9BKLI9KR-o",
  authDomain: "luminan-store.firebaseapp.com",
  projectId: "luminan-store",
  storageBucket: "luminan-store.firebasestorage.app",
  messagingSenderId: "995190345802",
  appId: "1:995190345802:web:cc62ccc49ee3ae33f7d6b3",
  measurementId: "G-L2N79RLX6W"
};

// recuerda tener estos imports arriba con los demás
// import { doc, setDoc, collection, getCountFromServer, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function enviarMensaje() {
    const name = document.getElementById('name');
    const mail = document.getElementById('mail');
    const message = document.getElementById('message');
    const btn = document.getElementById('send');

    if (!name.value || !mail.value || !message.value) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    btn.disabled = true;
    btn.innerText = 'Enviando...';

    try {
        // contamos cuántos hay y creamos tu id facherito
        const coll = collection(db, "mensajes");
        const snapshot = await getCountFromServer(coll);
        const nuevoNumero = snapshot.data().count + 1;
        const idPersonalizado = "Mensaje " + nuevoNumero;

        // usamos setDoc con doc para forzar el nombre
        await setDoc(doc(db, "mensajes", idPersonalizado), {
            nombre: name.value,
            correo: mail.value,
            mensaje: message.value,
            fecha: serverTimestamp()
        });

        btn.innerText = 'Mensaje Enviado'; 
        
        name.value = '';
        mail.value = '';
        message.value = '';

        setTimeout(() => {
            btn.disabled = false;
            btn.innerText = 'Enviar';
        }, 3000);

    } catch (e) {
        console.error("Error al enviar: ", e);
        alert('Hubo un error al enviar el mensaje, intentalo de nuevo');
        btn.disabled = false;
        btn.innerText = 'Enviar';
    }
}

// Escuchar el clic del botón de envío si existe en la página
const sendBtn = document.getElementById('send');
if (sendBtn) {
    sendBtn.addEventListener('click', enviarMensaje);
}

function cambiarColor() {
    const enlaces = document.querySelectorAll('nav a');
    enlaces.forEach(enlace => {
        const urlActual = window.location.href.split('#')[0];
        if (enlace.href.split('#')[0] === urlActual) {
            enlace.classList.add('active');
        } else {
            enlace.classList.remove('active');
        }

        enlace.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#' || this.href === window.location.href) {
                return;
            }
            e.preventDefault();
            const destino = this.href;
            document.body.classList.add('fade-out');
            setTimeout(() => {
                window.location.href = destino;
            }, 400);
        });
    });
}

const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');

if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
    });
}

cambiarColor();



async function enviarMensajeALaIA(textoDelUsuario) {
    const miServidorURL = "https://us-central1-luminan-store.cloudfunctions.net/preguntarGemini"; // La que te da la terminal

    const respuesta = await fetch(miServidorURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textoDelUsuario })
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
        throw new Error(datos.error || `Error del servidor: ${respuesta.status}`);
    }
    return datos.respuesta;
}

function initChatbot() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chatbot-container';
    chatContainer.innerHTML = `
        <div id="chatbot-button" class="chatbot-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <div id="chatbot-window" class="chatbot-window hidden">
            <div class="chatbot-header">
                <h3>Luminan AI</h3>
                <button id="chatbot-close">×</button>
            </div>
            <div id="chatbot-messages" class="chatbot-messages">
                <div class="message ai-message">¡Hola! Soy el asistente virtual de Luminan Store. ¿En qué te puedo ayudar hoy?</div>
            </div>
            <div class="chatbot-input">
                <input type="text" id="chatbot-input-field" placeholder="Escribe tu mensaje...">
                <button id="chatbot-send-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatContainer);

    const chatbotBtn = document.getElementById('chatbot-button');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input-field');
    const chatbotSendBtn = document.getElementById('chatbot-send-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');

    chatbotBtn.addEventListener('click', () => {
        chatbotWindow.classList.toggle('hidden');
        if (!chatbotWindow.classList.contains('hidden')) {
            chatbotInput.focus();
        }
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.add('hidden');
    });

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        // Simple formatter for bold text and line breaks that Gemini returns
        let formattedText = typeof text === 'string' ? text : String(text);
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        msgDiv.innerHTML = formattedText;
        
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const showTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('typing-indicator');
        typingDiv.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    };

    const hideTypingIndicator = () => {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    };

    const handleSend = async () => {
        const text = chatbotInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatbotInput.value = '';
        
        showTypingIndicator();

        try {
            const response = await enviarMensajeALaIA(text);
            hideTypingIndicator();
            addMessage(response, 'ai');
        } catch (error) {
            console.error(error);
            hideTypingIndicator();
            addMessage("Lo siento, hubo un error al conectar con la IA. Intenta nuevamente más tarde.", 'ai');
        }
    };

    chatbotSendBtn.addEventListener('click', handleSend);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
}

// Iniciar chatbot al cargar la página o cuando todo esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}