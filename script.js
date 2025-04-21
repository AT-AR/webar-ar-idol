
let camera, scene, renderer, idolMesh;
let video;
let scaleSlider = document.getElementById("scaleSlider");
let captureBtn = document.getElementById("capture");
let startBtn = document.getElementById("start");

startBtn.addEventListener("click", () => {
    startBtn.style.display = "none";
    init();
    animate();
});

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // video要素
    video = document.createElement("video");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    document.body.appendChild(video);

    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    .then(stream => {
        video.srcObject = stream;
        return video.play();
    })
    .then(() => {
        const videoTexture = new THREE.VideoTexture(video);
        const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const videoGeometry = new THREE.PlaneGeometry(2, 2);
        const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
        videoMesh.material.depthTest = false;
        videoMesh.material.depthWrite = false;
        videoMesh.renderOrder = -1;
        scene.add(videoMesh);
    })
    .catch(err => {
        alert("カメラの使用が許可されていません: " + err.message);
    });

    // idol画像読み込み
    const loader = new THREE.TextureLoader();
    loader.load("assets/idol.png", texture => {
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(0.5, 1);
        idolMesh = new THREE.Mesh(geometry, material);
        idolMesh.position.set(0, -0.5, -2);
        scene.add(idolMesh);
    });

    // iOSの傾きセンサー許可
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

    // スライダーによるサイズ調整
    scaleSlider.addEventListener("input", () => {
        if (idolMesh) {
            let scale = parseFloat(scaleSlider.value);
            idolMesh.scale.set(scale, scale, 1);
        }
    });

    // 撮影機能
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
    let beta = THREE.MathUtils.degToRad(event.beta || 0);
    let gamma = THREE.MathUtils.degToRad(event.gamma || 0);
    camera.rotation.x = beta - Math.PI / 2;
    camera.rotation.y = gamma;
}

function animate() {
    requestAnimationFrame(animate);
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}
