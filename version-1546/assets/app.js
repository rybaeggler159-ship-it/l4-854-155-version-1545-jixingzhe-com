const HLS_SOURCES = [
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8",
  "https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8"
];

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function initMobileNav() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mobileNav');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.hidden = expanded;
    button.textContent = expanded ? '☰' : '×';
  });
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function initLocalFilters() {
  const scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach((scope) => {
    const container = scope.closest('section') || document;
    const input = scope.querySelector('.local-search');
    const year = scope.querySelector('.local-year');
    const region = scope.querySelector('.local-region');
    const category = scope.querySelector('.local-category');
    const count = container.querySelector('[data-result-count]');
    const cards = Array.from(container.querySelectorAll('.movie-card, .movie-row'));

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get('q');

    if (queryFromUrl && input) {
      input.value = queryFromUrl;
    }

    function applyFilters() {
      const q = normalizeText(input ? input.value : '');
      const selectedYear = year ? year.value : '';
      const selectedRegion = region ? region.value : '';
      const selectedCategory = category ? category.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const search = normalizeText(card.dataset.search);
        const cardYear = card.dataset.year || '';
        const cardRegion = card.dataset.region || '';
        const cardCategory = card.dataset.category || '';
        const passQuery = !q || search.includes(q);
        const passYear = !selectedYear || cardYear === selectedYear;
        const passRegion = !selectedRegion || cardRegion === selectedRegion;
        const passCategory = !selectedCategory || cardCategory === selectedCategory;
        const show = passQuery && passYear && passRegion && passCategory;

        card.classList.toggle('is-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `显示 ${visible} 部影片`;
      }
    }

    [input, year, region, category].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });
}

function loadHlsScript() {
  return new Promise((resolve, reject) => {
    if (window.Hls) {
      resolve(window.Hls);
      return;
    }

    const existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Hls));
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.dataset.hlsLoader = 'true';
    script.onload = () => resolve(window.Hls);
    script.onerror = () => reject(new Error('HLS 播放器加载失败'));
    document.head.appendChild(script);
  });
}

function showPlayerError(shell, message) {
  const error = shell.querySelector('.player-error');
  if (error) {
    error.textContent = message;
    error.hidden = false;
  }
}

function initOnePlayer(shell) {
  const video = shell.querySelector('video');
  const overlay = shell.querySelector('.player-overlay');

  if (!video || !overlay) {
    return;
  }

  let initialized = false;

  async function startPlayback() {
    if (initialized) {
      video.play().catch(() => undefined);
      return;
    }

    initialized = true;
    overlay.hidden = true;

    const fallbackIndex = Number(video.dataset.m3u8Index || 0) % HLS_SOURCES.length;
    const source = video.dataset.m3u8 || HLS_SOURCES[fallbackIndex];

    if (!source) {
      showPlayerError(shell, '未找到可用的播放源。');
      return;
    }

    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        const Hls = await loadHlsScript();

        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data && data.fatal) {
              showPlayerError(shell, '播放源加载失败，请刷新或更换浏览器后重试。');
            }
          });
        } else {
          showPlayerError(shell, '当前浏览器不支持 HLS 播放。');
          return;
        }
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          showPlayerError(shell, '浏览器阻止了自动播放，请再次点击播放器开始播放。');
          overlay.hidden = false;
        });
      }
    } catch (error) {
      showPlayerError(shell, error.message || '播放器初始化失败。');
      overlay.hidden = false;
    }
  }

  overlay.addEventListener('click', startPlayback);
}

function initPlayers() {
  document.querySelectorAll('[data-player]').forEach(initOnePlayer);
}

ready(() => {
  initMobileNav();
  initLocalFilters();
  initPlayers();
});
