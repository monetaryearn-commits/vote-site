// results.js
import { db, dbRef, get } from "./firebase.js";

const images = [
  { id: "1", src: "https://i.imgur.com/KyJZtHX.jpg", name: "TVK" },
  { id: "2", src: "https://i.imgur.com/enzBSYA.jpg", name: "DMK" },
  { id: "3", src: "https://i.imgur.com/XLck5Jb.jpg", name: "ADMK" },
  { id: "4", src: "https://i.imgur.com/4yCMosN.jpg", name: "BJP" },
  { id: "5", src: "https://i.imgur.com/bELcRVl.jpg", name: "NTK" },
  { id: "6", src: "https://i.imgur.com/7cjHmIJ.jpg", name: "DMDK" },
];

document.addEventListener("DOMContentLoaded", async () => {
  const resultsGrid = document.getElementById("results-grid");
  const shareBtn = document.getElementById("shareBtn");
  const copyBtn = document.getElementById("copyBtn");

  // Load and render results immediately
  await loadResults(resultsGrid);

  // --- SHARE RESULTS BUTTON ---
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const data = await fetchResults();
      const total = Object.values(data).reduce((sum, obj) => sum + (obj.count || 0), 0);

      // Create popup
      const popup = document.createElement("div");
      popup.className = "popup-overlay";
      popup.innerHTML = `
        <div class="popup">
          <h2>📊 Live Voting Results</h2>
          ${images.map((img) => {
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
          }).join("")}
          <button id="popupClose">Close</button>
          <button id="popupShare">Share Results</button>
        </div>
      `;
      document.body.appendChild(popup);

      // Close popup
      document.getElementById("popupClose").onclick = () => popup.remove();

      // Share link
      document.getElementById("popupShare").onclick = async () => {
        const link = window.location.origin;
        const shareText = `📊 Live voting results — see who’s leading! Vote here 👉 ${link}`;
        try {
          if (navigator.share) {
            await navigator.share({ title: "Voting Results", text: shareText, url: link });
          } else {
            await navigator.clipboard.writeText(link);
            alert("✅ Link copied! Share it on WhatsApp, Instagram, or anywhere.");
          }
        } catch (err) {
          console.error("Share failed:", err);
        }
      };
    });
  }

  // --- OPEN LINK BUTTON ---
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const link = window.location.origin;
      try {
        await navigator.clipboard.writeText(link);
        alert(`✅ Link copied! Share it anywhere:\n${link}`);
      } catch {
        prompt("Copy this link manually:", link);
      }
    });
  }
});

// 🔹 Load results into main page
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

// 🔹 Helper to get Firebase data
async function fetchResults() {
  const snapshot = await get(dbRef(db, "votes"));
  return snapshot.val() || {};
}
