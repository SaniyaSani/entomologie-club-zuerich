document.addEventListener("DOMContentLoaded", () => {

    const hero = document.querySelector(
        '.page-hero[data-hero="slideshow"]'
    );

    if (!hero) {
        return;
    }


    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (prefersReducedMotion) {
        return;
    }


    const slides =
        hero.querySelectorAll(".page-hero__slide");


    if (slides.length < 2) {
        return;
    }


    let currentSlide = 0;

    const slideDuration =
        Number(hero.dataset.interval) || 5000;


    function showNextSlide() {

        slides[currentSlide]
            .classList.remove("is-active");

        currentSlide =
            (currentSlide + 1) % slides.length;

        slides[currentSlide]
            .classList.add("is-active");
    }


    setInterval(showNextSlide, slideDuration);

});