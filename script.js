// script.js
import { db, dbRef, get, update, runTransaction } from "./firebase.js";

/*
  Edit these six objects with your image URLs and display names.
  Example: { id: "1", src: "https://i.imgur.com/abc.jpg", name: "Option A" }
*/
const images = [
  { id: "1", src: "YOUR_IMAGE_URL_1", name: "Option 1" },
  { id: "2", src: "YOUR_IMAGE_URL_2", name: "Option 2" },
  { id: "3", src: "YOUR_IMAGE_URL_3", name: "Option 3" },
  { id: "4", src: "YOUR_IMAGE_URL_4", name: "Option 4" },
  { id: "5", src: "YOUR_IMAGE_URL_5", name: "Option 5" },
  { id: "6", src: "YOUR_IMAGE_URL_6", name: "Option 6" },
];

// simple helper to get element by id
const $ = (id) => document.getElementById(id);

// --- Voting page: render images and handle clicks ---
const imageGrid = $("image-grid");
if (imageGrid) {
  images.forEach((img) => {
    const wrapper = document.createElement("div");
    wrapper.className = "relative";

    const el = document.createElement("img");
    el.src = img.src;
    el.alt = img.name;
    el.className = "vote-img cursor-pointer shadow-md transition-transform hover:scale-105";
    el.onclick = async () => {
      // Prevent multiple quick clicks
      if (localStorage.getItem("votedFor")) {
        // user already voted on this browser
        alert("You have already voted from this browser. You can still view results.");
        window.location.href = "results.html";
        return;
      }

      try {
        const voteRef = dbRef(db, "votes/" + img.id + "/count");

        // Use a transaction to safely increment the count
        await runTransaction(voteRef, (current) => {
          return (current || 0) + 1;
        });

        localStorage.setItem("votedFor", img.id);
        // store timestamp too
        localStorage.setItem("votedAt", Date.now());
        window.location.href = "results.html";
      } catch (err) {
        console.error("Vote error:", err);
        alert("There was an error sending your vote. Try again later.");
      }
    };

    const label = document.createElement("div");
    label.className = "text-sm text-center mt-2";
    label.textContent = img.name;

    wrapper.appendChild(el);
    wrapper.appendChild(label);
    imageGrid.appendChild(wrapper);
  });
}

// --- Results page: fetch and display percentages ---
const resultsDiv = $("results");
if (resultsDiv) {
  const fetchResults = async () => {
    try {
      const snapshot = await get(dbRef(db, "votes"));
      const data = snapshot.val() || {};

      // Ensure every image has a numeric count (0 if missing)
      const counts = images.map((img) => {
        return { id: img.id, name: img.name, src: img.src, count: (data[img.id]?.count || 0) };
      });

      const total = counts.reduce((s, c) => s + c.count, 0);

      // Clear existing
      resultsDiv.innerHTML = "";

      counts.forEach((c) => {
        const percent = total ? ((c.count / total) * 100).toFixed(1) : "0.0";
        const card = document.createElement("div");
        card.className = "p-2";

        card.innerHTML = `
          <img src="${c.src}" class="result-img shadow mb-2" />
          <div class="font-semibold text-sm">${c.name}</div>
          <div class="text-xs text-gray-600">${c.count} votes • ${percent}%</div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden"><div style="width:${percent}%;" class="h-full bg-gradient-to-r from-green-400 to-blue-500"></div></div>
        `;
        resultsDiv.appendChild(card);
      });

      // Update short link text
      const shortLink = document.getElementById("shortLink");
      if (shortLink) {
        shortLink.href = window.location.origin + window.location.pathname.replace("results.html", "results.html");
        shortLink.textContent = window.location.origin;
      }
    } catch (err) {
      console.error("Get results error:", err);
      resultsDiv.innerHTML = "<div class='text-red-500'>Error loading results.</div>";
    }
  };

  // initial fetch
  fetchResults();

  // refresh every 6 seconds for near-real-time updates
  setInterval(fetchResults, 6000);

  // share button
  const shareBtn = $("shareBtn");
  if (shareBtn) {
    shareBtn.onclick = async () => {
      const shareData = {
        title: "Live Voting Results",
        text: "See live voting results — vote now!",
        url: window.location.origin
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // fallback: copy to clipboard
          await navigator.clipboard.writeText(shareData.url);
          alert("Link copied to clipboard. Paste it into Instagram / WhatsApp.");
        }
      } catch (err) {
        console.error("Share error:", err);
        alert("Could not share. Copy the link shown instead.");
      }
    };
  }
}
