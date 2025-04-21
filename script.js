
const video = document.getElementById('camera');
const idol = document.getElementById('idol');
const slider = document.getElementById('scaleSlider');
const captureBtn = document.getElementById('capture');

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
.then(stream => {
    video.srcObject = stream;
})
.catch(err => {
    alert("カメラ起動に失敗しました: " + err);
});

slider.addEventListener("input", () => {
    idol.style.transform = `translateX(-50%) scale(${slider.value})`;
});

captureBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = idol.src;
    img.onload = () => {
        const scale = parseFloat(slider.value);
        const idolWidth = img.width * scale;
        const idolHeight = img.height * scale;
        const x = (canvas.width - idolWidth) / 2;
        const y = canvas.height - idolHeight;
        ctx.drawImage(img, x, y, idolWidth, idolHeight);
        const link = document.createElement("a");
        link.download = "photo.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };
});
