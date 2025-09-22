fetch('./toteutus.json')
  .then((res) => {
    if (!res.ok) throw new Error('HTTP-virhe: ' + res.status);
    return res.json();
  })
  .then((data) => naytaToteutus(data))
  .catch((err) => {
    console.error(err);
    document.getElementById('toteutus-virhe').textContent = 'Tietoa ei pystytä hakemaan.';
  });

function naytaToteutus(obj) {
  const root = document.getElementById('toteutus');

  const alku = new Date(obj.alku);
  const loppu = new Date(obj.loppu);

  const pvmFi = (d) =>
    d.toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric' });

  let html = `
    <div class="card shadow-sm">
      <img src="${encodeURI(obj.kuva)}" class="card-img-top" alt="Toteutuksen kuva">
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(obj.toteutus_nimi)}</h3>
        <p class="card-text">
          Osallistujia: ${Number(obj.osallistujia)} kpl<br>
          Aika: ${pvmFi(alku)} – ${pvmFi(loppu)}<br>
          Kesto: ${Number(obj.kesto_viikkoina)} viikkoa
        </p>
        <h5>Osallistujat</h5>
        <ul class="mb-0">
          ${(obj.osallistujat || []).map((n) => `<li>${escapeHtml(n)}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  root.innerHTML = html;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
