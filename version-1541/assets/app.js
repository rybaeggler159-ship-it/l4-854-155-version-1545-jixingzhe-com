(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    function setupFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var sort = scope.querySelector('[data-sort-select]');
            var grid = scope.querySelector('[data-grid]');
            var empty = scope.querySelector('[data-empty]');
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
            if (input && input.hasAttribute('data-query-param')) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get(input.getAttribute('data-query-param')) || '';
                input.value = value;
            }

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function apply() {
                var keyword = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            function reorder() {
                if (!sort) {
                    return;
                }
                var value = sort.value;
                var sorted = cards.slice().sort(function (a, b) {
                    if (value === 'year') {
                        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                    }
                    if (value === 'rating') {
                        return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
                    }
                    if (value === 'title') {
                        return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
                    }
                    return 0;
                });
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (sort) {
                sort.addEventListener('change', function () {
                    reorder();
                    apply();
                });
            }
            reorder();
            apply();
        });
    }

    window.initMoviePlayer = function (videoId, streamUrl, buttonId) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video) {
            return;
        }
        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = streamUrl;
            }
            prepared = true;
        }

        function play() {
            prepare();
            video.controls = true;
            if (button) {
                button.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    };

    onReady(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
