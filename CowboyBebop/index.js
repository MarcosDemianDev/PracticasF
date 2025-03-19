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

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
        const beta = e.beta; // Inclinación frontal (eje X)
        const gamma = e.gamma; // Inclinación lateral (eje Y)
        const maxTilt = 25; // Máxima inclinación permitida

        // Ajustar la sensibilidad
        const sensitivity = 0.5; // Puedes cambiar este valor para ajustar la sensibilidad
        rotationX = Math.max(Math.min(beta * sensitivity, maxTilt), -maxTilt);
        rotationY = Math.max(Math.min(gamma * sensitivity, maxTilt), -maxTilt);

        // Aplicar la rotación al contenedor
        container.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    });
} else {
    console.log("Tu dispositivo no soporta el evento de orientación.");
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