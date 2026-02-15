import React, { useMemo, useState } from "react";

const SEARCH_JOBS = [
  { id: 1, title: "Stage Développeur Web", company: "Ynov", city: "Paris", url: "#" },
  { id: 2, title: "Stage Front-End React", company: "NovaTech", city: "Lyon", url: "#" },
  { id: 3, title: "Stage Développement Logiciel", company: "PixelLabs", city: "Bordeaux", url: "#" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [favs, setFavs] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("favs") || "[]"));
    } catch {
      return new Set();
    }
  });

  const favJobs = useMemo(() => SEARCH_JOBS.filter((j) => favs.has(j.id)), [favs]);

  const addFav = (id) => {
    setFavs((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("favs", JSON.stringify([...next]));
      return next;
    });
  };

  const removeFav = (id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      next.delete(id);
      localStorage.setItem("favs", JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full p-6">
      <div className="shell">
        <div className="card">
          <div className="card-body">
            <div className="topbar">
              <div className="badge">{label(page)}</div>
              <div className="flex gap-2">
                {page !== "home" && (
                  <button className="btn" onClick={() => setPage("home")}>
                    Retour
                  </button>
                )}
                <button className="btn">Profil</button>
              </div>
            </div>

            <div className="mt-6 layout">
              <aside className="flex flex-col justify-between">
                <div className="space-y-1">
                  <SideBtn active={page === "home"} onClick={() => setPage("home")}>
                    Recherches
                  </SideBtn>
                  <SideBtn disabled>Candidatures</SideBtn>
                  <SideBtn disabled>Messages</SideBtn>
                </div>

                <div className="space-y-1">
                  <SideBtn active={page === "favorites"} onClick={() => setPage("favorites")}>
                    Favoris
                  </SideBtn>
                  <SideBtn active={page === "settings"} onClick={() => setPage("settings")}>
                    Paramètres
                  </SideBtn>
                </div>
              </aside>

              <main className="min-h-[520px]">
                {page === "home" && (
                  <Home
                    query={query}
                    setQuery={setQuery}
                    onSearch={() => setPage("search")}
                    onFollow={() => setPage("follow")}
                  />
                )}

                {page === "search" && (
                  <Search jobs={SEARCH_JOBS} favs={favs} onAddFav={addFav} />
                )}

                {page === "favorites" && (
                  <Favorites jobs={favJobs} onRemoveFav={removeFav} />
                )}

                {page === "follow" && <Follow />}

                {page === "settings" && (
                  <Settings
                    onResetFavs={() => {
                      localStorage.removeItem("favs");
                      setFavs(new Set());
                    }}
                  />
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Home({ query, setQuery, onSearch, onFollow }) {
  return (
    <div className="relative grid h-full min-h-[520px] place-items-center">
      <div className="w-full max-w-lg space-y-5 text-center md:-translate-x-[120px]">
        <div className="card">
          <div className="card-body">
            <div className="title">Recherche un stage</div>
            <div className="muted mt-1">Résultats fixes, site démo</div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md space-y-4">
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Ex : développeur web, react…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />

          <button className="btn btn-primary w-full" onClick={onSearch}>
            Rechercher
          </button>
        </div>
      </div>

      <button className="btn absolute bottom-0 right-0" onClick={onFollow}>
        Suivi →
      </button>
    </div>
  );
}

function Search({ jobs, favs, onAddFav }) {
  return (
    <section className="space-y-4">
      <div className="card">
        <div className="card-body flex items-center justify-between">
          <div>
            <div className="title">Stages recommandés</div>
            <div className="muted mt-1">3 offres affichées</div>
          </div>
          <span className="badge">{jobs.length}</span>
        </div>
      </div>

      <ul className="space-y-3">
        {jobs.map((job) => {
          const saved = favs.has(job.id);
          return (
            <li key={job.id} className="card">
              <div className="card-body flex items-start justify-between gap-3">
                <div>
                  <div className="title">{job.title}</div>
                  <div className="muted mt-1">
                    {job.company} — {job.city}
                  </div>
                  {job.company === "Ynov" && (
                    <div className="badge mt-2">Partenaire Ynov</div>
                  )}
                </div>

                <button
                  className={`btn ${saved ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={saved}
                  onClick={() => onAddFav(job.id)}
                >
                  {saved ? "Enregistré" : "Enregistrer"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Favorites({ jobs, onRemoveFav }) {
  return (
    <section className="space-y-4">
      <div className="card">
        <div className="card-body flex items-center justify-between">
          <div>
            <div className="title">Favoris</div>
            <div className="muted mt-1">Suppression uniquement ici</div>
          </div>
          <span className="badge">{jobs.length}</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="card-body muted">Aucun favori.</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li key={job.id} className="card">
              <div className="card-body flex items-start justify-between gap-3">
                <div>
                  <div className="title">{job.title}</div>
                  <div className="muted mt-1">
                    {job.company} — {job.city}
                  </div>
                </div>
                <button className="btn" onClick={() => onRemoveFav(job.id)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Follow() {
  return (
    <section className="space-y-4">
      <div className="card">
        <div className="card-body">
          <div className="title">Suivi</div>
          <div className="muted mt-1">Vue synthétique</div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Candidatures" value="12" />
        <Stat label="Entretiens" value="3" />
        <Stat label="Réponses" value="4" />
      </div>
    </section>
  );
}

function Settings({ onResetFavs }) {
  return (
    <section className="space-y-4">
      <div className="card">
        <div className="card-body">
          <div className="title">Paramètres</div>
        </div>
      </div>

      <button className="btn" onClick={onResetFavs}>
        Réinitialiser les favoris
      </button>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="card-body text-center">
        <div className="muted">{label}</div>
        <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function SideBtn({ active = false, disabled = false, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        "sidebtn",
        active ? "sidebtn-active" : "",
        disabled ? "sidebtn-disabled" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function label(page) {
  if (page === "home") return "Accueil";
  if (page === "search") return "Recherche";
  if (page === "favorites") return "Favoris";
  if (page === "follow") return "Suivi";
  return "Paramètres";
}
