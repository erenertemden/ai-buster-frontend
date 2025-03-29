let mediaId = null;

document.getElementById('uploadBtn').onclick = () => {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a video first!");
    return;
  }

  const videoPreview = document.getElementById('videoPreview');
  const previewContainer = document.getElementById('previewContainer');
  const resultLabel = document.getElementById('resultLabel');
  resultLabel.textContent = '';
  resultLabel.className = 'badge fs-2 mt-3';

  const reader = new FileReader();
  reader.onload = (e) => {
    videoPreview.src = e.target.result;
    previewContainer.classList.remove('d-none');
    videoPreview.play();
  };
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append('file', file);

  updateProgress(10);

  fetch('http://localhost:8080/api/media/upload', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    mediaId = data.media_id;
    pollStatus();
  })
  .catch(() => {
    alert("Upload failed!");
  });
};

function pollStatus() {
  const interval = setInterval(() => {
    fetch(`http://localhost:8080/api/media/status/${mediaId}`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 'DONE') {
        clearInterval(interval);
        updateProgress(100);
        showResult(data);
      } else {
        updateProgress(50);
      }
    })
    .catch(() => {
      clearInterval(interval);
      alert("Error checking status.");
    });
  }, 3000);
}

function updateProgress(value) {
  const progressBar = document.getElementById('progressBar');
  progressBar.style.width = `${value}%`;
}

function showResult(data) {
  const resultLabel = document.getElementById('resultLabel');
  if (data.is_ai_generated) {
    resultLabel.textContent = 'FAKE';
    resultLabel.classList.add('bg-danger');
  } else {
    resultLabel.textContent = 'REAL';
    resultLabel.classList.add('bg-success');
  }
}
