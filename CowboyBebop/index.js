const container = document.querySelector('.container');
let isDragging = false;
let rotationX = 0;
let rotationY = 0;
const sensitivity = 0.2; 
const maxRotation = 25; 
container.addEventListener('mousedown', () => {
    isDragging = true;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        rotationX = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2) * maxRotation;
        rotationY = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2) * maxRotation;

        rotationX = Math.max(Math.min(rotationX, maxRotation), -maxRotation);
        rotationY = Math.max(Math.min(rotationY, maxRotation), -maxRotation);

        container.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }
});

// Función para manejar el evento deviceorientation
const handleOrientation = (e) => {
    const beta = e.beta; // Inclinación frontal (eje X)
    const gamma = e.gamma; // Inclinación lateral (eje Y)

    // Ajustar la sensibilidad
    const sensitivity = 0.5; // Puedes cambiar este valor para ajustar la sensibilidad
    rotationX = Math.max(Math.min(beta * sensitivity, maxRotation), -maxRotation);
    rotationY = Math.max(Math.min(gamma * sensitivity, maxRotation), -maxRotation);

    // Aplicar la rotación al contenedor
    container.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
};

// Verificar si el dispositivo soporta deviceorientation
if (window.DeviceOrientationEvent) {
    // Solicitar permisos para acceder a los sensores (en algunos navegadores)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                } else {
                    console.log("Permisos denegados para acceder a los sensores.");
                    alert("Permisos denegados para acceder a los sensores. El efecto 3D no funcionará.");
                }
            })
            .catch(console.error);
    } else {
        // Navegadores que no requieren permisos explícitos
        window.addEventListener('deviceorientation', handleOrientation);
    }
} else {
    console.log("Tu dispositivo no soporta el evento de orientación.");
    alert("Tu dispositivo no soporta el evento de orientación. El efecto 3D no funcionará.");
}

const starsContainer = document.querySelector('.stars');

function createStars(numStars) {
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const x = Math.random() * 100;
        const y = Math.random() * 30; 
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;

        const duration = Math.random() * 2 + 1;
        star.style.animationDuration = `${duration}s`;

        starsContainer.appendChild(star);
    }
}

createStars(30);