(function () {
  const homeUrl = new URL("pages/home/", document.baseURI).href;
  const previewMode = new URLSearchParams(window.location.search).has("preview");
  const hasSeenOpening = sessionStorage.getItem("studio-midnight-opening-seen") === "true";
  const enterButton = document.querySelector("[data-opening-enter]");
  const countdown = document.querySelector("[data-opening-countdown]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const durationSeconds = reduceMotion ? 0 : 6;
  let isLeaving = false;

  function enterHome() {
    if (isLeaving) {
      return;
    }

    isLeaving = true;
    sessionStorage.setItem("studio-midnight-opening-seen", "true");
    window.location.replace(homeUrl);
  }

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
