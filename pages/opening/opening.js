(function () {
  const homeUrl = new URL("pages/home/", document.baseURI).href;
  const previewMode = new URLSearchParams(window.location.search).has("preview");
  const hasSeenOpening = sessionStorage.getItem("studio-midnight-opening-seen") === "true";
  const enterButton = document.querySelector("[data-opening-enter]");
  const countdown = document.querySelector("[data-opening-countdown]");
  const canvas = document.querySelector("[data-opening-canvas]");
  const stage = document.querySelector("[data-opening-stage]");
  const audio = document.querySelector("[data-opening-audio]");
  const soundButton = document.querySelector("[data-opening-sound]");
  const soundIcon = document.querySelector("[data-opening-sound-icon]");
  const progress = document.querySelector("[data-opening-progress]");
  const trackTime = document.querySelector("[data-opening-track-time]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const durationSeconds = reduceMotion ? 0 : 6;
  let isLeaving = false;

  function enterHome() {
    if (isLeaving) {
      return;
    }

    isLeaving = true;
    if (audio) {
      audio.pause();
    }
    sessionStorage.setItem("studio-midnight-opening-seen", "true");
    window.location.replace(homeUrl);
  }

  function updatePreviewUi() {
    const isPlaying = audio && !audio.paused;
    if (soundIcon) {
      soundIcon.textContent = isPlaying ? "Ⅱ" : "▶";
    }
    if (soundButton) {
      soundButton.setAttribute("aria-label", isPlaying ? "미리듣기 일시정지" : "미리듣기 재생");
      soundButton.setAttribute("title", isPlaying ? "미리듣기 일시정지" : "미리듣기 재생");
    }
  }

  function formatTime(value) {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function bindAudioPreview() {
    if (!audio || !soundButton) {
      return;
    }

    soundButton.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
        } catch (error) {
          console.warn("Opening audio preview could not start.", error);
        }
      } else {
        audio.pause();
      }
      updatePreviewUi();
    });

    audio.addEventListener("timeupdate", () => {
      const ratio = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      if (progress) {
        progress.style.width = `${Math.min(ratio, 100)}%`;
      }
      if (trackTime) {
        trackTime.textContent = formatTime(audio.currentTime);
      }
    });

    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      updatePreviewUi();
    });

    audio.addEventListener("error", () => {
      soundButton.disabled = true;
      soundButton.setAttribute("aria-label", "미리듣기를 사용할 수 없습니다");
    });
  }

  function drawSignalField() {
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let startedAt = performance.now();

    function resizeCanvas() {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function drawGrid() {
      context.lineWidth = 1;
      context.strokeStyle = "rgba(255, 255, 255, 0.035)";
      const spacing = Math.max(42, Math.round(width / 18));

      for (let x = 0; x <= width; x += spacing) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      for (let y = 0; y <= height; y += spacing) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
    }

    function drawWave(time, row, color, scale) {
      const baseline = height * (0.28 + row * 0.2);
      const amplitude = Math.min(50, height * 0.055) * scale;
      context.beginPath();
      context.lineWidth = row === 1 ? 1.4 : 1;
      context.strokeStyle = color;

      for (let x = 0; x <= width; x += 7) {
        const phase = x * 0.014 + time * (0.0012 + row * 0.00018);
        const wave = Math.sin(phase) * amplitude + Math.sin(phase * 2.7) * amplitude * 0.34;
        const y = baseline + wave;
        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.stroke();
    }

    function render(now) {
      const time = now - startedAt;
      context.clearRect(0, 0, width, height);
      drawGrid();
      drawWave(time, 0, "rgba(167, 139, 250, 0.34)", 0.72);
      drawWave(time, 1, "rgba(86, 233, 201, 0.52)", 1);
      drawWave(time, 2, "rgba(167, 139, 250, 0.26)", 0.58);

      const scanX = ((time * 0.09) % (width + 160)) - 80;
      context.strokeStyle = "rgba(86, 233, 201, 0.2)";
      context.beginPath();
      context.moveTo(scanX, height * 0.12);
      context.lineTo(scanX, height * 0.88);
      context.stroke();

      if (!reduceMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    resizeCanvas();
    render(performance.now());
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
      } else if (!reduceMotion) {
        startedAt = performance.now();
        animationFrame = window.requestAnimationFrame(render);
      }
    });
  }

  function animateEntrance() {
    if (reduceMotion || !window.gsap || !stage) {
      return;
    }

    window.gsap.timeline()
      .from(".opening-header", { opacity: 0, y: -12, duration: 0.55 })
      .from(".opening-eyebrow", { opacity: 0, y: 12, duration: 0.4 }, "-=0.18")
      .from(".opening-mark", { opacity: 0, scaleX: 0.35, duration: 0.45 }, "-=0.12")
      .from(".opening-logo-wrap", { opacity: 0, y: 18, duration: 0.7 }, "-=0.15")
      .from([".opening-copy", ".opening-track", ".opening-enter"], { opacity: 0, y: 12, stagger: 0.13, duration: 0.45 }, "-=0.22")
      .from(".opening-footer", { opacity: 0, duration: 0.4 }, "-=0.25");
  }

  drawSignalField();
  bindAudioPreview();
  animateEntrance();

  if (hasSeenOpening && !previewMode) {
    enterHome();
    return;
  }

  if (enterButton) {
    enterButton.addEventListener("click", enterHome);
  }

  if (!previewMode && durationSeconds > 0) {
    let secondsLeft = durationSeconds;
    const timer = window.setInterval(() => {
      secondsLeft -= 1;
      if (countdown) {
        countdown.textContent = String(Math.max(secondsLeft, 0)).padStart(2, "0");
      }
      if (secondsLeft <= 0) {
        window.clearInterval(timer);
        enterHome();
      }
    }, 1000);
  }
})();
