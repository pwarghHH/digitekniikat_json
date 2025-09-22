// Enter-näppäin käynnistää haun
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.id === 'pokemonName') {
    poke();
  }
});

function poke() {
  // käyttäjän syöte
  const inputEl = document.getElementById('pokemonName');
  const pokedNameTyped = inputEl.value.trim();
  const pokeName = pokedNameTyped.toLowerCase(); // haku pienillä kirjaimilla

  // nollaa ilmoitusalueet
  document.getElementById('vastaus').textContent = '';
  document.getElementById('kuva2').innerHTML = '';

  if (!pokeName) {
    document.getElementById('vastaus').textContent = 'Anna Pokemonin nimi.';
    return;
  }

  // hae PokeAPI:sta
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokeName}`)
    .then(function (response) {
      if (!response.ok) {
        // esim. 404 = ei löydy
        throw new Error('Pokemon ei löytynyt (HTTP ' + response.status + ').');
      }
      return response.json();
    })
    .then(function (responseJson) {
      pokekuva(responseJson, pokedNameTyped); // välitetään myös kirjoitettu nimi näyttöä varten
      inputEl.value = ''; // tyhjennä hakukenttä
    })
    .catch(function (error) {
      document.getElementById('vastaus').textContent = error.message || 'Tietoa ei pystytä hakemaan';
    });
}

// näyttää kuvan ja nimen
function pokekuva(obj, shownName) {
  // kuva: käytä perusspriteä, tai virallista artworkia varalle
  const sprite = obj?.sprites?.front_default;
  const official = obj?.sprites?.other?.['official-artwork']?.front_default;
  const imgUrl = sprite || official;

  if (!imgUrl) {
    document.getElementById('vastaus').textContent = 'Kuvaa ei löytynyt tälle Pokemonille.';
    return;
  }

  document.getElementById('kuva2').innerHTML =
    `<img src="${encodeURI(imgUrl)}" alt="Kuva: ${escapeHtml(obj.name || shownName)}">`;

  // näytä nimi kuten käyttäjä kirjoitti (pieni siistintä)
  const prettyName = shownName ? capitalize(shownName) : capitalize(obj.name || '');
  document.getElementById('nimi').innerHTML = `<b>${escapeHtml(prettyName)}</b>`;
}

// apurit
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function capitalize(s) {
  s = String(s);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
