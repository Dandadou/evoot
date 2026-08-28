import Link from 'next/link';
import { currentOrganization, currentUser, liveSessions, trainings } from '@/lib/demo-data';

export default function DashboardPage() {
  return (
    <main className="dashboardShell">
      <aside className="sidebar">
        <Link className="brand" href="/">ÉV<span>OO</span>T!</Link>
        <div className="orgBadge">
          <small>ORGANISATION</small>
          <strong>{currentOrganization.name}</strong>
          <span>Propriétaire</span>
        </div>
        <nav className="sideNav">
          <a className="active" href="#overview">Vue d’ensemble</a>
          <a href="#trainings">Formations</a>
          <a href="#live">Séances live</a>
          <a href="#team">Équipe</a>
          <a href="#settings">Personnalisation</a>
        </nav>
        <div className="userCard"><span>{currentUser.displayName}</span><small>{currentUser.email}</small></div>
      </aside>

      <section className="dashboardMain" id="overview">
        <header className="dashboardHeader">
          <div><div className="eyebrow">TABLEAU DE BORD</div><h1>{currentOrganization.name}</h1><p>Gère tes formations et démarre une expérience ÉVOOT en direct.</p></div>
          <button className="primary">+ Nouvelle séance live</button>
        </header>

        <div className="statsGrid">
          <article><span>Formations</span><strong>{trainings.length}</strong><small>dans cette organisation</small></article>
          <article><span>Séances actives</span><strong>{liveSessions.length}</strong><small>en ce moment</small></article>
          <article><span>Participants</span><strong>0</strong><small>aujourd’hui</small></article>
        </div>

        <section className="panel" id="trainings">
          <div className="panelHead"><div><div className="eyebrow">CONTENU</div><h2>Mes formations</h2></div><button className="secondary">+ Créer une formation</button></div>
          <div className="trainingGrid">
            {trainings.map((training) => (
              <article className="trainingCard" key={training.id}>
                <div className="trainingNumber">01</div>
                <div><small>FORMATION PILOTE</small><h3>{training.title}</h3><p>{training.description}</p></div>
                <div className="trainingFooter"><span>{training.blockCount} bloc</span><button className="ghost">Ouvrir →</button></div>
              </article>
            ))}
            <button className="newTrainingCard"><strong>+</strong><span>Nouvelle formation</span><small>Crée le contenu propre à cette organisation.</small></button>
          </div>
        </section>

        <section className="panel" id="live">
          <div className="panelHead"><div><div className="eyebrow">DIRECT</div><h2>Séances live</h2></div></div>
          <div className="emptyState"><strong>Aucune séance active.</strong><p>Choisis une formation et lance une séance. ÉVOOT générera un code participant à 6 chiffres.</p><button className="primary">Créer une séance live</button></div>
        </section>
      </section>
    </main>
  );
}
