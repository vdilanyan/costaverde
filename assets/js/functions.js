function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
}

// helper: accepts element | array | NodeList | null and returns array
function toEls(input) {
    if (!input) return [];
    if (input instanceof Element) return [input];
    return Array.from(input); // NodeList / HTMLCollection / array
}

function createCarousel({
    track,

    // can be one element OR a NodeList/array of elements
    prevBtn,
    nextBtn,

    // can be one element OR NodeList/array (but usually one)
    dotsContainer = null,

    slidesLg = 2,
    slidesSm = 1,
    slidesBreakpoint = 900,

    enableMinWidth = null,
    enableMaxWidth = null,
}) {
    if (!track) return null;

    const items = Array.from(track.children);
    if (!items.length) return null;

    const prevBtns = toEls(prevBtn);
    const nextBtns = toEls(nextBtn);
    const dotsContainers = toEls(dotsContainer); // allow multiple if you ever add more

    let slidesToShow = window.innerWidth >= slidesBreakpoint ? slidesLg : slidesSm;
    let currentIndex = 0;
    let enabled = false;

    let resizeDebounce = null;

    // store handlers so we can remove them
    const btnHandlers = new Map(); // Element -> { type, handler }

    // dots state (per container)
    let dotButtonsByContainer = new Map(); // container -> [buttons]
    let dotClickHandlersByContainer = new Map(); // container -> [{btn, handler}]

    function isEnabledForWidth(w) {
        if (enableMinWidth != null) return w >= enableMinWidth;
        if (enableMaxWidth != null) return w <= enableMaxWidth;
        return true;
    }

    function pagesCount() {
        return Math.ceil(items.length / slidesToShow);
    }

    function updateTrack(animate = true) {
        const pageStartItemIndex = currentIndex * slidesToShow;
        const pageStartItem = items[pageStartItemIndex];
        if (!pageStartItem) return;

        const offset = pageStartItem.offsetLeft - items[0].offsetLeft;

        track.style.transition = animate ? "" : "none";
        track.style.transform = `translateX(${-offset}px)`;

        if (!animate) {
            void track.offsetWidth;
            track.style.transition = "";
        }
    }

    function setNavVisible(visible) {
        // Don’t fight your responsive CSS; only hide when carousel is disabled
        // When enabled, let CSS decide which nav is visible (header vs footer).
        if (!visible) {
            prevBtns.forEach((b) => (b.style.display = "none"));
            nextBtns.forEach((b) => (b.style.display = "none"));
        } else {
            prevBtns.forEach((b) => (b.style.display = ""));
            nextBtns.forEach((b) => (b.style.display = ""));
        }
    }

    function updateDotsActive() {
        dotsContainers.forEach((container) => {
            const dotButtons = dotButtonsByContainer.get(container) || [];
            dotButtons.forEach((btn, i) => {
                btn.classList.toggle("is-active", i === currentIndex);
                btn.setAttribute("aria-current", i === currentIndex ? "true" : "false");
            });
        });
    }

    function destroyDots() {
        dotsContainers.forEach((container) => {
            const handlers = dotClickHandlersByContainer.get(container) || [];
            handlers.forEach(({ btn, handler }) => btn.removeEventListener("click", handler));

            dotClickHandlersByContainer.set(container, []);
            dotButtonsByContainer.set(container, []);

            container.innerHTML = "";
            container.style.display = "none";
        });
    }

    function buildDots() {
        if (!dotsContainers.length) return;

        destroyDots();

        const pages = pagesCount();
        if (pages <= 1) {
            // keep hidden
            return;
        }

        dotsContainers.forEach((container) => {
            container.style.display = "";
            container.innerHTML = "";

            const dotButtons = [];
            const clickHandlers = [];

            for (let i = 0; i < pages; i++) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "carousel-dot";
                btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
                btn.setAttribute("aria-current", "false");

                const handler = () => goTo(i);
                btn.addEventListener("click", handler);

                container.appendChild(btn);

                dotButtons.push(btn);
                clickHandlers.push({ btn, handler });
            }

            dotButtonsByContainer.set(container, dotButtons);
            dotClickHandlersByContainer.set(container, clickHandlers);
        });

        updateDotsActive();
    }

    function goTo(pageIndex) {
        const pages = pagesCount();
        currentIndex = Math.max(0, Math.min(pageIndex, pages - 1));
        updateTrack();
        updateDotsActive();
    }

    function next() {
        const pages = pagesCount();
        goTo((currentIndex + 1) % pages);
    }

    function prev() {
        const pages = pagesCount();
        goTo((currentIndex - 1 + pages) % pages);
    }

    function attachButtons() {
        // prev
        prevBtns.forEach((btn) => {
            if (btnHandlers.has(btn)) return;
            const handler = () => prev();
            btn.addEventListener("click", handler);
            btnHandlers.set(btn, { handler });
        });

        // next
        nextBtns.forEach((btn) => {
            if (btnHandlers.has(btn)) return;
            const handler = () => next();
            btn.addEventListener("click", handler);
            btnHandlers.set(btn, { handler });
        });
    }

    function detachButtons() {
        prevBtns.forEach((btn) => {
            const entry = btnHandlers.get(btn);
            if (!entry) return;
            btn.removeEventListener("click", entry.handler);
            btnHandlers.delete(btn);
        });

        nextBtns.forEach((btn) => {
            const entry = btnHandlers.get(btn);
            if (!entry) return;
            btn.removeEventListener("click", entry.handler);
            btnHandlers.delete(btn);
        });
    }

    function attach() {
        if (enabled) return;
        enabled = true;

        const pages = pagesCount();
        const showNav = pages > 1;

        // If only 1 page, hide all nav + dots even if enabled
        if (!showNav) {
            setNavVisible(false);
            destroyDots();
            updateTrack(false);
            return;
        }

        setNavVisible(true);     // CSS will decide header vs footer visibility
        attachButtons();
        buildDots();
        updateTrack(false);
    }

    function detach() {
        if (!enabled) return;
        enabled = false;

        detachButtons();

        track.style.transition = "none";
        track.style.transform = "";
        void track.offsetWidth;
        track.style.transition = "";

        setNavVisible(false);
        destroyDots();
    }

    function refresh() {
        const w = window.innerWidth;
        const shouldEnable = isEnabledForWidth(w);

        const prevSlidesToShow = slidesToShow;
        slidesToShow = w >= slidesBreakpoint ? slidesLg : slidesSm;

        if (!shouldEnable) {
            detach();
            return;
        }

        attach();

        const maxPage = pagesCount() - 1;
        if (currentIndex > maxPage) currentIndex = Math.max(0, maxPage);

        // if slidesToShow changed, page count changed → rebuild dots
        if (enabled && prevSlidesToShow !== slidesToShow) {
            buildDots();
        }

        updateTrack(false);
        updateDotsActive();
    }

    window.addEventListener("resize", () => {
        clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(refresh, 120);
    });

    refresh();

    return { refresh, detach, attach };
}

ready(() => {
    // Testimonials (always enabled, 1 on mobile, 2 on >=900)
    createCarousel({
        track: document.querySelector("#testimonials .carousel .reviews"),
        prevBtn: document.querySelectorAll("#testimonials .carousel-prev"),
        nextBtn: document.querySelectorAll("#testimonials .carousel-next"),
        slidesBreakpoint: 773,
        dotsContainer: document.querySelector("#testimonials .footer .carousel-dots"),
        slidesSm: 1,
        slidesLg: 2,
    });

    createCarousel({
        track: document.querySelector("#why-us .cards-section"),
        prevBtn: document.querySelector("#why-us .carousel-prev"),
        nextBtn: document.querySelector("#why-us .carousel-next"),
        slidesBreakpoint: 773,
        dotsContainer: document.querySelector("#why-us .carousel-dots"),
        slidesSm: 1,
        slidesLg: 2,
        enableMaxWidth: 772,
    });
});
