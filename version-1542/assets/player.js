document.addEventListener("DOMContentLoaded", function () {
  var video = document.querySelector("video[data-m3u8]");
  if (!video) return;

  var source = video.getAttribute("data-m3u8");
  var status = document.querySelector("[data-player-status]");
  var playButton = document.querySelector("[data-player-play]");
  var hlsInstance = null;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function attachSource() {
    if (!source) {
      setStatus("播放源未配置");
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus("播放源已就绪，可点击播放。");
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
        if (!data || !data.fatal) return;
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus("网络错误，正在重试加载播放源。");
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus("媒体错误，正在尝试恢复播放。");
          hlsInstance.recoverMediaError();
        } else {
          setStatus("播放器错误，请刷新页面重试。");
          hlsInstance.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setStatus("浏览器原生 HLS 播放已就绪。");
    } else {
      setStatus("当前浏览器不支持 HLS 播放，请使用 Chrome、Edge、Safari 或移动端浏览器访问。");
    }
  }

  attachSource();

  if (playButton) {
    playButton.addEventListener("click", function () {
      video.play().then(function () {
        playButton.parentElement.style.display = "none";
      }).catch(function () {
        setStatus("浏览器阻止了自动播放，请使用视频控件手动播放。");
      });
    });
  }

  video.addEventListener("play", function () {
    if (playButton && playButton.parentElement) {
      playButton.parentElement.style.display = "none";
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) hlsInstance.destroy();
  });
});
