function renderSettings() {
  return `
    <div><p class="text-sm" style="color:var(--muted)">ACCOUNT</p><h1 class="text-2xl font-medium mt-1">설정</h1></div>
    <div class="grid md:grid-cols-2 gap-4">
      <section class="surface rounded-2xl p-4 space-y-4">
        <h2 class="font-medium">재생 설정</h2>
        <label class="flex items-center justify-between gap-4"><span>자동 재생</span><input type="checkbox" checked class="accent-violet-500"></label>
        <label class="flex items-center justify-between gap-4"><span>고음질 스트리밍</span><input type="checkbox" class="accent-violet-500"></label>
      </section>
      <section class="surface rounded-2xl p-4 space-y-4">
        <h2 class="font-medium">알림</h2>
        <label class="flex items-center justify-between gap-4"><span>신규 앨범 알림</span><input type="checkbox" checked class="accent-violet-500"></label>
        <label class="flex items-center justify-between gap-4"><span>플레이리스트 추천</span><input type="checkbox" checked class="accent-violet-500"></label>
      </section>
    </div>
  `;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.settings = renderSettings;
