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

  // --- Load results from Firebase ---
  try {
    const snapshot = await get(dbRef(db, "votes"));
    const data = snapshot.val() || {};
    let total = 0;

    images.forEach((img) => {
      total += data[img.id]?.count || 0;
    });

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
  } catch (err) {
    console.error("Error loading results:", err);
  }

  // --- SHARE RESULTS BUTTON ---
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const link = window.location.origin;
      const text = `📊 Check out live voting results and vote for your favorite party! ${link}`;
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Voting Results",
            text,
            url: link,
          });
        } else {
          prompt("Copy this link to share:", link);
        }
      } catch (err) {
        console.error("Share failed:", err);
        prompt("Sharing failed. Copy this link manually:", link);
      }
    });
  }

  // --- OPEN LINK BUTTON ---
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const link = window.location.origin;

      // Try clipboard API first
      try {
        await navigator.clipboard.writeText(link);
        alert(`✅ Link copied! You can now paste it anywhere: ${link}`);
      } catch (err) {
        console.warn("Clipboard API failed, showing fallback input:", err);

        // Fallback: create temporary input box for manual copy
        const input = document.createElement("input");
        input.value = link;
        document.body.appendChild(input);
        input.select();
        input.setSelectionRange(0, 99999); // for mobile
        document.execCommand("copy");
        document.body.removeChild(input);

        alert(`✅ Link copied via fallback! You can also copy manually: ${link}`);
      }
    });
  }
});
