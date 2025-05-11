let camera, scene, renderer, car, composer, bloomPass, effectFXAA;
let currentAngle = 0;
const frameRate = 80;
let lastFrameTime = 0;

// Ángulos predefinidos
const angles = [
    { camPosition: { x: 0, y: 1.5, z: 5 }, text: "Pagani Huayra BC 16", desc: "El Huayra BC 2016 muestra su splitter frontal activo en fibra de carbono 'T800' y tomas de aire que refrigeran el V12 AMG de 750 CV. Las luces bi-LED con diseño de lágrima y el logo en aluminio fresado son emblemáticos."},
    { camPosition: { x: 4, y: 1.5, z: 0 }, text: "Pagani Huayra BC 16", desc: "Aquí se aprecian las puertas 'gullwing' con bisagras de titanio y los badges 'BC' que rinden homenaje a Benny Caiola. Los espejos retrovisores en fibra de carbono optimizan el flujo aerodinámico." },
    { camPosition: { x: -3, y: 1.5, z: -5 }, text: "Pagani Huayra BC 16", desc: "El difusor trasero en forma de 'W' y el sistema de escape cuádruple en aleación de magnesio destacan. El alerón activo genera 500 kg de carga aerodinámica a velocidad máxima (370 km/h)." },
    { camPosition: { x: -5, y: 1.5, z: 0 }, text: "Pagani Huayra BC 16", desc: "Perfil que revela las llantas forjadas APP Tech de 20\" con neumáticos Pirelli P Zero Corsa y frenos Brembo carbocerámicos. El peso se reduce a 1.218 kg gracias al monocasco en 'Carbo-Titanium HP62'." },
    { camPosition: { x: 0, y: 7, z: 0.1 }, text: "Pagani Huayra BC 16", desc: "Desde este ángulo se observa el techo en fibra de carbono con ventilación NACA, los air scoops laterales y los 2,300 remaches aeronáuticos que aseguran la carrocería. Edición limitada a 20 unidades." }
];

function init() {
    // 1. Renderizador con configuración avanzada
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limitar pixel ratio para performance
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 2. Escena con ambiente controlado
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.FogExp2(0x111111, 0.015);
    
    // 3. Cámara con configuración profesional
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 3, 10);
    camera.lookAt(0, 0.5, 0);

    // 4. Configuración de escenario y luces
    setupScene();
    
    // 5. Cargar modelo con mejoras de materiales
    loadCarModel();

    // 6. Controles
    setupControls();
    
    // 7. Configurar post-processing
    setupPostProcessing();
    
    // 8. Animación
    animate();
}

function setupPostProcessing() {
    // Configurar efectos post-procesamiento si es necesario
    // (Puedes implementar bloom, SSAO, etc. aquí)
}

function setupScene() {
    // SUELO MEJORADO con textura de reflejo
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.15,
        metalness: 0.95,
        side: THREE.DoubleSide,
        envMapIntensity: 1.5
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // PAREDES con mejor configuración de reflejos
    const wallsGeometry = new THREE.BoxGeometry(18, 8, 18);
    const wallsMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x303030,
        transmission: 0.85,
        roughness: 0.05,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
        ior: 1.5,
        thickness: 0.1
    });
    
    const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
    walls.position.y = 3;
    scene.add(walls);

    // ILUMINACIÓN PROFESIONAL mejorada
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Luz principal con sombras (estilo estudio fotográfico)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 15, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 4096;
    keyLight.shadow.mapSize.height = 4096;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Luz de relleno cálida (sin sombras)
    const fillLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
    fillLight.position.set(-2, 5, 8);
    scene.add(fillLight);

    // Luz de acento para brillos metálicos
    const accentLight = new THREE.DirectionalLight(0xffffff, 1.0);
    accentLight.position.set(-5, 3, -10);
    scene.add(accentLight);

    // Luces de ambiente (light probes) para reflejos realistas
    const envLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    scene.add(envLight);

    // Environment map HDRI para reflejos
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    // Crear un environment map neutro pero con buen contraste
    const sceneEnv = new THREE.Scene();
    const envMap = pmremGenerator.fromScene(sceneEnv).texture;
    scene.environment = envMap;
    scene.background = envMap;
}

