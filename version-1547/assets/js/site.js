(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        let active = 0;
        let timer = null;

        const showSlide = function (next) {
            if (!slides.length) {
                return;
            }

            active = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === active);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === active);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    const filterBlocks = document.querySelectorAll('[data-filter-block]');

    filterBlocks.forEach(function (block) {
        const input = block.querySelector('[data-search-input]');
        const yearSelect = block.querySelector('[data-year-filter]');
        const typeSelect = block.querySelector('[data-type-filter]');
        const cards = Array.from(block.querySelectorAll('.movie-card'));

        const applyFilter = function () {
            const query = input ? input.value.trim().toLowerCase() : '';
            const year = yearSelect ? yearSelect.value : '';
            const type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search') || '').toLowerCase();
                const cardYear = card.getAttribute('data-year') || '';
                const cardType = card.getAttribute('data-type') || '';
                const matchedQuery = !query || text.indexOf(query) !== -1;
                const matchedYear = !year || cardYear === year;
                const matchedType = !type || cardType === type;
                card.classList.toggle('hidden-by-filter', !(matchedQuery && matchedYear && matchedType));
            });
        };

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }
    });

    const players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
        const video = player.querySelector('video');
        const overlay = player.querySelector('.play-overlay');
        if (!video || !overlay) {
            return;
        }

        const playUrl = video.getAttribute('data-play-url');
        let isReady = false;
        let hlsInstance = null;

        const prepare = function () {
            if (isReady || !playUrl) {
                return;
            }

            isReady = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = playUrl;
            }
        };

        const start = function () {
            prepare();
            overlay.classList.add('is-hidden');
            const playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        };

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!isReady) {
                start();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
