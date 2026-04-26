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