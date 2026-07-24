(() => {
  const deletedTrackKeys = new Set();
  let pendingRow = null;
  let isCurrentPlaylistDeletePending = false;
  let allowCurrentPlaylistDelete = false;

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
    document.querySelectorAll(".playlist-current-row").forEach(row => {
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
  }

  document.addEventListener("trackit:ready", bindTrackDeleteConfirmation, { once: true });
})();
