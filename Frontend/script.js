const dropZone    = document.getElementById("dropZone");
const imageInput  = document.getElementById("imageInput");
const previewBox  = document.getElementById("previewBox");
const preview     = document.getElementById("preview");
const removeBtn   = document.getElementById("removeBtn");
const predictBtn  = document.getElementById("predictBtn");
const resultCard  = document.getElementById("resultCard");
const resultDisease  = document.getElementById("resultDisease");
const confidenceText = document.getElementById("confidenceText");
const confidenceBar  = document.getElementById("confidenceBar");
const spinnerWrap    = document.getElementById("spinnerWrap");

let selectedFile = null;

// ── Drag & Drop Events ──────────────────────────────────────
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
        loadFile(file);
    }
});

// Click on drop zone to open file picker (except the Browse button)
dropZone.addEventListener("click", (e) => {
    if (e.target !== document.querySelector(".browse-btn")) {
        imageInput.click();
    }
});

// ── File Input Change ───────────────────────────────────────
imageInput.addEventListener("change", () => {
    if (imageInput.files[0]) {
        loadFile(imageInput.files[0]);
    }
});

// ── Load & Preview File ─────────────────────────────────────
function loadFile(file) {
    selectedFile = file;
    preview.src = URL.createObjectURL(file);
    dropZone.style.display = "none";
    previewBox.style.display = "block";
    predictBtn.disabled = false;

    // Reset previous result
    resultCard.style.display = "none";
    confidenceBar.style.width = "0%";
}

// ── Remove Image ────────────────────────────────────────────
removeBtn.addEventListener("click", () => {
    selectedFile = null;
    imageInput.value = "";
    preview.src = "";
    previewBox.style.display = "none";
    dropZone.style.display = "block";
    predictBtn.disabled = true;
    resultCard.style.display = "none";
    spinnerWrap.style.display = "none";
});

// ── Predict ─────────────────────────────────────────────────
async function uploadImage() {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    // Show spinner, hide result
    spinnerWrap.style.display = "block";
    resultCard.style.display = "none";
    predictBtn.disabled = true;

    try {
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            showError(data.error);
            return;
        }

        // Display result
        resultDisease.textContent = data.prediction;
        confidenceText.textContent = data.confidence + "%";

        // Animate confidence bar after a short delay
        setTimeout(() => {
            confidenceBar.style.width = data.confidence + "%";
        }, 100);

        resultCard.style.display = "block";

    } catch (err) {
        showError("Could not connect to the server. Make sure app.py is running.");
    } finally {
        spinnerWrap.style.display = "none";
        predictBtn.disabled = false;
    }
}

function showError(msg) {
    resultDisease.textContent = "⚠ " + msg;
    resultDisease.style.color = "#f87171";
    confidenceText.textContent = "—";
    confidenceBar.style.width = "0%";
    resultCard.style.display = "block";
}