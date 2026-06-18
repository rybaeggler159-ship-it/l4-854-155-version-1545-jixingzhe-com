(function () {
    var mobileButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var show = function (index) {
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
            current = index;
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        setInterval(function () {
            show((current + 1) % slides.length);
        }, 6500);
    }

    var globalInput = document.getElementById("globalSearch");
    var globalButton = document.getElementById("globalSearchBtn");
    var globalResults = document.getElementById("searchResults");
    var runGlobalSearch = function () {
        if (!globalInput || !globalResults || !window.SEARCH_MOVIES) {
            return;
        }
        var query = globalInput.value.trim().toLowerCase();
        globalResults.innerHTML = "";
        if (!query) {
            globalResults.classList.remove("open");
            return;
        }
        var results = window.SEARCH_MOVIES.filter(function (item) {
            return [item.title, item.genre, item.region, item.year, item.category].join(" ").toLowerCase().indexOf(query) !== -1;
        }).slice(0, 12);
        results.forEach(function (item) {
            var a = document.createElement("a");
            a.className = "search-result-item";
            a.href = item.link;
            a.innerHTML = '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '"><span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.region + '</em></span>';
            globalResults.appendChild(a);
        });
        globalResults.classList.toggle("open", results.length > 0);
    };
    if (globalInput) {
        globalInput.addEventListener("input", runGlobalSearch);
        globalInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                runGlobalSearch();
            }
        });
    }
    if (globalButton) {
        globalButton.addEventListener("click", runGlobalSearch);
    }

    var localInput = document.querySelector(".local-filter");
    var yearFilter = document.querySelector(".year-filter");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));
    var runLocalFilter = function () {
        var query = localInput ? localInput.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        filterCards.forEach(function (card) {
            var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
            var yearOk = !year || card.dataset.year === year;
            var queryOk = !query || text.indexOf(query) !== -1;
            card.classList.toggle("is-hidden", !(yearOk && queryOk));
        });
    };
    if (localInput) {
        localInput.addEventListener("input", runLocalFilter);
    }
    if (yearFilter) {
        yearFilter.addEventListener("change", runLocalFilter);
    }

    window.initMoviePlayer = function (src) {
        var video = document.getElementById("movie-player");
        var layer = document.querySelector("[data-play-layer]");
        if (!video) {
            return;
        }
        var loaded = false;
        var start = function () {
            if (!loaded) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, function () {
                        var promise = video.play();
                        if (promise && promise.catch) {
                            promise.catch(function () {});
                        }
                    });
                    video._hls = hls;
                } else {
                    video.src = src;
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                }
                loaded = true;
            } else {
                var replay = video.play();
                if (replay && replay.catch) {
                    replay.catch(function () {});
                }
            }
            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.controls = true;
        };
        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                start();
            }
        });
    };
})();
