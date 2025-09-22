// Tehtävänannon URL (Helsinki, id=658225, lang=fi, units=metric)
const OWM_URL =
  "https://api.openweathermap.org/data/2.5/weather?id=658225&appid=665ecd56dfc08dbb50feb8b8f5034e28&lang=fi&units=metric";

// Päivitä lataushetken JS-aika ja hae data
window.addEventListener("DOMContentLoaded", () => {
  // JS-aika, kun sivu ladattiin
  const now = new Date();
  document.getElementById("aika").textContent =
    "Sivu ladattu: " +
    now.toLocaleString("fi-FI", {
      weekday: "long",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  // Hae Helsingin säätiedot
  haeHelsinki();
});

function haeHelsinki() {
  const virheEl = document.getElementById("saa-virhe");
  const tulosEl = document.getElementById("saa-tulos");
  virheEl.textContent = "";
  tulosEl.innerHTML = "";

  fetch(OWM_URL)                // fetch(URL)
    .then((response) => {
      if (!response.ok) throw new Error("HTTP-virhe: " + response.status);
      return response.json();   // response.json() → JS-olio "data"
    })
    .then((data) => {
      // data-oliota voidaan nyt käsitellä
      naytaSaa(data);
    })
    .catch((err) => {
      virheEl.textContent = err.message || "Tietoa ei pystytä hakemaan.";
    });
}

function naytaSaa(data) {
  const tulosEl = document.getElementById("saa-tulos");

  // Sääkuvaus + ikoni
  const weather = (data.weather && data.weather[0]) || {};
  const kuvaus = capitalize(weather.description || "");
  const icon = weather.icon; // esim. "10d"
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : "";

  // Lämpötila, tuuli
  const temp = isFinite(data?.main?.temp) ? `${data.main.temp.toFixed(1)} °C` : "-";
  const wind = isFinite(data?.wind?.speed) ? `${data.wind.speed.toFixed(1)} m/s` : "-";

  // Kaupungin nimi
  const name = data?.name || "Helsinki";

  // Rakennetaan kortti
  const html = `
    <div class="card shadow-sm">
      <div class="card-body d-flex align-items-center gap-3">
        ${iconUrl ? `<img src="${iconUrl}" alt="Sääikoni" width="80" height="80">` : ""}
        <div>
          <h2 class="h4 mb-1">${escapeHtml(name)}</h2>
          <div><b>Sää:</b> ${escapeHtml(kuvaus || "-")}</div>
          <div><b>Lämpötila:</b> ${escapeHtml(temp)}</div>
          <div><b>Tuuli:</b> ${escapeHtml(wind)}</div>
        </div>
      </div>
    </div>
  `;
  tulosEl.innerHTML = html;
}

// Apurit
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
