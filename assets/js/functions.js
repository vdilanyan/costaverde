function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function () {

});

(function () {
    const track = document.querySelector('#testimonials .carousel .reviews');
    if (!track) return;

    const items = Array.from(track.children);
    const prevBtn = document.querySelector('#testimonials .carousel-prev');
    const nextBtn = document.querySelector('#testimonials .carousel-next');
    if (!prevBtn || !nextBtn || items.length === 0) return;

    let slidesToShow = window.innerWidth >= 900 ? 2 : 1;
    let currentIndex = 0; // page index

    function pagesCount() {
        return Math.ceil(items.length / slidesToShow);
    }

    function updateTrack(animate = true) {
        const pageStartItemIndex = currentIndex * slidesToShow;
        const pageStartItem = items[pageStartItemIndex];
        if (!pageStartItem) return;

        const offset = pageStartItem.offsetLeft - items[0].offsetLeft;

        track.style.transition = animate ? '' : 'none';
        track.style.transform = `translateX(${-offset}px)`;

        if (!animate) {
            void track.offsetWidth;
            track.style.transition = '';
        }
    }

    function goTo(pageIndex) {
        const pages = pagesCount();
        currentIndex = Math.max(0, Math.min(pageIndex, pages - 1));
        updateTrack();
    }

    function next() {
        const pages = pagesCount();
        goTo((currentIndex + 1) % pages);
    }

    function prev() {
        const pages = pagesCount();
        goTo((currentIndex - 1 + pages) % pages);
    }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);

    let resizeDebounce;
    window.addEventListener('resize', () => {
        clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(() => {
            const newSlidesToShow = window.innerWidth >= 900 ? 2 : 1;
            if (newSlidesToShow !== slidesToShow) {
                slidesToShow = newSlidesToShow;
                if (currentIndex > pagesCount() - 1) currentIndex = pagesCount() - 1;
            }
            updateTrack(false);
        }, 120);
    });

    // init
    slidesToShow = window.innerWidth >= 900 ? 2 : 1;
    updateTrack(false);
})();
