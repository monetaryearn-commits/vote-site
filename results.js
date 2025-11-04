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

const resultsGrid = document.getElementById("results-grid");

async function loadResults() {
  try {
    const snapshot = await get(dbRef(db, "votes"));
    const data = snapshot.val() || {};

    // Calculate totals
    let total = 0;
    images.forEach((img) => {
      total += data[img.id]?.count || 0;
    });

    // Display each result
    images.forEach((img) => {
      const count = data[img.id]?.count || 0;
      const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

      const wrapper = document.createElement("div");
      wrapper.className = "result-item";

      wrapper.innerHTML = `
        <img src="${img.src}" alt="${img.name}" class="result-img">
        <div class="result-info">
          <strong>${img.name}</strong>
          <div class="bar">
            <div class="fill" style="width:${percent}%"></div>
          </div>
          <p>${count} votes (${percent}%)</p>
        </div>
      `;
      resultsGrid.appendChild(wrapper);
    });
  } catch (error) {
    console.error("Error loading results:", error);
  }
}

loadResults();

// --- SHARE RESULTS BUTTON ---
const shareBtn = document.getElementById("shareBtn");
if (shareBtn) {
  shareBtn.onclick = async () => {
    const link = window.location.origin;
    const shareText = `📊 Check out live voting results and vote for your favorite party! 👉 ${link}`;

    try {
      if (navigator.share) {
        // Works on mobile browsers and HTTPS desktop browsers
        await navigator.share({
          title: "Live Voting Results",
          text: shareText,
          url: link,
        });
      } else {
        // Fallback: prompt user to copy link manually
        alert("Sharing is not supported on this browser. The link will be copied instead.");
        await navigator.clipboard.writeText(link);
        alert("Link copied! Share it on WhatsApp, Instagram, or anywhere.");
      }
    } catch (err) {
      console.error("Share failed:", err);
      alert("Sharing failed. You can copy and share the link manually.");
    }
  };
}

// --- COPY / OPEN LINK BUTTON ---
const copyBtn = document.getElementById("copyBtn");
if (copyBtn) {
  copyBtn.onclick = async () => {
    const link = window.location.origin;
    try {
      await navigator.clipboard.writeText(link);
      alert("✅ Link copied! You can now paste it into WhatsApp, Instagram, or any social media.");
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Copy failed. Please copy manually: " + link);
    }
  };
}
