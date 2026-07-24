(() => {
  const deletedTrackKeys = new Set();
  const tracksPerPage = 4;
  let pendingRow = null;
  let isCurrentPlaylistDeletePending = false;
  let allowCurrentPlaylistDelete = false;
  let currentTrackPage = 1;

  function trackKey(row) {
    const artist = row.querySelector(".font-medium")?.textContent.trim() || "";
    const title = row.querySelector(".playlist-current-title")?.textContent.trim() || "";
    return `${artist}::${title}`;
  }

  function openTrackDeleteModal(row) {
    const modal = document.querySelector("[data-playlist-delete-modal]");
    if (!modal) return;
    pendingRow = row;
    modal.hidden = false;
  }

  function closeTrackDeleteModal() {
    const modal = document.querySelector("[data-playlist-delete-modal]");
    if (modal) modal.hidden = true;
    pendingRow = null;
    isCurrentPlaylistDeletePending = false;
  }

  function renderTrackDeleteButtons() {
    const currentList = document.querySelector("[data-current-playlist-list]");
    if (!currentList) return;

    currentList.querySelectorAll(".playlist-current-row").forEach(row => {
      if (deletedTrackKeys.has(trackKey(row))) {
        row.remove();
        return;
      }
      if (row.querySelector(".playlist-current-track-delete")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "playlist-current-track-delete";
      button.dataset.playlistCurrentTrackDelete = "";
      button.textContent = "삭제";
      button.setAttribute("aria-label", `${row.querySelector(".playlist-current-title")?.textContent.trim() || "곡"} 삭제`);
      row.append(button);
    });

    renderTrackPagination(currentList);
  }

  function renderTrackPagination(currentList) {
    const panel = currentList.closest(".playlist-current-panel");
    if (!panel) return;
    const rows = [...currentList.querySelectorAll(".playlist-current-row")];
    const totalPages = Math.ceil(rows.length / tracksPerPage);
    const existingPagination = panel.querySelector(".playlist-current-pagination");

    if (totalPages <= 1) {
      rows.forEach(row => { row.hidden = false; });
      existingPagination?.remove();
      return;
    }

    currentTrackPage = Math.min(Math.max(currentTrackPage, 1), totalPages);
    rows.forEach((row, index) => {
      row.hidden = Math.floor(index / tracksPerPage) + 1 !== currentTrackPage;
    });

    const pagination = existingPagination || document.createElement("nav");
    pagination.className = "playlist-current-pagination";
    pagination.setAttribute("aria-label", "현재 재생목록 페이지");
    pagination.innerHTML = "";

    const addPageButton = (label, page, isActive = false) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.playlistCurrentPage = String(page);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-label", `${label} 페이지`);
      pagination.append(button);
    };

    addPageButton("≪", 1);
    for (let page = 1; page <= totalPages; page += 1) addPageButton(String(page), page, page === currentTrackPage);
    addPageButton("≫", totalPages);

    if (!existingPagination) panel.append(pagination);
  }

  function bindTrackDeleteConfirmation() {
    const currentList = document.querySelector("[data-current-playlist-list]");
    renderTrackDeleteButtons();
    if (currentList) {
      new MutationObserver(renderTrackDeleteButtons).observe(currentList, { childList: true });
    }

    document.addEventListener("click", event => {
      const currentPlaylistDelete = event.target.closest("[data-current-playlist-delete]");
      if (currentPlaylistDelete) {
        if (allowCurrentPlaylistDelete) {
          allowCurrentPlaylistDelete = false;
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        isCurrentPlaylistDeletePending = true;
        openTrackDeleteModal(null);
        return;
      }

      const trackDeleteButton = event.target.closest("[data-playlist-current-track-delete]");
      if (trackDeleteButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openTrackDeleteModal(trackDeleteButton.closest(".playlist-current-row"));
        return;
      }

      if (!pendingRow && !isCurrentPlaylistDeletePending) return;

      const confirmButton = event.target.closest("[data-playlist-delete-confirm]");
      if (confirmButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (pendingRow) {
          deletedTrackKeys.add(trackKey(pendingRow));
          pendingRow.remove();
        } else if (isCurrentPlaylistDeletePending) {
          const deleteButton = document.querySelector("[data-current-playlist-delete]");
          if (deleteButton) {
            allowCurrentPlaylistDelete = true;
            deleteButton.click();
          }
        }
        closeTrackDeleteModal();
        return;
      }

      if (event.target.closest("[data-playlist-delete-cancel]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeTrackDeleteModal();
      }
    }, true);

    document.addEventListener("click", event => {
      const pageButton = event.target.closest("[data-playlist-current-page]");
      if (!pageButton) return;
      currentTrackPage = Number(pageButton.dataset.playlistCurrentPage);
      renderTrackDeleteButtons();
    });
  }

  document.addEventListener("trackit:ready", bindTrackDeleteConfirmation, { once: true });
})();
