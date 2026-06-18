(function () {
  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function cardMatches(card, query, chip) {
    var haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-category')
    ].map(text).join(' ');
    var queryOk = !query || haystack.indexOf(query) !== -1;
    var chipOk = !chip || chip === '全部' || haystack.indexOf(text(chip)) !== -1;
    return queryOk && chipOk;
  }

  function applyFilter(scope) {
    var input = scope.querySelector('[data-search-input]');
    var activeChip = scope.querySelector('.filter-chip.active');
    var query = input ? text(input.value) : '';
    var chip = activeChip ? activeChip.getAttribute('data-filter-value') : '';
    scope.querySelectorAll('[data-movie-card]').forEach(function (card) {
      if (cardMatches(card, query, chip)) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      scope.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          applyFilter(scope);
        });
      });
      scope.querySelectorAll('[data-search-input]').forEach(function (input) {
        input.addEventListener('input', function () {
          applyFilter(scope);
        });
      });
      scope.querySelectorAll('[data-filter-value]').forEach(function (button) {
        button.addEventListener('click', function () {
          var group = button.closest('[data-chip-group]');
          if (group) {
            group.querySelectorAll('.filter-chip').forEach(function (item) {
              item.classList.remove('active');
            });
          }
          button.classList.add('active');
          applyFilter(scope);
        });
      });
    });
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var stream = player.getAttribute('data-stream');
      var hls = null;
      var ready = false;

      function attach() {
        if (ready || !video || !stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          ready = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          ready = true;
          return;
        }
        video.src = stream;
        ready = true;
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initFilters();
    initPlayers();
  });
})();
