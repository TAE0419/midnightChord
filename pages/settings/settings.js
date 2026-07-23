const SETTINGS_KEY = "studio-midnight-settings";

function settingsUserKey() {
  try {
    const user = JSON.parse(localStorage.getItem("studio-midnight-user"));
    return user?.email ? user.email.toLowerCase() : "guest";
  } catch {
    return "guest";
  }
}

function loadPlaybackSettings() {
  try {
    const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    return {
      autoplay: allSettings[settingsUserKey()]?.autoplay !== false,
      highQuality: allSettings[settingsUserKey()]?.highQuality === true,
      albumNotifications: allSettings[settingsUserKey()]?.albumNotifications !== false,
      playlistRecommendations: allSettings[settingsUserKey()]?.playlistRecommendations !== false
    };
  } catch {
    return { autoplay: true, highQuality: false, albumNotifications: true, playlistRecommendations: true };
  }
}

function saveSetting(name, enabled) {
  let allSettings = {};
  try { allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { allSettings = {}; }
  const userKey = settingsUserKey();
  allSettings[userKey] = { ...(allSettings[userKey] || {}), [name]: enabled };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings));
  window.dispatchEvent(new CustomEvent("studio-midnight:settings-changed", {
    detail: { userKey, name, value: enabled, settings: allSettings[userKey] }
  }));
}

function saveHighQuality(enabled) {
  saveSetting("highQuality", enabled);
}

function syncSettingsHeaderAvatar() {
  const avatar = document.querySelector("header .flex.items-center.gap-3 > div:last-child");
  if (!avatar) return;
  let user = null;
  try { user = JSON.parse(localStorage.getItem("studio-midnight-user")); } catch { user = null; }
  avatar.textContent = "";
  if (user?.profileImage) {
    const image = document.createElement("img");
    image.src = user.profileImage;
    image.alt = `${user.name || "사용자"} 프로필`;
    image.style.cssText = "width:100%;height:100%;border-radius:9999px;object-fit:cover";
    avatar.appendChild(image);
  } else {
    avatar.textContent = user?.name?.slice(0, 1).toUpperCase() || "MC";
  }
}

function renderSettings() {
  const settings = loadPlaybackSettings();
  return `
    <div><p class="settings-eyebrow">ACCOUNT</p><h1 class="text-2xl font-medium mt-1">설정</h1><p class="settings-description">나에게 맞는 음악 감상 환경을 설정하세요.</p></div>
    <div class="grid md:grid-cols-2 gap-4">
      <section class="surface rounded-2xl p-4 settings-card">
        <div class="settings-card-title"><i data-lucide="PlayCircle"></i><div><h2>재생 설정</h2><p>음악이 재생되는 방식을 선택합니다.</p></div></div>
        <label class="settings-row"><span><strong>자동 재생</strong><small>현재 곡이 끝나면 다음 곡을 이어서 재생합니다.</small></span><input type="checkbox" data-autoplay-setting ${settings.autoplay ? "checked" : ""}><i class="settings-switch" aria-hidden="true"></i></label>
        <label class="settings-row"><span><strong>고음질 스트리밍</strong><small>48kHz 스테레오 테스트 음원을 우선 재생합니다.</small></span><input type="checkbox" data-high-quality-setting ${settings.highQuality ? "checked" : ""}><i class="settings-switch" aria-hidden="true"></i></label>
      </section>
      <section class="surface rounded-2xl p-4 settings-card">
        <div class="settings-card-title"><i data-lucide="Bell"></i><div><h2>알림</h2><p>받고 싶은 음악 소식을 선택합니다.</p></div></div>
        <label class="settings-row"><span><strong>신규 앨범 알림</strong><small>팔로우한 아티스트의 새 앨범 소식을 받습니다.</small></span><input type="checkbox" data-album-notification-setting ${settings.albumNotifications ? "checked" : ""}><i class="settings-switch" aria-hidden="true"></i></label>
        <label class="settings-row"><span><strong>플레이리스트 추천</strong><small>좋아요와 팔로우 데이터를 분석한 추천 믹스를 표시합니다.</small></span><input type="checkbox" data-playlist-recommendation-setting ${settings.playlistRecommendations ? "checked" : ""}><i class="settings-switch" aria-hidden="true"></i></label>
      </section>
    </div>
    <p class="settings-save-message" data-settings-message aria-live="polite"></p>`;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.settings = () => {
  setTimeout(syncSettingsHeaderAvatar, 0);
  return renderSettings();
};

document.addEventListener("change", event => {
  const autoplayChanged = event.target.matches("[data-autoplay-setting]");
  const qualityChanged = event.target.matches("[data-high-quality-setting]");
  const albumNotificationChanged = event.target.matches("[data-album-notification-setting]");
  const recommendationChanged = event.target.matches("[data-playlist-recommendation-setting]");
  if (!autoplayChanged && !qualityChanged && !albumNotificationChanged && !recommendationChanged) return;
  if (autoplayChanged) saveSetting("autoplay", event.target.checked);
  if (qualityChanged) {
    saveHighQuality(event.target.checked);
    if (typeof applyAudioQualitySetting === "function") applyAudioQualitySetting();
  }
  if (albumNotificationChanged) saveSetting("albumNotifications", event.target.checked);
  if (recommendationChanged) saveSetting("playlistRecommendations", event.target.checked);
  const message = document.querySelector("[data-settings-message]");
  if (message) {
    message.textContent = autoplayChanged
      ? (event.target.checked ? "자동 재생을 켰습니다. 다음 곡이 이어서 재생됩니다." : "자동 재생을 껐습니다. 현재 곡이 끝나면 재생이 멈춥니다.")
      : qualityChanged
        ? (event.target.checked ? "고음질 스트리밍을 켰습니다." : "일반 음질 스트리밍으로 변경했습니다.")
        : albumNotificationChanged
          ? (event.target.checked ? "신규 앨범 알림을 켰습니다." : "신규 앨범 알림을 껐습니다.")
          : (event.target.checked ? "플레이리스트 추천을 켰습니다." : "플레이리스트 추천을 껐습니다.");
    clearTimeout(window.settingsMessageTimer);
    window.settingsMessageTimer = setTimeout(() => { message.textContent = ""; }, 3000);
  }
});
