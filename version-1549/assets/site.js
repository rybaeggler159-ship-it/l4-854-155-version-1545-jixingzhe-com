(function() {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function() {
        var menuButton = document.querySelector("[data-menu-button]");
        var nav = document.getElementById("site-nav");
        if (menuButton && nav) {
            menuButton.addEventListener("click", function() {
                nav.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length) {
            var active = 0;
            var show = function(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function(slide, i) {
                    slide.classList.toggle("active", i === active);
                });
                dots.forEach(function(dot, i) {
                    dot.classList.toggle("active", i === active);
                });
            };
            dots.forEach(function(dot, i) {
                dot.addEventListener("click", function() {
                    show(i);
                });
            });
            show(0);
            window.setInterval(function() {
                show(active + 1);
            }, 5500);
        }

        var input = document.querySelector("[data-filter-input]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (input && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q");
            if (initial) {
                input.value = initial;
            }
            var apply = function() {
                var q = normalize(input.value);
                var y = yearSelect ? yearSelect.value : "";
                cards.forEach(function(card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.region,
                        card.dataset.type
                    ].join(" "));
                    var year = parseInt(card.dataset.year || "0", 10);
                    var passText = !q || haystack.indexOf(q) !== -1;
                    var passYear = true;
                    if (y === "2022") {
                        passYear = year && year <= 2022;
                    } else if (y) {
                        passYear = card.dataset.year === y;
                    }
                    card.style.display = passText && passYear ? "" : "none";
                });
            };
            input.addEventListener("input", apply);
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            apply();
        }
    });

    window.MovieSitePlayer = function(config) {
        var video = document.getElementById(config.videoId);
        var cover = document.getElementById(config.coverId);
        var button = document.getElementById(config.buttonId);
        var address = config.source;
        var attached = false;
        var hlsObject = null;

        if (!video || !cover || !button || !address) {
            return;
        }

        function attachMedia() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = address;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsObject = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsObject.loadSource(address);
                hlsObject.attachMedia(video);
            } else {
                video.src = address;
            }
        }

        function start() {
            attachMedia();
            cover.classList.add("is-hidden");
            video.controls = true;
            var playTask = video.play();
            if (playTask && playTask.catch) {
                playTask.catch(function() {
                    cover.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });
        cover.addEventListener("click", start);
        video.addEventListener("click", function() {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", function() {
            if (hlsObject) {
                hlsObject.destroy();
            }
        });
    };
})();
