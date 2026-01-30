import React, { useEffect, useMemo, useState } from "react";

const JOBS = [
  { id: 1, title: "Intitulé du stage", company: "Entreprise", city: "Ville", url: "#" },
  { id: 2, title: "Intitulé du stage", company: "Entreprise", city: "Ville", url: "#" },
  { id: 3, title: "Intitulé du stage", company: "Entreprise", city: "Ville", url: "#" },
];

const PAGES = ["accueil", "recherche", "suivi", "favoris", "parametres"];

function getPage() {
  const h = (window.location.hash || "#accueil").slice(1);
  return PAGES.includes(h) ? h : "accueil";
}

function loadFavs() {
  try { return new Set(JSON.parse(localStorage.getItem("favs") || "[]")); }
  catch { return new Set(); }
}
export default function App() {
  const [page, setPage] = useState(getPage);
  const [favs, setFavs] = useState(loadFavs);

  useEffect(() => {
    const onHash = () => setPage(getPage());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    localStorage.setItem("favs", JSON.stringify([...favs]));
  }, [favs]);

  const favJobs = useMemo(() => JOBS.filter((j) => favs.has(j.id)), [favs]);

  const go = (p) => { window.location.hash = `#${p}`; };

  const toggleFav = (id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full bg-neutral-300 p-4">
      {/* plateau = prend la hauteur */}
      <div className="wf-stage mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col p-4">
        {/* topbar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-neutral-700">
            {page.toUpperCase()}
          </div>

          <div className="flex items-center gap-2">
            {page !== "accueil" && (
              <button className="wf-btn text-xs" type="button" onClick={() => go("accueil")}>
                ← Retour
              </button>
            )}
            <button className="wf-btn text-xs" type="button">
              Profil / Déconnexion
            </button>
          </div>
        </div>

        {/* layout */}
        <div className="grid flex-1 gap-4 md:grid-cols-[220px_1fr]">
          {/* sidebar */}
          <aside className="flex flex-col justify-between">
            <div className="space-y-2">
              <button className="wf-btn w-full text-left" onClick={() => go("accueil")}>Recherches</button>
              <button className="wf-btn w-full text-left" type="button" onClick={() => alert("À faire")}>Candidatures</button>
              <button className="wf-btn w-full text-left" type="button" onClick={() => alert("À faire")}>Messages</button>
            </div>

            <div className="space-y-2">
              <button className="wf-btn w-full text-left" onClick={() => go("favoris")}>Favoris</button>
              <button className="wf-btn w-full text-left" onClick={() => go("parametres")}>Parametres</button>
            </div>
          </aside>

          {/* content */}
          <main className="relative min-h-[520px]">
            {page === "accueil" && (
              <Accueil onSearch={() => go("recherche")} onFollow={() => go("suivi")} />
            )}
            {page === "recherche" && (
              <Recherche favs={favs} onToggleFav={toggleFav} />
            )}
            {page === "suivi" && <Suivi />}
            {page === "favoris" && (
              <Favoris jobs={favJobs} favs={favs} onToggleFav={toggleFav} />
            )}
            {page === "parametres" && (
              <Parametres onReset={() => setFavs(new Set())} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
function Accueil({ onSearch, onFollow }) {
  return (
    <div className="relative h-full min-h-[520px]">
      {/* centre */}
      <div className="grid h-full place-items-center">
        <div className="w-full max-w-xl text-center">
          <div className="wf-block mx-auto w-full max-w-md py-3 text-sm">Recherche un stage</div>

          <div className="mt-6 flex justify-center">
            <input className="wf-input w-full max-w-md" placeholder="Recherche un stage" />
          </div>
          <div className="mt-4">
            <button className="wf-btn px-10" type="button" onClick={onSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* bas droite */}
      <div className="absolute bottom-0 right-0">
        <button className="wf-btn text-xs" type="button" onClick={onFollow}>
          Suivi →
        </button>
      </div>
    </div>
  );
}

function Recherche({ favs, onToggleFav }) {
  return (
    <div className="h-full">
      <div className="wf-block mx-auto max-w-2xl py-3 text-center text-sm">Stages recommandés</div>

      <div className="mt-6 wf-stage mx-auto max-w-3xl p-3">
        <ul className="max-h-[360px] space-y-8 overflow-y-auto pr-3">
          {JOBS.map((job) => {
            const saved = favs.has(job.id);
            return (
              <li key={job.id} className="space-y-2">
                <div className="text-sm">{job.title}</div>
                <div className="text-xs">Entreprise</div>
                <div className="text-xs">Ville</div>

                <div className="mt-2 flex gap-3">
                  <a className="wf-btn text-xs" href={job.url} target="_blank" rel="noopener">
                    Voir l'offre
                  </a>
                  <button className="wf-btn text-xs" type="button" onClick={() => onToggleFav(job.id)}>
                    {saved ? "Sauvegardé" : "Sauvegarder"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Suivi() {
  return (
    <div className="h-full">
      <div className="wf-block mx-auto max-w-2xl py-3 text-center text-sm">Suivi</div>

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        <div className="wf-block p-6 text-center">
          <div className="text-sm">Candidatures</div>
          <div className="mt-4 text-base">12</div>
        </div>
        <div className="wf-block p-6 text-center">
          <div className="text-sm">Entretiens :</div>
          <div className="mt-4 text-base">3</div>
        </div>
        <div className="wf-block p-6 text-center">
          <div className="text-sm">Réponses:</div>
          <div className="mt-4 text-base">4</div>
        </div>
      </div>
    </div>
  );
}

function Favoris({ jobs, favs, onToggleFav }) {
  return (
    <div className="h-full">
      <div className="wf-block mx-auto max-w-2xl py-3 text-center text-sm">Favoris</div>

      <div className="mt-6 wf-stage p-3">
        {jobs.length === 0 ? (
          <div className="wf-block p-4 text-sm">Aucun favori.</div>
        ) : (
          <ul className="space-y-8">
            {jobs.map((job) => (
              <li key={job.id} className="space-y-2">
                <div className="text-sm">{job.title}</div>
                <div className="text-xs">Entreprise</div>
                <div className="text-xs">Ville</div>
                <div className="mt-2 flex gap-3">
                  <a className="wf-btn text-xs" href={job.url} target="_blank" rel="noopener">Voir l'offre</a>
                  <button className="wf-btn text-xs" type="button" onClick={() => onToggleFav(job.id)}>
                    {favs.has(job.id) ? "Retirer" : "Sauvegarder"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Parametres({ onReset }) {
  return (
    <div className="h-full">
      <div className="wf-block mx-auto max-w-2xl py-3 text-center text-sm">Paramètres</div>

      <div className="mt-6 wf-block p-6 text-sm">
        <button className="wf-btn text-xs" type="button" onClick={onReset}>
          Reset favoris
        </button>
      </div>
    </div>
  );
}