function loadCarModel() {
    const loader = new THREE.GLTFLoader();
    
    loader.register((parser) => ({
        materialExtension: {
            extendMaterialParams: () => Promise.resolve()
        }
    }));

    showLoadingIndicator();

    loader.load('assets/pagani_huayra_bc_16.glb', (gltf) => {
        car = gltf.scene;
        
        // Ajuste de escala y posición
        car.scale.set(140, 140, 140);
        car.position.set(0, 0, 0);
        car.rotation.set(0, Math.PI/4, 0);
        
        // Configuración avanzada de materiales
        car.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Identificar y mejorar materiales de vidrio
                if (child.material && (child.name.includes('glass') || 
                                       child.name.includes('window') || 
                                       child.name.includes('parabrisas') ||
                                       child.name.includes('windshield'))) {
                    
                    // Material de vidrio ultra realista
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0x000000,
                        transmission: 0.95,
                        roughness: 0.05,
                        metalness: 0.0,
                        ior: 1.52,
                        thickness: 0.5,
                        envMapIntensity: 1.5,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.05,
                        transparent: true,
                        opacity: 0.98,
                        side: THREE.DoubleSide
                    });
                } 
                // Mejorar materiales metálicos (carrocería, llantas)
                else if (child.material && (child.name.includes('body') || 
                                          child.name.includes('wheel') ||
                                          child.name.includes('chassis'))) {
                    
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: child.material.color || 0x333333,
                        roughness: 0.15,
                        metalness: 0.95,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.1,
                        envMapIntensity: 1.8,
                        anisotropy: 0.5
                    });
                }
                // Mejorar materiales de plástico y caucho
                else if (child.material && (child.name.includes('tire') || 
                                          child.name.includes('rubber') ||
                                          child.name.includes('interior'))) {
                    
                    child.material.roughness = 0.7;
                    child.material.metalness = 0.1;
                    child.material.envMapIntensity = 0.5;
                }
                // Mejorar materiales de carbono
                else if (child.material && (child.name.includes('carbon') || 
                                          child.name.includes('fiber'))) {
                    
                    child.material.roughness = 0.4;
                    child.material.metalness = 0.8;
                    child.material.envMapIntensity = 1.5;
                    
                    // Opcional: Añadir textura de fibra de carbono si está disponible
                }
                
                // Ajustes generales para todos los materiales
                if (child.material) {
                    child.material.needsUpdate = true;
                    
                    // Aumentar saturación de colores
                    if (child.material.color) {
                        const hsl = { h: 0, s: 0, l: 0 };
                        child.material.color.getHSL(hsl);
                        child.material.color.setHSL(hsl.h, Math.min(hsl.s * 1.5, 1.0), hsl.l);
                    }
                }
            }
        });
        
        scene.add(car);
        hideLoadingIndicator();
        updateCameraAndText();
        
        // Forzar actualización de environment map después de cargar el modelo
        setTimeout(() => {
            scene.environment.needsUpdate = true;
        }, 500);
    }, 
    (xhr) => {
        const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
        updateLoadingProgress(percent);
    }, 
    (error) => {
        console.error("Error cargando modelo:", error);
        hideLoadingIndicator();
    });
}

// Mostrar indicador de carga
function showLoadingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'model-loader';
    loader.style.position = 'fixed';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-50%, -50%)';
    loader.style.color = '#fff';
    loader.style.fontFamily = 'Arial, sans-serif';
    loader.style.fontSize = '18px';
    loader.style.textShadow = '0 0 5px rgba(0,0,0,0.5)';
    loader.style.zIndex = '1000';
    loader.innerHTML = 'Cargando modelo... <span id="load-percent">0%</span>';
    document.body.appendChild(loader);
}

// Actualizar progreso de carga
function updateLoadingProgress(percent) {
    const percentEl = document.getElementById('load-percent');
    if (percentEl) percentEl.textContent = `${percent}%`;
}

// Ocultar indicador de carga
function hideLoadingIndicator() {
    const loader = document.getElementById('model-loader');
    if (loader) document.body.removeChild(loader);
}

// Configuración de controles
function setupControls() {
    document.getElementById('next-btn').addEventListener('click', () => {
        currentAngle = (currentAngle + 1) % angles.length;
        updateCameraAndText();
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        currentAngle = (currentAngle - 1 + angles.length) % angles.length;
        updateCameraAndText();
    });

    window.addEventListener('resize', onWindowResize);
}

// Animación
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < 1000 / frameRate) return;
    lastFrameTime = currentTime;
    
    // Rotación sutil del auto para mostrar reflejos
    if (car) {
        car.rotation.y += 0.001;
    }
    
    renderer.render(scene, camera);
    
    // Aplicar post-processing si está configurado
    if (composer) {
        composer.render();
    }
}

// Actualizar cámara
function updateCameraAndText() {
    const angleData = angles[currentAngle];
    
    gsap.to(camera.position, {
        x: angleData.camPosition.x,
        y: angleData.camPosition.y,
        z: angleData.camPosition.z,
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(0, 0.5, 0)
    });
    
    // Animación de texto
    gsap.to('#car-info', {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            document.querySelector('#car-info h2').textContent = angleData.text;
            document.querySelector('#car-info p').textContent = angleData.desc;
            gsap.to('#car-info', { opacity: 1, duration: 0.5 });
        }
    });
}

// Redimensionado
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Iniciar la aplicación
init();