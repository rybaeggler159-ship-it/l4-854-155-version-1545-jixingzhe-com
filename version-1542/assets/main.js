document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  var filterRoot = document.querySelector("[data-filter-root]");
  if (filterRoot) {
    var searchInput = filterRoot.querySelector("[data-filter-search]");
    var regionSelect = filterRoot.querySelector("[data-filter-region]");
    var yearSelect = filterRoot.querySelector("[data-filter-year]");
    var typeSelect = filterRoot.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
    var count = filterRoot.querySelector("[data-result-count]");
    var noResults = filterRoot.querySelector("[data-no-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function applyFilters() {
      var q = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.category,
          card.dataset.tags,
          card.textContent
        ].join(" "));
        var ok = true;

        if (q && haystack.indexOf(q) === -1) ok = false;
        if (region && normalize(card.dataset.region).indexOf(region) === -1) ok = false;
        if (year && normalize(card.dataset.year) !== year) ok = false;
        if (type && normalize(card.dataset.type).indexOf(type) === -1) ok = false;

        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) visible += 1;
      });

      if (count) count.textContent = visible.toString();
      if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
    }

    [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (el) {
      if (el) el.addEventListener("input", applyFilters);
      if (el) el.addEventListener("change", applyFilters);
    });

    applyFilters();
  }
});
