const $ = id => document.getElementById(id);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const ALL = STUDENTS.map(([nom, prenom, photo = ""], id) => ({ id, nom, prenom, photo }));
let sortBy = "nom";

const EXT = ["jpg","jpeg","png","webp","JPG","JPEG","PNG"];
window.nextPhoto = img => {
  const i = +img.dataset.try + 1;
  if (i >= EXT.length) { img.remove(); return; }
  img.dataset.try = i;
  img.src = `photos/${img.dataset.base}.${EXT[i]}`;
};

const hue = s => [...s.nom + s.prenom].reduce((a, c) => a + c.charCodeAt(0), 0) * 37 % 360;

function tile(s) {
  const ini = (s.prenom[0] + s.nom[0]).toUpperCase();
  const img = s.photo
    ? `<img src="photos/${s.photo}.jpg" data-base="${s.photo}" data-try="0" alt="${s.prenom} ${s.nom}" loading="lazy" onerror="nextPhoto(this)">` : "";
  return `<article class="tile" style="--h:${hue(s)}">
    <button class="ring" data-id="${s.id}" aria-label="Agrandir la photo de ${s.prenom} ${s.nom}">
      <span class="disc"><span class="initials">${ini}</span>${img}</span>
    </button>
    <p class="nom">${s.nom}</p><p class="prenom">${s.prenom}</p>
  </article>`;
}

function render() {
  const q = norm($("search").value.trim());
  const k2 = sortBy === "nom" ? "prenom" : "nom";
  const list = ALL
    .filter(s => norm(`${s.nom} ${s.prenom}`).includes(q))
    .sort((a, b) => a[sortBy].localeCompare(b[sortBy], "fr") || a[k2].localeCompare(b[k2], "fr"));

  let html = "", last = "";
  for (const s of list) {
    const L = norm(s[sortBy])[0]?.toUpperCase() || "#";
    if (L !== last) { html += `<h2 class="letter">${L}</h2>`; last = L; }
    html += tile(s);
  }
  $("grid").innerHTML = html;
  $("empty").hidden = list.length > 0;

  const filtered = q && list.length !== ALL.length;
  $("num").textContent = filtered ? `${list.length}/${ALL.length}` : ALL.length;
  $("label").textContent = (filtered ? list.length : ALL.length) > 1 ? "étudiants" : "étudiant";
}

$("search").addEventListener("input", render);
const setSort = k => {
  sortBy = k;
  $("byNom").setAttribute("aria-pressed", k === "nom");
  $("byPrenom").setAttribute("aria-pressed", k === "prenom");
  render();
};
$("byNom").addEventListener("click", () => setSort("nom"));
$("byPrenom").addEventListener("click", () => setSort("prenom"));

$("grid").addEventListener("click", e => {
  const b = e.target.closest(".ring");
  if (!b) return;
  const s = ALL[b.dataset.id];
  const img = b.querySelector("img");
  $("modalImg").hidden = !img;
  $("modalInitials").hidden = !!img;
  $("modalInitials").textContent = (s.prenom[0] + s.nom[0]).toUpperCase();
  if (img) { $("modalImg").src = img.src; $("modalImg").alt = `${s.prenom} ${s.nom}`; }
  $("modalName").textContent = `${s.prenom} ${s.nom.toUpperCase()}`;
  $("modal").showModal();
});
$("close").addEventListener("click", () => $("modal").close());
$("modal").addEventListener("click", e => { if (e.target === $("modal")) $("modal").close(); });

render();
