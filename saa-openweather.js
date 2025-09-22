// -----------------------------
// OpenWeather asetukset
// -----------------------------
const API_KEY = "665ecd56dfc08dbb50feb8b8f5034e28"; // sama kuin tehtävän URL:ssa
const BASE = "https://api.openweathermap.org/data/2.5/weather";
const HELSINKI_ID = 658225; // Helsingin id tehtävän esimerkissä

const urlById = (id) =>
  `${BASE}?id=${id}&appid=${API_KEY}&lang=fi&units=metric`;

const urlByCity = (q) =>
  `${BASE}?q=${encodeURIComponent(q)}&appid=${API_KEY}&lang=fi&units=metric`;

// -----------------------------
// Sivun lataushetken aika + datojen haku
// -----------------------------
window.addEventListener("DOMContentLoaded", () => {
  // JS-aika, kun sivu ladattiin
  const now = new Date();
  const aikaEl = document.getElementById("aika");
  if (aikaEl) {
    aikaEl.textContent =
      "Sivu ladattu: " +
      now.toLocaleString("fi-FI", {
        weekday: "long",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
  }

  // Hae Helsinki + Turku
  haeHelsinkiJaTurku();
});

async function haeHelsinkiJaTurku() {
  const tulosEl = document.getElementById("saa-tulos");
  const virheEl = document.getElementById("saa-virhe");
  if (!tulosEl) return;

  tulosEl.innerHTML = "";
  if (virheEl) virheEl.textContent = "";

  try {
    // Haetaan kaksi pyyntöä rinnakkain: Helsinki id:llä, Turku nimellä
    const [hels, turku] = await Promise.all([
      fetch(urlById(HELSINKI_ID)).then(chk).then((r) => r.json()).catch((e) => ({ __error: { city: "Helsinki", e } })),
      fetch(urlByCity("Turku,FI")).then(chk).then((r) => r.json()).catch((e) => ({ __error: { city: "Turku", e } }))
    ]);

    // Koostetaan kortit
    const cards = [];
    cards.push(renderEither(hels));
    cards.push(renderEither(turku));

    tulosEl.innerHTML = cards.filter(Boolean).join("");
  } catch (e) {
    if (virheEl) virheEl.textContent = e.message || "Tietoa ei pystytä hakemaan.";
  }
}

function chk(response) {
  if (!response.ok) throw new Error("HTTP-virhe: " + response.status);
  return response;
}

function renderEither(obj) {
  if (obj && obj.__error) {
    return cardError(obj.__error.city, obj.__error.e);
  }
  return renderCard(obj);
}

// -----------------------------
// Kortin renderöinti
// -----------------------------
function renderCard(data) {
  const weather = (data.weather && data.weather[0]) || {};
  const kuvaus = capitalize(weather.description || "");
  const icon = weather.icon ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png` : "";
  const temp = isFinite(data?.main?.temp) ? `${data.main.temp.toFixed(1)} °C` : "-";
  const wind = isFinite(data?.wind?.speed) ? `${data.wind.speed.toFixed(1)} m/s` : "-";
  const name = data?.name || "-";

  return `
    <div class="card shadow-sm mb-3">
      <div class="card-body d-flex align-items-center gap-3">
        ${icon ? `<img src="${icon}" alt="Sääikoni" width="80" height="80">` : ""}
        <div>
          <h2 class="h5 mb-1">${escapeHtml(name)}</h2>
          <div><b>Sää:</b> ${escapeHtml(kuvaus || "-")}</div>
          <div><b>Lämpötila:</b> ${escapeHtml(temp)}</div>
          <div><b>Tuuli:</b> ${escapeHtml(wind)}</div>
        </div>
      </div>
    </div>
  `;
}

function cardError(city, err) {
  return `<div class="alert alert-danger">${escapeHtml(city)}: ${escapeHtml(err.message || "Virhe")}</div>`;
}

// -----------------------------
// Apurit
// -----------------------------
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function capitalize(s) {
  s = String(s || "");
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
