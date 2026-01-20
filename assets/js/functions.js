function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function () {

});

(function(){
    const track = document.querySelector('.carousel .reviews');
    const items = Array.from(track.children);
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    let slidesToShow = window.innerWidth >= 900 ? 2 : 1;
    let currentIndex = 0; // page index (not item index)

    function pagesCount() {
        return Math.ceil(items.length / slidesToShow);
    }

    function setWidths() {
        // adjust min-width for items (done in CSS for common cases)
        // JS will position via transform
        updateTrack();
    }

    function updateTrack(animate=true) {
        const pageWidth = track.getBoundingClientRect().width;
        const offset = pageWidth * currentIndex;
        if (!animate) track.style.transition = 'none';
        else track.style.transition = '';
        track.style.transform = `translateX(${-offset}px)`;
        if (!animate) {
            // force reflow then restore transition
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

    prevBtn.addEventListener('click', ()=> { prev(); });
    nextBtn.addEventListener('click', ()=> { next(); });

    let resizeDebounce;
    window.addEventListener('resize', ()=> {
        clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(()=> {
            const newSlidesToShow = window.innerWidth >= 900 ? 2 : 1;
            if (newSlidesToShow !== slidesToShow) {
                slidesToShow = newSlidesToShow;
                // ensure currentIndex is within bounds
                if (currentIndex > pagesCount()-1) currentIndex = pagesCount()-1;
            }
            setWidths();
        }, 120);
    });

    (function init(){
        slidesToShow = window.innerWidth >= 900 ? 2 : 1;
        updateTrack(false);
    })();
})();
