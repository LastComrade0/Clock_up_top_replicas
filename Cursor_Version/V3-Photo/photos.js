// photos.js - Renderer process code for handling Google Photos

// Listen for token from main process
window.electron.ipcRenderer.on('google-token', async (event, token) => {
    try {
        const res = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const photos = await res.json();
        console.log('Google Photos:', photos);
        
        // Store photos in local state or update UI
        updatePhotoSlideshow(photos);
    } catch (error) {
        console.error('Error fetching Google Photos:', error);
    }
});

// Function to update the photo slideshow with fetched photos
function updatePhotoSlideshow(photos) {
    const slideshow = document.querySelector('.photo-slideshow');
    if (!slideshow) return;

    // Clear existing photos
    slideshow.innerHTML = '';

    // Add new photos
    photos.mediaItems.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.baseUrl;
        img.alt = photo.description || 'Google Photo';
        img.className = 'widget-photo';
        slideshow.appendChild(img);
    });

    // Initialize the slideshow
    startPhotoSlideshow();
}

// Initialize photo slideshow
function startPhotoSlideshow() {
    const photos = document.querySelectorAll('.widget-photo');
    if (photos.length < 2) return;

    let current = 0;
    setInterval(() => {
        photos[current].classList.remove('active');
        current = (current + 1) % photos.length;
        photos[current].classList.add('active');
    }, 3000);
}
