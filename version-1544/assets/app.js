(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applySearch(input) {
        var target = document.querySelector(input.getAttribute("data-target"));
        if (!target) {
            return;
        }
        var query = normalize(input.value);
        var cards = target.querySelectorAll("[data-title]");
        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre")
            ].join(" "));
            card.classList.toggle("is-hidden-by-search", query && haystack.indexOf(query) === -1);
        });
    }

    function applyFilter(button) {
        var group = button.closest(".filter-pills");
        if (!group) {
            return;
        }
        var target = document.querySelector(group.getAttribute("data-filter-target"));
        if (!target) {
            return;
        }
        group.querySelectorAll(".filter-pill").forEach(function (item) {
            item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        var value = button.getAttribute("data-filter");
        target.querySelectorAll("[data-title]").forEach(function (card) {
            var type = card.getAttribute("data-type") || "";
            card.classList.toggle("is-hidden-by-filter", value !== "all" && type !== value);
        });
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var open = menu.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        document.querySelectorAll(".site-search").forEach(function (input) {
            input.addEventListener("input", function () {
                applySearch(input);
            });
        });

        document.querySelectorAll(".filter-pill").forEach(function (button) {
            button.addEventListener("click", function () {
                applyFilter(button);
            });
        });
    });

    window.setupPlayer = function (source) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("play-overlay");
        var errorBox = document.getElementById("player-error");
        if (!video || !source) {
            return;
        }

        var hls = null;
        var readyToPlay = false;
        var requestedPlay = false;

        function showError() {
            if (errorBox) {
                errorBox.textContent = "播放暂时无法启动";
                errorBox.classList.add("is-visible");
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function tryPlay() {
            hideOverlay();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function attachSource() {
            if (readyToPlay) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                readyToPlay = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    readyToPlay = true;
                    if (requestedPlay) {
                        tryPlay();
                    }
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        showError();
                    }
                });
                return;
            }
            showError();
        }

        function startPlayback() {
            requestedPlay = true;
            attachSource();
            if (readyToPlay) {
                tryPlay();
            }
        }

        attachSource();

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("play", hideOverlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
