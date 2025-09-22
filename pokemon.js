// Globaalit tilamuuttujat
let currentPokemonData = null;
let currentShownName = '';
let showingBack = false;

// Enter-näppäin käynnistää haun
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.id === 'pokemonName') {
    poke();
  }
});

function poke() {
  const inputEl = document.getElementById('pokemonName');
  const pokedNameTyped = inputEl.value.trim();
  const pokeName = pokedNameTyped.toLowerCase();

  // Nollaa ilmoitusalueet
  document.getElementById('vastaus').textContent = '';
  document.getElementById('kuva2').innerHTML = '';
  document.getElementById('actions').innerHTML = '';
  document.getElementById('ominaisuudet').innerHTML = '';

  if (!pokeName) {
    document.getElementById('vastaus').textContent = 'Anna Pokemonin nimi.';
    return;
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`)
    .then((response) => {
      if (!response.ok) throw new Error('Pokemon ei löytynyt (HTTP ' + response.status + ').');
      return response.json();
    })
    .then((responseJson) => {
      currentPokemonData = responseJson;
      currentShownName = pokedNameTyped; // näytetään nimi kuten käyttäjä kirjoitti
      showingBack = false;
      pokekuva(responseJson, pokedNameTyped);
      inputEl.value = ''; // tyhjennä hakukenttä
    })
    .catch((error) => {
      document.getElementById('vastaus').textContent = error.message || 'Tietoa ei pystytä hakemaan';
    });
}

// Näytä kuva + nimi + “Käännä”-nappi + 3 ominaisuutta
function pokekuva(obj, shownName) {
  // Valitse kuva: etupuoli oletuksena, virallinen artwork varalla
  const front = obj?.sprites?.front_default;
  const back = obj?.sprites?.back_default;
  const official = obj?.sprites?.other?.['official-artwork']?.front_default;

  const imgUrl = showingBack ? (back || front || official) : (front || official);

  if (!imgUrl) {
    document.getElementById('vastaus').textContent = 'Kuvaa ei löytynyt tälle Pokemonille.';
    return;
  }

  // Päivitä kuva
  document.getElementById('kuva2').innerHTML =
    `<img src="${encodeURI(imgUrl)}" alt="Kuva: ${escapeHtml(obj.name || shownName)}">`;

  // Päivitä nimi
  const prettyName = shownName ? capitalize(shownName) : capitalize(obj.name || '');
  document.getElementById('nimi').innerHTML = `<b>${escapeHtml(prettyName)}</b>`;

  // Luo/ päivitä Käännä-nappi
  const btnDisabled = !back; // jos takakuvaa ei ole, nappi disabloidaan
  const btnLabel = showingBack ? 'Etupuoli' : 'Käännä';
  document.getElementById('actions').innerHTML = `
    <button class="btn btn-secondary" onclick="kaanna()" ${btnDisabled ? 'disabled' : ''}>
      ${btnLabel}
    </button>
  `;
  if (btnDisabled) {
    document.getElementById('vastaus').textContent = 'Tälle Pokemonille ei ole takakuvaa.';
  }

  // 3 ominaisuutta: tyypit, pituus (m), paino (kg)
  const types = (obj.types || [])
    .map((t) => capitalize(t?.type?.name || ''))
    .filter(Boolean)
    .join(', ') || '-';

  const heightM = isFinite(obj.height) ? (obj.height / 10).toFixed(1) + ' m' : '-';   // decimetreistä metreiksi
  const weightKg = isFinite(obj.weight) ? (obj.weight / 10).toFixed(1) + ' kg' : '-';  // hectogrammoista kiloiksi

  document.getElementById('ominaisuudet').innerHTML = `
    <h3>Ominaisuudet</h3>
    <ul class="mb-0">
      <li><b>Tyyppi(t):</b> ${escapeHtml(types)}</li>
      <li><b>Pituus:</b> ${escapeHtml(heightM)}</li>
      <li><b>Paino:</b> ${escapeHtml(weightKg)}</li>
    </ul>
  `;
}

// Nappi: vaihda etupuoli ↔ takapuoli
function kaanna() {
  if (!currentPokemonData) return;
  showingBack = !showingBack;
  pokekuva(currentPokemonData, currentShownName);
}

// Apurit
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function capitalize(s) {
  s = String(s || '');
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
