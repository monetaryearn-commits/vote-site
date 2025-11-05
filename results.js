import { db, dbRef, get } from "./firebase.js";

// --- Candidate details ---
const images = [
  { id: "1", src: "https://i.imgur.com/KyJZtHX.jpg", name: "TVK" },
  { id: "2", src: "https://i.imgur.com/enzBSYA.jpg", name: "DMK" },
  { id: "3", src: "https://i.imgur.com/XLck5Jb.jpg", name: "ADMK" },
  { id: "4", src: "https://i.imgur.com/4yCMosN.jpg", name: "BJP" },
  { id: "5", src: "https://i.imgur.com/bELcRVl.jpg", name: "NTK" },
  { id: "6", src: "https://i.imgur.com/7cjHmIJ.jpg", name: "DMDK" },
];

// --- Initialize ---
document.addEventListener("DOMContentLoaded", async () => {
  const resultsGrid = document.getElementById("results-grid");
  const shareBtn = document.getElementById("shareBtn");
  const copyBtn = document.getElementById("copyBtn");
  const top3Container = document.getElementById("top3-container");

  // Load initial results
  const data = await fetchResults();
  renderTop3(top3Container, data);
  await loadResults(resultsGrid);

  // ================================
  // SHARE RESULTS BUTTON
  // ================================
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const data = await fetchResults();
      const total = Object.values(data).reduce((sum, obj) => sum + (obj.count || 0), 0);

      const popup = document.createElement("div");
      popup.className = "popup-overlay";
      popup.innerHTML = `
        <div class="popup">
          <h2>📊 Live Voting Results</h2>
          ${images
            .map((img) => {
              const count = data[img.id]?.count || 0;
              const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
              return `
                <div class="popup-row">
                  <span><b>${img.name}</b></span>
                  <div class="popup-bar">
                    <div class="popup-fill" style="width:${percent}%"></div>
                  </div>
                  <small>${count} votes (${percent}%)</small>
                </div>
              `;
            })
            .join("")}
          <div class="popup-buttons">
            <button id="popupShare">Share Results</button>
            <button id="popupClose">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(popup);

      document.getElementById("popupClose").onclick = () => popup.remove();

      document.getElementById("popupShare").onclick = async () => {
        const link = window.location.origin;
        const shareText = `📊 Check out live voting results — see who’s leading! Vote here 👉 ${link}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: "Voting Results", text: shareText, url: link });
          } else {
            await navigator.clipboard.writeText(link);
            showToast("✅ Link copied! Share it on WhatsApp, Instagram, or anywhere.");
          }
        } catch (err) {
          console.error("Share failed:", err);
          showToast("⚠️ Unable to share — please copy the link manually.");
        }
      };
    });
  }

  // ================================
  // COPY LINK BUTTON
  // ================================
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const link = window.location.origin;
      try {
        await navigator.clipboard.writeText(link);
        showToast("✅ Link copied!");
      } catch (err) {
        const tempInput = document.createElement("input");
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        tempInput.remove();
        showToast("✅ Link copied!");
      }
    });
  }
});

// ================================
// FUNCTIONS
// ================================

// Fetch vote results from Firebase
async function fetchResults() {
  const snapshot = await get(dbRef(db, "votes"));
  return snapshot.val() || {};
}

// Load and render full results on main page
async function loadResults(resultsGrid) {
  const data = await fetchResults();
  let total = 0;
  Object.values(data).forEach((obj) => (total += obj.count || 0));

  images.forEach((img) => {
    const count = data[img.id]?.count || 0;
    const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

    const wrapper = document.createElement("div");
    wrapper.className = "result-item";
    wrapper.innerHTML = `
      <img src="${img.src}" alt="${img.name}" class="result-img">
      <div class="result-info">
        <strong>${img.name}</strong>
        <div class="bar"><div class="fill" style="width:${percent}%"></div></div>
        <p>${count} votes (${percent}%)</p>
      </div>
    `;
    resultsGrid.appendChild(wrapper);
  });
}

// Render top 3 parties with vote count
function renderTop3(container, data) {
  if (!container) return;

  // Compute top 3 by count
  const top3 = images
    .map((img) => ({ ...img, count: data[img.id]?.count || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  container.innerHTML = top3
    .map(
      (p, idx) => `
    <div class="result-row">
      <div class="rank-num">${idx + 1}</div>
      <img src="${p.src}" class="small-img" alt="${p.name}" />
      <div class="result-text">${p.name} — ${p.count} votes</div>
    </div>
  `
    )
    .join("");
}

// ================================
// TOAST MESSAGE
// ================================
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}
