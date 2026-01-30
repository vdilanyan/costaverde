function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function () {
    const galleryData = [];

    JSON.parse(wp_var.gallery).forEach((item) => {
        galleryData.push({ url: item });
    });

    const images = document.querySelectorAll('.gallery .grid img');
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');

    let currentIndex = 0;
    let lightboxOpen = false;

    function openLightbox(index) {
        currentIndex = index;
        lightboxImage.src = galleryData[currentIndex].url;
        lightboxOverlay.style.display = 'flex';
        lightboxOpen = true;

        history.pushState({ lightbox: true }, '');
    }

    function closeLightbox() {
        if (!lightboxOpen) return;

        lightboxOverlay.style.display = 'none';
        lightboxOpen = false;

        if (history.state && history.state.lightbox) {
            history.back();
        }
    }

    function goNext(event) {
        event.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryData.length;
        lightboxImage.src = galleryData[currentIndex].url;
    }

    function goPrev(event) {
        event.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
        lightboxImage.src = galleryData[currentIndex].url;
    }

    function handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                goNext(event);
                break;
            case 'ArrowLeft':
                goPrev(event);
                break;
        }
    }

    window.addEventListener('popstate', () => {
        if (lightboxOpen) {
            closeLightbox();
        }
    });

    lightboxOverlay.addEventListener('click', (event) => {
        if (event.target === lightboxOverlay) {
            closeLightbox();
        }
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', goPrev);
    lightboxNext.addEventListener('click', goNext);
    document.addEventListener('keydown', handleKeyDown);

    images.forEach((img, index) => {
        img.addEventListener('click', () => openLightbox(index));
    });
});
