
let camera, scene, renderer, idolMesh, video;
let scaleSlider = document.getElementById("scaleSlider");
let captureBtn = document.getElementById("capture");

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 100);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // カメラ背景映像
    video = document.createElement("video");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
    .then(stream => {
        video.srcObject = stream;
        video.play();
        const videoTexture = new THREE.VideoTexture(video);
        const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
        const videoGeometry = new THREE.PlaneGeometry(2, 2);
        const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
        videoMesh.material.depthTest = false;
        videoMesh.material.depthWrite = false;
        videoMesh.renderOrder = -1;
        scene.add(videoMesh);
    });

    // アイドル画像テクスチャ
    const loader = new THREE.TextureLoader();
    loader.load("assets/idol.png", texture => {
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const geometry = new THREE.PlaneGeometry(0.5, 1);
        idolMesh = new THREE.Mesh(geometry, material);
        idolMesh.position.set(0, -0.5, -2);
        scene.add(idolMesh);
    });

    // 端末の傾きに応じてカメラの向き変更
    window.addEventListener("deviceorientation", (event) => {
        let beta = THREE.MathUtils.degToRad(event.beta || 0);
        let gamma = THREE.MathUtils.degToRad(event.gamma || 0);
        camera.rotation.x = beta - Math.PI / 2;
        camera.rotation.y = gamma;
    });

    // スライダーで拡大縮小
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

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
