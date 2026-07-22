const { artists } = window.trackitData;

function assetBox(item, className, fallback = "") {
  if (item.imageSrc) {
    return `<img src="${item.imageSrc}" alt="${item.title || item.name}" class="${className} object-cover" onerror="this.replaceWith(Object.assign(document.createElement('div'), { className: '${className} ${item.art || 'purple-soft'} flex items-center justify-center text-4xl', textContent: '${fallback}' }))">`;
  }
  return `<div class="${className} ${item.art || 'purple-soft'} flex items-center justify-center text-4xl">${fallback}</div>`;
}

function renderMypage(user, error = "") {
  if (!user) {
    return `
      <div class="surface rounded-3xl p-5 md:p-7 max-w-xl mx-auto">
        <p class="text-sm" style="color:var(--muted)">LOCAL ACCOUNT</p>
        <h1 class="text-2xl font-medium mt-1">Studio Midnight 시작하기</h1>
        <p class="text-sm mt-3" style="color:var(--muted)">브라우저에만 저장되는 로컬 회원가입 데모입니다.</p>
        <form class="space-y-4 mt-6" data-signup-form novalidate>
          <label class="block text-sm">이름<input required minlength="2" name="name" autocomplete="name" class="w-full mt-2 rounded-xl border bg-transparent px-3 py-2" style="border-color:var(--border)" placeholder="이름을 입력하세요"></label>
          <label class="block text-sm">이메일<input required type="email" name="email" autocomplete="email" class="w-full mt-2 rounded-xl border bg-transparent px-3 py-2" style="border-color:var(--border)" placeholder="name@example.com"></label>
          <label class="block text-sm">비밀번호<input required type="password" name="password" minlength="6" autocomplete="new-password" class="w-full mt-2 rounded-xl border bg-transparent px-3 py-2" style="border-color:var(--border)" placeholder="6자 이상 입력"></label>
          <p class="form-error ${error ? "" : "hidden"}" data-form-error>${error}</p>
          <button type="submit" class="purple-btn rounded-xl px-4 py-2 w-full">로컬 회원가입</button>
        </form>
      </div>
    `;
  }
  return `
    <div class="surface rounded-3xl p-5 md:p-7 flex flex-col md:flex-row gap-5 md:items-center">
      <div class="w-24 h-24 rounded-full purple-soft flex items-center justify-center text-2xl">${user.name.slice(0, 1).toUpperCase()}</div>
      <div class="flex-1"><p class="text-sm" style="color:var(--muted)">LISTENER</p><h1 class="text-2xl font-medium mt-1">${user.name}</h1><p class="text-sm mt-2" style="color:var(--muted)">${user.email}</p></div>
      <button type="button" class="surface rounded-xl px-4 py-2" data-logout>로그아웃</button>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="metric-card"><p class="text-sm">팔로잉</p><p class="viz-stat-value">42</p></div>
      <div class="metric-card"><p class="text-sm">플레이리스트</p><p class="viz-stat-value">8</p></div>
      <div class="metric-card"><p class="text-sm">좋아요</p><p class="viz-stat-value">126</p></div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">이번 달 감상 기록</h2><div class="space-y-4 mt-5">${["Electronic:72", "R&B:54", "Indie:38"].map(item => { const [name, value] = item.split(":"); return `<div><div class="flex justify-between text-sm"><span>${name}</span><span>${value}%</span></div><div class="progress h-2 rounded-full mt-2"><span style="width:${value}%"></span></div></div>`; }).join("")}</div></section>
      <section class="surface rounded-2xl p-4"><h2 class="font-medium">가장 많이 들은 아티스트</h2><div class="space-y-3 mt-4">${artists.slice(0, 3).map(artist => `<div class="flex items-center gap-3">${assetBox(artist, "w-11 h-11 rounded-full", artist.initial)}<div><p>${artist.name}</p><p class="text-sm" style="color:var(--muted)">${artist.plays}</p></div></div>`).join("")}</div></section>
    </div>
  `;
}

window.trackitPages = window.trackitPages || {};
window.trackitPages.mypage = renderMypage;
