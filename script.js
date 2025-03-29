let mediaId = null;

document.getElementById('uploadBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert("Please select a file first!");
    return;
  }
  
  const formData = new FormData();
  formData.append('file', file);

  showStatus("Uploading file and starting analysis...", 'info');

  fetch('http://localhost:8080/api/media/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    mediaId = data.media_id;
    pollStatus();
  })
  .catch(() => {
    showStatus("Upload failed. Try again.", 'danger');
  });
});

function pollStatus() {
  const interval = setInterval(() => {
    fetch(`http://localhost:8080/api/media/status/${mediaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'DONE') {
          clearInterval(interval);
          displayResult(data);
        } else {
          showStatus(`Current Status: ${data.status}`, 'info');
        }
      })
      .catch(() => {
        showStatus("Error checking status.", 'danger');
        clearInterval(interval);
      });
  }, 3000);
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.className = `alert alert-${type} mt-3`;
  status.textContent = message;
  status.classList.remove('d-none');
}

function displayResult(data) {
  const resultDiv = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  
  resultText.innerHTML = `
    AI-generated: <strong>${data.is_ai_generated ? 'Yes' : 'No'}</strong><br>
    Confidence: <strong>${Math.round(data.confidence * 100)}%</strong>
  `;
  
  resultDiv.classList.remove('d-none');
  showStatus("Analysis complete!", 'success');
}