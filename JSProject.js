const baseUrl = "https://gamerpower.p.rapidapi.com/api/giveaways";
const headers = {
  "x-rapidapi-host": "gamerpower.p.rapidapi.com",
  "x-rapidapi-key": "e34da2c383msh07be468810add3cp1a0c11jsna21383a06a11",
};

const input = document.getElementById("searchInput");
const resultsDiv = document.getElementById("results");

let currentResults = [];

function showSkeletons(count = 5) {
  resultsDiv.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const div = document.createElement("div");
    div.className = "skeleton-card";
    resultsDiv.appendChild(div);
  }
}

async function fetchGiveaways() {
  showSkeletons();

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const res = await fetch(baseUrl, { headers });
    const data = await res.json();
    currentResults = data;
    clearSkeletons();
    renderResults(data);
    setupSearch(data);
    setupPlatformFilters(data);
    setupFavoritesToggle(data);
  } catch (err) {
    resultsDiv.innerHTML =
      "<p style='color:red;'>Failed to load giveaways. Please try again later.</p>";
    console.error(err);
  }
}

function clearSkeletons() {
  document.querySelectorAll(".skeleton-card").forEach((el) => el.remove());
}

function setupSearch(games) {
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    const filtered = games.filter((g) => g.title.toLowerCase().includes(query));
    renderResults(filtered);
  });
}

function setupPlatformFilters(games) {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const platform = btn.dataset.platform;
      const filtered =
        platform === "all"
          ? games
          : games.filter((g) => g.platforms.includes(platform));
      renderResults(filtered);
    });
  });
}

function getTimeLeft(endDateStr) {
  if (!endDateStr || isNaN(Date.parse(endDateStr))) return "No timer";

  const end = new Date(endDateStr);
  const now = new Date();
  const diff = end - now;

  if (diff <= 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}d ${hrs}h ${mins}m left`;
}



function renderResults(games) {
  resultsDiv.innerHTML = games
    .map((g) => {
      const expires = `<span class="expires">${getTimeLeft(g.end_date)}</span>`;



      const isFav = isFavorite(g.id);
      return `
  <div class="card">
    <div class="card-body">
      <h3>${g.title}</h3>
      <em>${g.platforms}</em><br/>
      ${expires}
    </div>
    <div class="card-footer">
      <a href="${g.open_giveaway_url}" target="_blank">Claim Here</a>
      <button class="fav-btn" data-id="${g.id}">
        ${isFav ? "❤️" : "🤍"}
      </button>
    </div>
  </div>
`;
    })
    .join("");
  setupFavoriteListeners();
}

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  let favorites = getFavorites();
  if (favorites.includes(id)) {
    favorites = favorites.filter((favId) => favId !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function setupFavoriteListeners() {
  document.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      toggleFavorite(id);
      renderResults(currentResults);
    });
  });
}
function setupFavoritesToggle(games) {
  const toggle = document.getElementById("toggleFavorites");
  if (!toggle) return;

  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      const favIds = getFavorites();
      const filtered = games.filter((g) => favIds.includes(g.id));
      renderResults(filtered);
    } else {
      renderResults(games);
    }
  });
}

fetchGiveaways();
