(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function prepare(video) {
    var source = video.getAttribute("data-stream");
    if (!source || video.getAttribute("data-ready") === "true") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.setAttribute("data-ready", "true");
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hls = hls;
      video.setAttribute("data-ready", "true");
      return;
    }
    video.src = source;
    video.setAttribute("data-ready", "true");
  }

  function play(video, button) {
    prepare(video);
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
    if (button) {
      button.classList.add("is-hidden");
    }
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var button = document.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    if (button) {
      button.addEventListener("click", function () {
        play(video, button);
      });
    }
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        play(video, button);
      }
    });
  });
})();
