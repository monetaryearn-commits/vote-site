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
}

loadResults();

// --- SHARE BUTTON ---
document.getElementById("shareBtn").onclick = async () => {
  const shareText = `📊 Live voting results are out! See who’s leading and vote now!\n👉 ${window.location.origin}`;
  
  if (navigator.share) {
    await navigator.share({
      title: "Voting Results",
      text: shareText,
      url: window.location.origin,
    });
  } else {
    alert("Sharing not supported on this device. You can copy the link instead.");
  }
};

// --- COPY LINK BUTTON ---
document.getElementById("copyBtn").onclick = async () => {
  const link = window.location.origin;
  await navigator.clipboard.writeText(link);
  alert("Link copied! You can now share it on WhatsApp, Instagram, or anywhere.");
};
