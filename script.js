// Haetaan oma JSON-tiedosto
fetch('./tietue.json')
  .then(function (response) {
    if (!response.ok) {
      throw new Error('HTTP-virhe: ' + response.status);
    }
    return response.json(); // Muutetaan JSON → JS-olioksi
  })
  .then(function (responseJson) {
    kerro(responseJson); // Kutsutaan omaa funktiota
  })
  .catch(function (error) {
    console.error(error);
    document.getElementById('virhe').textContent =
      'Tietoa ei pystytä hakemaan.';
  });

// Funktio, joka rakentaa HTML-sisällön
function kerro(obj) {
  let tiedot = `
    <h2>${escapeHtml(obj.otsikko)}</h2>
    <p>${escapeHtml(obj.kuvaus)}</p>
    <hr>
    <p><img src="${obj.kuva}" alt="Kuva"></p>
    <h3>Opintojakso</h3>
    Nimi: ${escapeHtml(obj.opintojakso.nimi)}<br>
    Tunnus: ${escapeHtml(obj.opintojakso.tunnus)}<br>
    Opintopisteet: ${obj.opintojakso.opintopisteet}<br>
  `;

  // Aiheet (sisältö-taulukko)
  if (Array.isArray(obj.sisalto)) {
    tiedot += '<h3>Aiheet</h3><ul>';
    for (let i = 0; i < obj.sisalto.length; i++) {
      tiedot += `<li>${escapeHtml(obj.sisalto[i])}</li>`;
    }
    tiedot += '</ul>';
  }

  // Tekniikat (taulukko olioita)
  if (Array.isArray(obj.tekniikat)) {
    tiedot += '<h3>Tekniikat</h3>';
    for (let i = 0; i < obj.tekniikat.length; i++) {
      tiedot += `<p>
        <b>Aihe: ${escapeHtml(obj.tekniikat[i].aihe)}</b><br>
        <a href="${obj.tekniikat[i].linkki}" target="_blank">
          ${escapeHtml(obj.tekniikat[i].linkki)}
        </a>
      </p>`;
    }
  }

  document.getElementById('vastaus').innerHTML = tiedot;
}

// Apufunktio: estetään vaarallisen HTML:n ruiskutus
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
