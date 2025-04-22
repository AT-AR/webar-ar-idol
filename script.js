
let camera, scene, renderer, idolMesh;
let video;
const scaleSlider = document.getElementById("scaleSlider");
const captureBtn = document.getElementById("capture");
const startButton = document.getElementById("startButton");

startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    init();
    animate();
}, { once: true });

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.z = 1.2;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    video = document.createElement("video");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.style.display = "none";
    document.body.appendChild(video);

    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        },
        audio: false
    })
    .then(stream => {
        video.srcObject = stream;
        video.addEventListener("canplay", () => {
            const videoTexture = new THREE.VideoTexture(video);
            const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
            const videoGeometry = new THREE.PlaneGeometry(6, 3.5); // 大きめ背景
            const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
            videoMesh.material.depthTest = false;
            videoMesh.material.depthWrite = false;
            videoMesh.renderOrder = -1;
            videoMesh.position.z = -5; // 少し奥に配置
            scene.add(videoMesh);
        });
        return video.play();
    })
    .catch(err => {
        alert("カメラの使用が許可されていません: " + err.message);
    });

    const loader = new THREE.TextureLoader();
    const img = new Image();
    img.src = "assets/idol.png";
    img.onload = () => {
        const aspect = img.width / img.height;
        loader.load("assets/idol.png", texture => {
            const geometry = new THREE.PlaneGeometry(aspect, 1);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            idolMesh = new THREE.Mesh(geometry, material);
            idolMesh.position.set(0, -0.5, -2);
            idolMesh.scale.set(1.2, 1.2, 1); // 初期スケール少し大きく
            scene.add(idolMesh);
        });
    };

    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === "granted") {
                    window.addEventListener("deviceorientation", handleOrientation);
                } else {
                    alert("端末の向き情報が許可されていません");
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener("deviceorientation", handleOrientation);
    }

    scaleSlider.addEventListener("input", () => {
        if (idolMesh) {
            const scale = parseFloat(scaleSlider.value);
            idolMesh.scale.set(scale, scale, 1);
        }
    });

    captureBtn.addEventListener("click", () => {
        renderer.render(scene, camera);
        const dataURL = renderer.domElement.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "photo.png";
        link.href = dataURL;
        link.click();
    });
}

function handleOrientation(event) {
    const beta = THREE.MathUtils.degToRad(event.beta || 0);
    const gamma = THREE.MathUtils.degToRad(event.gamma || 0);
    camera.rotation.x = beta - Math.PI / 2;
    camera.rotation.y = gamma;
}

function animate() {
    requestAnimationFrame(animate);
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}
