// script.js
document.getElementById("uploadForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const fileInput = document.getElementById("fileInput");
  const mediaType = document.getElementById("mediaType").value;
  const file = fileInput.files[0];
  const progressContainer = document.getElementById("progressContainer");
  const progressBar = document.getElementById("uploadProgress");
  const responseBox = document.getElementById("response");
  const spinner = document.getElementById("spinner");
  const uploadBtn = document.querySelector("button");
  const previewContainer = document.getElementById("previewContainer");

  previewContainer.innerHTML = "";
  responseBox.innerText = "";

  if (!file) {
      alert("Dosya seçmelisiniz.");
      return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("mediaFormat", mediaType);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  uploadBtn.disabled = true;
  uploadBtn.innerText = "Yükleniyor...";
  spinner.style.display = "block";

  try {
      const response = await fetch("http://localhost:8081/api/v1/media/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal
      });

      clearTimeout(timeoutId);
      spinner.style.display = "none";
      uploadBtn.disabled = false;
      uploadBtn.innerText = "Upload";

      if (response.ok) {
          const result = await response.text();
          const isValid = result === "true";
          const label = document.createElement("div");
          label.classList.add("preview-label", isValid ? "original" : "fake");
          label.innerText = isValid ? "Original" : "Fake";

          let mediaElement;
          if (mediaType === "IMAGE") {
              mediaElement = document.createElement("img");
              mediaElement.classList.add("preview-img");
              mediaElement.src = URL.createObjectURL(file);
          } else if (mediaType === "VIDEO") {
              mediaElement = document.createElement("video");
              mediaElement.classList.add("preview-video");
              mediaElement.src = URL.createObjectURL(file);
              mediaElement.controls = true;
          }

          if (mediaElement) {
              previewContainer.appendChild(mediaElement);
          }
          previewContainer.appendChild(label);

          responseBox.innerText = "FastAPI sonucu: " + (isValid ? "Onaylandı" : "Reddedildi");
          responseBox.style.color = isValid ? "green" : "red";
      } else {
          responseBox.innerText = "Sunucu hatası: " + response.statusText;
          responseBox.style.color = "red";
      }
  } catch (error) {
      spinner.style.display = "none";
      uploadBtn.disabled = false;
      uploadBtn.innerText = "Upload";

      if (error.name === "AbortError") {
          responseBox.innerText = "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.";
      } else {
          responseBox.innerText = "Hata: " + error.message;
      }
      responseBox.style.color = "red";
  }
});