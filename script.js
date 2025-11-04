// script.js
import { db, dbRef, runTransaction } from "./firebase.js";

import { db } from "./firebase.js";
console.log("Firebase connected:", db);

// 👇 Your voting options and images
const images = [
  { id: "1", src: "https://i.imgur.com/KyJZtHX.jpg", name: "TVK" },
  { id: "2", src: "https://i.imgur.com/enzBSYA.jpg", name: "DMK" },
  { id: "3", src: "https://i.imgur.com/XLck5Jb.jpg", name: "ADMK" },
  { id: "4", src: "https://i.imgur.com/4yCMosN.jpg", name: "BJP" },
  { id: "5", src: "https://i.imgur.com/bELcRVl.jpg", name: "NTK" },
  { id: "6", src: "https://i.imgur.com/7cjHmIJ.jpg", name: "DMDK" },
];

const imageGrid = document.getElementById("image-grid");
const voted = localStorage.getItem("votedFor");

// Display each image with label
images.forEach((img) => {
  const wrapper = document.createElement("div");
  wrapper.className = "relative";

  const el = document.createElement("img");
  el.src = img.src;
  el.alt = img.name;
  el.className =
    "w-full rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105";

  const label = document.createElement("div");
  label.className = "text-sm text-center mt-2 font-semibold";
  label.textContent = img.name;

  // ✅ Voting click action
  el.onclick = async () => {
    if (voted) {
      alert("You already voted for: " + voted);
      window.location.href = "results.html";
      return;
    }

    const voteRef = dbRef(db, "votes/" + img.id + "/count");
    await runTransaction(voteRef, (current) => (current || 0) + 1);

    localStorage.setItem("votedFor", img.name);
    window.location.href = "results.html";
  };

  wrapper.appendChild(el);
  wrapper.appendChild(label);
  imageGrid.appendChild(wrapper);
});

// --- Results page (results.html) ---
const resultsDiv = $("results");
if (resultsDiv) {
  const fetchResults = async () => {
    try {
      const snapshot = await get(dbRef(db, "votes"));
      const data = snapshot.val() || {};

      const counts = images.map((img) => ({
        id: img.id,
        name: img.name,
        src: img.src,
        count: data[img.id]?.count || 0,
      }));

      const total = counts.reduce((s, c) => s + c.count, 0);
      resultsDiv.innerHTML = "";

      counts.forEach((c) => {
        const percent = total ? ((c.count / total) * 100).toFixed(1) : "0.0";
        const card = document.createElement("div");
        card.className = "p-2";

        // Highlight the image user voted for
        const votedId = localStorage.getItem("votedFor");
        const border = votedId === c.id ? "border-4 border-green-500" : "border";

        card.innerHTML = `
          <img src="${c.src}" class="result-img shadow mb-2 ${border}" />
          <div class="font-semibold text-sm">${c.name}</div>
          <div class="text-xs text-gray-600">${c.count} votes • ${percent}%</div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
            <div style="width:${percent}%;" class="h-full bg-gradient-to-r from-green-400 to-blue-500"></div>
          </div>
        `;
        resultsDiv.appendChild(card);
      });

      // update share link
      const shortLink = document.getElementById("shortLink");
      if (shortLink) {
        shortLink.href = window.location.origin;
        shortLink.textContent = window.location.origin;
      }
    } catch (err) {
      console.error("Get results error:", err);
      resultsDiv.innerHTML =
        "<div class='text-red-500'>Error loading results. Please refresh.</div>";
    }
  };

  // load data initially and refresh every 6 seconds
  fetchResults();
  setInterval(fetchResults, 6000);

  // share button
  const shareBtn = $("shareBtn");
  if (shareBtn) {
    shareBtn.onclick = async () => {
      const shareData = {
        title: "Live Voting Results",
        text: "Check out the live voting results and cast your vote!",
        url: window.location.origin,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareData.url);
          alert("Link copied to clipboard! You can paste it on Instagram or WhatsApp.");
        }
      } catch (err) {
        console.error("Share error:", err);
        alert("Could not share. Copy the link manually.");
      }
    };
  }
}
