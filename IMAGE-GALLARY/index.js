// ---------------------------------------------------------------------
//  Images are now loaded from the local files k1.jpg – k9.jpg
// ---------------------------------------------------------------------
const images = [];

// Generate image objects for k1-k9.jpg
for (let i = 1; i <= 9; i++) {
    images.push({
        src: `k${i}.jpg`,                         // <-- local file in root
        title: `Image ${i}`,                      // you can edit titles
        description: `Description for image ${i}.`, // you can edit descriptions
        category: i <= 3 ? 'Nature' : (i <= 6 ? 'Urban' : 'Art') // demo categories
    });
}

// ---------------------------------------------------------------------
//  The rest of the script is unchanged (search, filter, lightbox, etc.)
// ---------------------------------------------------------------------
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaptionTitle = document.querySelector('#lightboxCaption h3');
const lightboxCaptionDesc = document.querySelector('#lightboxCaption p');
const closeBtn = document.getElementById('closeBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const categoryFilter = document.getElementById('categoryFilter');
const toggleView = document.getElementById('toggleView');

let currentIndex = 0;
let filteredImages = [...images];
let isListView = false;

// Populate category dropdown
function populateCategories() {
    const categories = new Set(images.map(img => img.category));
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

// Create gallery items
function createGallery(imagesToShow) {
    gallery.innerHTML = '';
    imagesToShow.forEach((img, index) => {
        const item = document.createElement('div');
        item.classList.add('gallery-item');
        item.dataset.index = images.indexOf(img); // original index for lightbox

        item.innerHTML = `
            <img src="${img.src}" alt="${img.title}" loading="lazy">
            <div class="caption">
                <h3>${img.title}</h3>
                <p>${img.description}</p>
            </div>
        `;

        item.addEventListener('click', () => openLightbox(item.dataset.index));
        gallery.appendChild(item);
    });
}

// Filter images (search + category)
function filterImages() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    filteredImages = images.filter(img => {
        const matchesSearch = img.title.toLowerCase().includes(searchTerm) ||
                              img.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    createGallery(filteredImages);
}

// Lightbox --------------------------------------------------------------
function openLightbox(index) {
    currentIndex = parseInt(index);
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateLightbox() {
    const img = images[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.title;
    lightboxCaptionTitle.textContent = img.title;
    lightboxCaptionDesc.textContent = img.description;

    // Download button
    downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = img.src;
        a.download = img.src.split('/').pop(); // uses original filename
        a.click();
    };

    // Share button (Web Share API fallback)
    shareBtn.onclick = () => {
        if (navigator.share) {
            navigator.share({
                title: img.title,
                text: img.description,
                url: location.href
            }).catch(() => alert('Share failed'));
        } else {
            prompt('Copy this link:', img.src);
        }
    };
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightbox();
}

function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightbox();
}

// View toggle -----------------------------------------------------------
function toggleGalleryView() {
    isListView = !isListView;
    gallery.classList.toggle('list-view', isListView);
    toggleView.textContent = isListView ? 'Grid View' : 'List View';
}

// Event Listeners -------------------------------------------------------
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', showPrev);
nextBtn.addEventListener('click', showNext);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape') closeLightbox();
});

searchInput.addEventListener('input', () => {
    filterImages();
    clearSearch.style.display = searchInput.value ? 'block' : 'none';
});
clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    filterImages();
});
categoryFilter.addEventListener('change', filterImages);
toggleView.addEventListener('click', toggleGalleryView);

// Init ------------------------------------------------------------------
populateCategories();
createGallery(images);