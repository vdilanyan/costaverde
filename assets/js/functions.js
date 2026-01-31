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

    // drag options
    draggable = true,
    swipeThresholdPx = 50,
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
    const btnHandlers = new Map(); // Element -> { handler }

    // dots state (per container)
    let dotButtonsByContainer = new Map(); // container -> [buttons]
    let dotClickHandlersByContainer = new Map(); // container -> [{btn, handler}]

    // drag/swipe state
    let dragAttached = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startTranslateX = 0;

    // --- helpers ---
    function isEnabledForWidth(w) {
        if (enableMinWidth != null) return w >= enableMinWidth;
        if (enableMaxWidth != null) return w <= enableMaxWidth;
        return true;
    }

    function pagesCount() {
        return Math.ceil(items.length / slidesToShow);
    }

    function pageOffsetPx(pageIndex) {
        const pageStartItemIndex = pageIndex * slidesToShow;
        const pageStartItem = items[pageStartItemIndex];
        if (!pageStartItem) return 0;
        const offset = pageStartItem.offsetLeft - items[0].offsetLeft;
        return -offset;
    }

    function setTranslateX(px, animate) {
        track.style.transition = animate ? "" : "none";
        track.style.transform = `translateX(${px}px)`;
        if (!animate) {
            void track.offsetWidth; // force reflow
            track.style.transition = "";
        }
    }

    function updateTrack(animate = true) {
        // always snap to the current page start
        setTranslateX(pageOffsetPx(currentIndex), animate);
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

    // --- dots ---
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

    // --- navigation ---
    function goTo(pageIndex) {
        const pages = pagesCount();
        currentIndex = Math.max(0, Math.min(pageIndex, pages - 1));
        updateTrack(true);
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

    // --- dragging (mobile swipe) ---
    function attachDragging() {
        if (!draggable || dragAttached) return;

        dragAttached = true;

        const onPointerDown = (e) => {
            if (!enabled) return;
            // Only primary button for mouse
            if (e.pointerType === "mouse" && e.button !== 0) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startTranslateX = pageOffsetPx(currentIndex);

            // disable transition while dragging
            track.style.transition = "none";

            // capture pointer so we keep receiving events even if leaving track
            try {
                track.setPointerCapture(e.pointerId);
            } catch (_) {}
        };

        const onPointerMove = (e) => {
            if (!enabled || !isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // If user is scrolling vertically, abort drag and snap back
            if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
                isDragging = false;
                updateTrack(true);
                return;
            }

            // prevent page from scrolling horizontally when swiping
            if (Math.abs(dx) > 6) e.preventDefault();

            // bounds + resistance
            const minX = pageOffsetPx(pagesCount() - 1);
            const maxX = pageOffsetPx(0);

            let nextX = startTranslateX + dx;
            if (nextX > maxX) nextX = maxX + (nextX - maxX) * 0.25;
            if (nextX < minX) nextX = minX + (nextX - minX) * 0.25;

            track.style.transform = `translateX(${nextX}px)`;
        };

        const onPointerUp = (e) => {
            if (!enabled || !isDragging) return;
            isDragging = false;

            const dx = e.clientX - startX;

            // restore transition (updateTrack/goTo will re-enable it)
            track.style.transition = "";

            if (dx < -swipeThresholdPx) next();
            else if (dx > swipeThresholdPx) prev();
            else updateTrack(true);

            try {
                track.releasePointerCapture(e.pointerId);
            } catch (_) {}
        };

        // passive false on move so preventDefault works for horizontal swipe
        track.addEventListener("pointerdown", onPointerDown, { passive: true });
        track.addEventListener("pointermove", onPointerMove, { passive: false });
        track.addEventListener("pointerup", onPointerUp, { passive: true });
        track.addEventListener("pointercancel", onPointerUp, { passive: true });

        // save for cleanup
        track.__carouselDragHandlers = { onPointerDown, onPointerMove, onPointerUp };
    }

    function detachDragging() {
        if (!dragAttached) return;
        dragAttached = false;

        const h = track.__carouselDragHandlers;
        if (!h) return;

        track.removeEventListener("pointerdown", h.onPointerDown);
        track.removeEventListener("pointermove", h.onPointerMove);
        track.removeEventListener("pointerup", h.onPointerUp);
        track.removeEventListener("pointercancel", h.onPointerUp);

        track.__carouselDragHandlers = null;
    }

    // --- lifecycle ---
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
            // still ok to not attach dragging
            return;
        }

        setNavVisible(true); // CSS will decide header vs footer visibility
        attachButtons();
        buildDots();
        attachDragging();
        updateTrack(false);
    }

    function detach() {
        if (!enabled) return;
        enabled = false;

        detachButtons();
        detachDragging();

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
    // Testimonials (always enabled, 1 on mobile, 2 on >=breakpoint)
    createCarousel({
        track: document.querySelector("#testimonials .carousel .reviews"),
        prevBtn: document.querySelectorAll("#testimonials .carousel-prev"),
        nextBtn: document.querySelectorAll("#testimonials .carousel-next"),
        slidesBreakpoint: 773,
        dotsContainer: document.querySelector("#testimonials .footer .carousel-dots"),
        slidesSm: 1,
        slidesLg: 2,
        draggable: true,
    });

    // Why-us (enabled only up to 772px)
    createCarousel({
        track: document.querySelector("#why-us .cards-section"),
        prevBtn: document.querySelector("#why-us .carousel-prev"),
        nextBtn: document.querySelector("#why-us .carousel-next"),
        slidesBreakpoint: 773,
        dotsContainer: document.querySelector("#why-us .carousel-dots"),
        slidesSm: 1,
        slidesLg: 2,
        enableMaxWidth: 772,
        draggable: true,
    });
});
