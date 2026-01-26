import "./style.css";

const JOBS = [
  { id: 1, title: "Intitulé du stage", company: "Entreprise", city: "Ville", url: "#" },
  { id: 2, title: "Intitulé du stage", company: "Entreprise", city: "Ville", url: "#" },
  { id: 3, title: "Intitulé du stage", company: "Entreprise", city: "Ville", url: "#" },
];

const $topbar = document.querySelector("#topbar");
const $view = document.querySelector("#view");

const store = {
  getFavs() {
    try {
      return new Set(JSON.parse(localStorage.getItem("favs") || "[]"));
    } catch {
      return new Set();
    }
  },
  setFavs(set) {
    localStorage.setItem("favs", JSON.stringify([...set]));
  },
};

function setTopbar(leftHtml, rightHtml) {
  $topbar.innerHTML = `<div>${leftHtml}</div><div>${rightHtml}</div>`;
}

function profileBtn() {
  return `<button class="wf-btn text-xs" type="button">Profil / Déconnexion</button>`;
}

function backBtn(to) {
  return `<button class="wf-btn text-xs" type="button" data-go="${to}">← Retour</button>`;
}

function setActiveNav(key) {
  document.querySelectorAll(".navbtn").forEach((b) => {
    const active = b.dataset.nav === key;
    b.classList.toggle("bg-neutral-100", active);
  });
}

function route() {
  const hash = location.hash.replace("#", "");

  if (hash.startsWith("search")) return renderSearch();
  if (hash === "follow") return renderFollow();
  if (hash === "favorites") return renderFavorites();
  if (hash === "settings") return renderSettings();
  return renderHome();
}

function renderHome() {
  setActiveNav("home");
  setTopbar(`<div class="text-xs font-semibold text-neutral-700">ACCUEIL</div>`, profileBtn());

  $view.innerHTML = `
    <div class="relative min-h-[52vh]">
      <div class="grid h-full place-items-center">
        <div class="w-full max-w-xl text-center">
          <div class="wf-bar mx-auto max-w-lg">Recherche un stage</div>

          <div class="mt-5 flex justify-center">
            <input id="homeQ" class="wf-input w-full max-w-lg" placeholder="Recherche un stage" />
          </div>

          <div class="mt-4">
            <button id="homeGo" class="wf-btn px-10" type="button">Search</button>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 right-0">
        <button class="wf-btn text-xs" type="button" data-go="#follow">Suivi →</button>
      </div>
    </div>
  `;

  document.querySelector("#homeGo").addEventListener("click", () => {
    location.hash = "#search";
  });
}

function jobRow(job, favs) {
  const saved = favs.has(job.id);
  return `
    <li class="wf-panel px-4 py-3">
      <div class="text-sm font-semibold">${job.title}</div>
      <div class="mt-2 space-y-1 text-xs text-neutral-900">
        <div>${job.company}</div>
        <div>${job.city}</div>
      </div>
      <div class="mt-3 flex gap-3">
        <a class="wf-btn text-xs" href="${job.url}" target="_blank" rel="noopener">Voir l'offre</a>
        <button class="wf-btn text-xs save" type="button" data-id="${job.id}">
          ${saved ? "Sauvegardé" : "Sauvegarder"}
        </button>
      </div>
    </li>
  `;
}

function bindSaveButtons() {
  document.querySelectorAll(".save").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const favs = store.getFavs();
      favs.has(id) ? favs.delete(id) : favs.add(id);
      store.setFavs(favs);
      route();
    });
  });
}

function renderSearch() {
  setActiveNav("home");
  setTopbar(backBtn("#"), profileBtn());

  const favs = store.getFavs();

  $view.innerHTML = `
    <div class="space-y-6">
      <div class="wf-bar mx-auto max-w-xl">Stages recommandés</div>

      <div class="wf-scroll mx-auto max-w-2xl">
        <ul class="max-h-[320px] space-y-6 overflow-y-auto pr-2">
          ${JOBS.map((j) => jobRow(j, favs)).join("")}
        </ul>
      </div>
    </div>
  `;

  bindSaveButtons();
}

function renderFollow() {
  setActiveNav(null);
  setTopbar(backBtn("#"), profileBtn());

  $view.innerHTML = `
    <div class="space-y-8">
      <div class="wf-bar mx-auto max-w-xl">Suivi</div>

      <div class="mt-6 grid gap-6 sm:grid-cols-3">
        <div class="wf-card"><div class="text-sm">Candidatures</div><div class="mt-3 text-lg font-semibold">12</div></div>
        <div class="wf-card"><div class="text-sm">Entretiens :</div><div class="mt-3 text-lg font-semibold">3</div></div>
        <div class="wf-card"><div class="text-sm">Réponses:</div><div class="mt-3 text-lg font-semibold">4</div></div>
      </div>
    </div>
  `;
}

function renderFavorites() {
  setActiveNav("favorites");
  setTopbar(`<div class="text-xs font-semibold text-neutral-700">FAVORIS</div>`, profileBtn());

  const favs = store.getFavs();
  const favJobs = JOBS.filter((j) => favs.has(j.id));

  $view.innerHTML = `
    <div class="wf-scroll">
      ${
        favJobs.length
          ? `<ul class="space-y-6">${favJobs.map((j) => jobRow(j, favs)).join("")}</ul>`
          : `<div class="wf-panel p-4 text-sm text-neutral-900">Aucun favori.</div>`
      }
    </div>
  `;

  bindSaveButtons();
}

function renderSettings() {
  setActiveNav("settings");
  setTopbar(`<div class="text-xs font-semibold text-neutral-700">PARAMÈTRES</div>`, profileBtn());

  $view.innerHTML = `
    <div class="wf-panel p-6 text-sm">Paramètres (placeholder).</div>
  `;
}

/* sidebar nav */
document.querySelectorAll("[data-nav]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.nav;
    location.hash = page === "home" ? "#" : `#${page}`;
  });
});

/* global back */
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-go]");
  if (el) location.hash = el.dataset.go;
});

window.addEventListener("hashchange", route);
route();
