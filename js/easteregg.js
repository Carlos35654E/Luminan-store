import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBbJ132Nypi8r326QCkxeKc9BKLI9KR-o",
  authDomain: "luminan-store.firebaseapp.com",
  projectId: "luminan-store",
  storageBucket: "luminan-store.firebasestorage.app",
  messagingSenderId: "995190345802",
  appId: "1:995190345802:web:cc62ccc49ee3ae33f7d6b3",
  measurementId: "G-L2N79RLX6W"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencia al documento 'visitas' en la colección 'estadisticas'
const visitasRef = doc(db, "estadisticas", "visitas");

// Función para incrementar el contador de visitas
async function registrarVisita() {
    try {
        // Generar la fecha y hora en la zona horaria UTC-6
        const fechaFormateada = new Date().toLocaleString('es-ES', {
            timeZone: 'America/Costa_Rica', // Zona horaria que siempre es UTC-6
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true
        }) + ' (UTC-6)';

        await updateDoc(visitasRef, {
            contador: increment(1),
            ultimaVisita: fechaFormateada
        });
        console.log("Visita al Easter Egg registrada!");
    } catch (error) {
        console.error("Error al registrar la visita:", error);
    }
}

// Ejecutar el contador cuando cargue el script
registrarVisita();
