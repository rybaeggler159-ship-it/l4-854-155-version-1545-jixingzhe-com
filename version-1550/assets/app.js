(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-hero-dot"));
        if (!Number.isNaN(target)) {
          show(target);
          start();
        }
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var track = carousel.querySelector("[data-carousel-track]");
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
      if (!track) {
        return;
      }
      var amount = function () {
        return Math.max(280, Math.round(track.clientWidth * 0.85));
      };
      if (prev) {
        prev.addEventListener("click", function () {
          track.scrollBy({ left: -amount(), behavior: "smooth" });
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          track.scrollBy({ left: amount(), behavior: "smooth" });
        });
      }
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var area = panel.parentElement;
      var cards = Array.prototype.slice.call(area.querySelectorAll("[data-movie-card]"));
      var search = panel.querySelector("[data-filter-search]");
      var category = panel.querySelector("[data-filter-category]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var empty = panel.querySelector("[data-empty-result]");
      var params = new URLSearchParams(window.location.search);
      if (search && params.get("q")) {
        search.value = params.get("q");
      }

      function value(input) {
        return input ? input.value.trim().toLowerCase() : "";
      }

      function apply() {
        var q = value(search);
        var selectedCategory = value(category);
        var selectedType = value(type);
        var selectedYear = value(year);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-category"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchesSearch = !q || haystack.indexOf(q) !== -1;
          var matchesCategory = !selectedCategory || (card.getAttribute("data-category") || "").toLowerCase() === selectedCategory;
          var matchesType = !selectedType || (card.getAttribute("data-type") || "").toLowerCase().indexOf(selectedType) !== -1;
          var matchesYear = !selectedYear || (card.getAttribute("data-year") || "").toLowerCase().indexOf(selectedYear) !== -1;
          var show = matchesSearch && matchesCategory && matchesType && matchesYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, category, type, year].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCarousels();
    setupFilters();
  });
})();
