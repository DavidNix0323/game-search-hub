document.addEventListener("DOMContentLoaded", () => {
  const results = document.getElementById("results");
  const toggleFavorites = document.getElementById("toggleFavorites");
  const toggleCompact = document.getElementById("toggleCompact");
  const toggleTheme = document.getElementById("toggleTheme");
  const searchInput = document.getElementById("searchInput");

  const getFavorites = () =>
    JSON.parse(localStorage.getItem("favorites") || "[]");
  const saveFavorites = (favorites) =>
    localStorage.setItem("favorites", JSON.stringify(favorites));

  if (localStorage.getItem("compactMode") === "true") {
    toggleCompact.checked = true;
    results.classList.add("compact");
  }

  if (localStorage.getItem("theme") === "light") {
    toggleTheme.checked = true;
    document.body.classList.add("light");
  }

  toggleCompact.addEventListener("change", (e) => {
    results.classList.toggle("compact", e.target.checked);
    localStorage.setItem("compactMode", e.target.checked);
  });

  toggleTheme.addEventListener("change", (e) => {
    document.body.classList.toggle("light", e.target.checked);
    localStorage.setItem("theme", e.target.checked ? "light" : "dark");
  });

  function formatDate(dateStr) {
    if (!dateStr || dateStr === "N/A") return "No timer";
    const end = new Date(dateStr);
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${minutes}m left`;
  }

  function renderGiveaways(data) {
    const favorites = getFavorites();
    results.innerHTML = "";

    data.forEach((giveaway) => {
      const isFavorited = favorites.includes(String(giveaway.id));

      const card = document.createElement("div");
      card.className = "card giveaway-card";
      card.innerHTML = `
        <div class="card-body">
          <img src="${giveaway.thumbnail}" alt="${
        giveaway.title
      }" class="giveaway-img" />
          <h3>${giveaway.title}</h3>
          <p><strong>Platforms:</strong> ${giveaway.platforms}</p>
          <p><strong>Worth:</strong> ${giveaway.worth}</p>
          <p class="expires"><strong>Ends:</strong> ${formatDate(
            giveaway.end_date
          )}</p>
        </div>
        <div class="card-footer">
          <a href="${giveaway.open_giveaway_url}" target="_blank">Claim Here</a>
          <button class="fav-btn ${isFavorited ? "favorited" : ""}" data-id="${
        giveaway.id
      }">❤</button>
        </div>
      `;
      results.appendChild(card);
    });

    attachFavoriteListeners();
    setupPlatformFilters(data);
    setupSearchFilter();
  }

  function attachFavoriteListeners() {
    document.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = String(btn.dataset.id); // force it to be a string

        let favorites = getFavorites();
        if (favorites.includes(id)) {
          favorites = favorites.filter((fav) => fav !== id);
          btn.classList.remove("favorited");
        } else {
          favorites.push(id);
          btn.classList.add("favorited");
        }
        saveFavorites(favorites);
        if (toggleFavorites.checked) filterFavorites();
      });
    });
  }

  function filterFavorites() {
    const favorites = getFavorites();
    document.querySelectorAll(".giveaway-card").forEach((card) => {
      const id = card.querySelector(".fav-btn").dataset.id;
      card.style.display = favorites.includes(id) ? "" : "none";
    });
  }

  toggleFavorites.addEventListener("change", (e) => {
    if (e.target.checked) {
      filterFavorites();
    } else {
      document.querySelectorAll(".giveaway-card").forEach((card) => {
        card.style.display = "";
      });
    }
  });

  function setupPlatformFilters(data) {
    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const platform = btn.textContent.trim().toLowerCase();

        document.querySelectorAll(".giveaway-card").forEach((card) => {
          const platformText = card
            .querySelector("p:nth-of-type(1)")
            .innerHTML.toLowerCase()
            .replace(/<[^>]*>/g, "");

          const matches = platform === "all" || platformText.includes(platform);
          card.style.display = matches ? "" : "none";
        });
      });
    });
  }

  function setupSearchFilter() {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();

      document.querySelectorAll(".giveaway-card").forEach((card) => {
        const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
        const platform =
          card.querySelector("p:nth-of-type(1)")?.textContent.toLowerCase() ||
          "";

        const matches = title.includes(query) || platform.includes(query);
        card.style.display = matches ? "" : "none";
      });
    });
  }

  function showSkeletons(count = 6) {
    results.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "card skeleton-card";
      skeleton.innerHTML = `
        <div class="card-body">
          <div class="skeleton-img"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
        </div>
        <div class="card-footer">
          <div class="skeleton-line small"></div>
          <div class="skeleton-heart"></div>
        </div>
      `;
      results.appendChild(skeleton);
    }
  }

  showSkeletons();

  fetch("https://corsproxy.io/?https://www.gamerpower.com/api/giveaways")
    .then((res) => res.json())
    .then((data) => renderGiveaways(data))
    .catch((err) => {
      console.error("Fetch error:", err);
      results.innerHTML =
        "<p>Failed to load giveaways. Please try again later.</p>";
    });
});
