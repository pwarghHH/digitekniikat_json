let currentPokemonData = null;
let currentShownName = '';
let showingBack = false;

let listOffset = 0;
let listLimit = 50;     // montako nimeä per “sivu”
let listTotalCount = 0; // API palauttaa kokonaismäärän

// Tapahtumat

// Enter-näppäin käynnistää haun
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.id === 'pokemonName') {
    poke();
  }
});

// lataa ensimmäinen nimisivu 
window.addEventListener('DOMContentLoaded', () => {
  const loadBtn = document.getElementById('btnLoadMore');
  if (loadBtn) {
    loadBtn.addEventListener('click', () => loadPokemonNames());
  }
  // lataa ensimmäinen erä nimiä
  resetNameList();
  loadPokemonNames();
});

// Haku nimellä
function poke() {
  const inputEl = document.getElementById('pokemonName');
  const pokedNameTyped = inputEl.value.trim();
  const pokeName = pokedNameTyped.toLowerCase();

  // nollaa ilmoitusalueet
  setError('');
  setHtml('kuva2', '');
  setHtml('actions', '');
  setHtml('ominaisuudet', '');

  if (!pokeName) {
    setError('Anna Pokemonin nimi.');
    return;
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`)
    .then((response) => {
      if (!response.ok) throw new Error('Pokemon ei löytynyt (HTTP ' + response.status + ').');
      return response.json();
    })
    .then((responseJson) => {
      currentPokemonData = responseJson;
      currentShownName = pokedNameTyped;
      showingBack = false;
      pokekuva(responseJson, pokedNameTyped);
      inputEl.value = ''; // tyhjennä hakukenttä
    })
    .catch((error) => setError(error.message || 'Tietoa ei pystytä hakemaan'));
}

// näytä kuva + nimi + “Käännä”-nappi + 3 ominaisuutta
function pokekuva(obj, shownName) {
  const front = obj?.sprites?.front_default;
  const back = obj?.sprites?.back_default;
  const official = obj?.sprites?.other?.['official-artwork']?.front_default;
  const imgUrl = showingBack ? (back || front || official) : (front || official);

  if (!imgUrl) {
    setError('Kuvaa ei löytynyt tälle Pokemonille.');
    return;
  }

  setHtml(
    'kuva2',
    `<img src="${encodeURI(imgUrl)}" alt="Kuva: ${escapeHtml(obj.name || shownName)}">`
  );

  const prettyName = shownName ? capitalize(shownName) : capitalize(obj.name || '');
  setHtml('nimi', `<b>${escapeHtml(prettyName)}</b>`);

  // “Käännä” nappi (jos takakuvaa ei ole niin pois käytöstä)
  const btnDisabled = !back;
  const btnLabel = showingBack ? 'Etupuoli' : 'Käännä';
  setHtml(
    'actions',
    `<button class="btn btn-secondary" onclick="kaanna()" ${btnDisabled ? 'disabled' : ''}>
       ${btnLabel}
     </button>`
  );
  if (btnDisabled) setError('Tälle Pokemonille ei ole takakuvaa.');

  // 3 ominaisuutta: tyyppi, pituus, paino
  const types = (obj.types || [])
    .map((t) => capitalize(t?.type?.name || ''))
    .filter(Boolean)
    .join(', ') || '-';
  const heightM = isFinite(obj.height) ? (obj.height / 10).toFixed(1) + ' m' : '-';
  const weightKg = isFinite(obj.weight) ? (obj.weight / 10).toFixed(1) + ' kg' : '-';

  setHtml(
    'ominaisuudet',
    `<h3>Ominaisuudet</h3>
     <ul class="mb-0">
       <li><b>Tyyppi(t):</b> ${escapeHtml(types)}</li>
       <li><b>Pituus:</b> ${escapeHtml(heightM)}</li>
       <li><b>Paino:</b> ${escapeHtml(weightKg)}</li>
     </ul>`
  );
}

// vaihda etupuoli ↔ takapuoli
function kaanna() {
  if (!currentPokemonData) return;
  showingBack = !showingBack;
  pokekuva(currentPokemonData, currentShownName);
}

// Pokemon-nimilista 

function resetNameList() {
  listOffset = 0;
  listTotalCount = 0;
  const listEl = document.getElementById('pokemon-list');
  if (listEl) listEl.innerHTML = '';
  const btn = document.getElementById('btnLoadMore');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Lataa lisää';
  }
}

function loadPokemonNames() {
  const btn = document.getElementById('btnLoadMore');
  if (btn) btn.disabled = true;

  fetch(`https://pokeapi.co/api/v2/pokemon?limit=${listLimit}&offset=${listOffset}`)
    .then((res) => {
      if (!res.ok) throw new Error('Nimilistan haku epäonnistui (HTTP ' + res.status + ').');
      return res.json();
    })
    .then((j) => {
      listTotalCount = j.count ?? listTotalCount;
      appendNames(j.results || []);
      listOffset += (j.results || []).length;

      if (btn) {
        if (listOffset >= listTotalCount) {
          btn.disabled = true;
          btn.textContent = 'Ei enempää';
        } else {
          btn.disabled = false;
          btn.textContent = 'Lataa lisää';
        }
      }
    })
    .catch((err) => {
      setError(err.message || 'Nimilistan haku epäonnistui.');
      if (btn) btn.disabled = false;
    });
}

function appendNames(results) {
  const listEl = document.getElementById('pokemon-list');
  if (!listEl || !results.length) return;

  const frag = document.createDocumentFragment();
  results.forEach((item) => {
    const name = item.name || '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-light btn-sm poke-pill';
    btn.textContent = capitalize(name);
    btn.addEventListener('click', () => choosePokemon(name));
    frag.appendChild(btn);
  });
  listEl.appendChild(frag);
}

function choosePokemon(name) {
  // Asetetaan nimi inputtiin ja haetaan
  const inputEl = document.getElementById('pokemonName');
  if (inputEl) inputEl.value = name;
  poke();
}

// Apurit

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setError(msg) {
  const el = document.getElementById('vastaus');
  if (el) el.textContent = msg;
}
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
