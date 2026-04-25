function borrar() {
    let name = document.getElementById('name');
    let mail = document.getElementById('mail');
    let messag = document.getElementById('message');

    console.log('Nombre: ', name.value);
    console.log('Correo: ', mail.value);
    console.log('Mensaje: ', message.value);


    setTimeout(() => {
        name.value = '';
        mail.value = '';
        message.value = '';
    }, 1000);

}

function cambiarColor() {

    const rutaActual = window.location.pathname;

    const enlaces = document.querySelectorAll('nav a');

    enlaces.forEach(enlace => {
        // Obtenemos la URL actual sin hashes
        const urlActual = window.location.href.split('#')[0];
        
        // Comparamos la URL exacta
        if (enlace.href.split('#')[0] === urlActual) {
            enlace.classList.add('active');
        } else {
            enlace.classList.remove('active');
        }

        // Animación de transición al hacer clic
        enlace.addEventListener('click', function(e) {
            // Evitar interceptar enlaces vacíos o de la misma página
            if (this.getAttribute('href') === '#' || this.href === window.location.href) {
                return;
            }
            
            e.preventDefault();
            const destino = this.href;
            
            // Añadir clase de salida
            document.body.classList.add('fade-out');
            
            // Esperar a que termine la animación antes de redirigir (400ms)
            setTimeout(() => {
                window.location.href = destino;
            }, 400);
        });
    });
}

cambiarColor()