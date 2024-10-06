// public/script.js

let imageUrl; // Variable to store the URL of the processed image

// Function to handle the image upload and background removal
async function handleUpload() {
    const fInput = document.getElementById('filepicker');
    const image = fInput.files[0];

    // Validate file input
    if (!image) {
        alert('Please select an image.');
        return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(image.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF).');
        return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
        alert('Please select an image smaller than 5MB.');
        return;
    }

    const formData = new FormData();
    formData.append("image_file", image);

    const loadingMsg = document.getElementById('loading-msg');
    const uploadBtn = document.getElementById('upload-btn');
    const downloadBtn = document.getElementById('download-btn');

    // Show the loading message and disable buttons
    loadingMsg.style.display = 'block';
    uploadBtn.disabled = true;
    downloadBtn.disabled = true;

    try {
        const response = await fetch('/remove-bg', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to remove background.');
        }

        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
        document.getElementById('output-img').src = imageUrl;

        // Display the original image
        const originalImg = document.getElementById('original-img');
        originalImg.src = URL.createObjectURL(image);
        
        // Show the output section
        document.getElementById('output-section').classList.remove('d-none');

        // Hide the loading message and enable the download button
        loadingMsg.style.display = 'none';
        uploadBtn.disabled = false;
        downloadBtn.disabled = false;
    } catch (error) {
        console.error(error);
        loadingMsg.style.display = 'none';
        uploadBtn.disabled = false;
        alert('Error: ' + error.message);
    }
}

// Function to download the processed image
function downloadFile() {
    if (imageUrl) {
        const anchor = document.createElement('a');
        anchor.href = imageUrl;
        anchor.download = 'new-image.png';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }
}

// Add event listeners to the upload and download buttons
document.getElementById('upload-btn').addEventListener('click', handleUpload);
document.getElementById('download-btn').addEventListener('click', downloadFile);
