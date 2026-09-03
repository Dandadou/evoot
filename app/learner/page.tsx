import Link from 'next/link';
import '../portals.css';

export default function Page(){
  return <main className="portal"><div className="portalShell">
    <div className="portalBrand">ÉV<span>OO</span>T!</div>
    <div className="portalRole">Portail apprenant</div>
    <h1>Mon apprentissage</h1>
    <p className="portalLead">Tout ce qu’il faut pour apprendre, participer et reprendre une formation au même endroit.</p>

    <section style={{margin:'28px 0',padding:'24px',border:'1px solid #2b2b2b',borderRadius:18,background:'#111'}}>
      <span className="portalTag">CLASSE VIRTUELLE</span>
      <h2 style={{margin:'12px 0 8px'}}>Rejoindre une séance en direct</h2>
      <p style={{opacity:.78,marginBottom:18}}>Entre le code donné par ton formateur. Caméra, micro et activités EVOOT seront disponibles dans la séance.</p>
      <Link href="/join" style={{display:'inline-block',background:'#F7941D',color:'#111',fontWeight:800,padding:'13px 20px',borderRadius:10,textDecoration:'none'}}>Rejoindre avec un code →</Link>
    </section>

    <div className="portalGrid">
      <Card href="/join" t="Prochains cours" d="Accéder rapidement à une classe virtuelle ou à une séance programmée."/>
      <Card t="En cours" d="Reprendre une formation autonome exactement là où tu l’as laissée."/>
      <Card t="Mes formations" d="Retrouver toutes les formations auxquelles tu es inscrit."/>
      <Card t="Manuels interactifs" d="Consulter les PDF et futurs flipbooks interactifs liés à tes formations."/>
      <Card t="Mes ressources" d="Documents, vidéos et fichiers partagés par les formateurs."/>
      <Card t="Ma progression" d="Voir les formations terminées, la progression et les futures attestations."/>
    </div>
  </div></main>
}

function Card({t,d,href}:{t:string,d:string,href?:string}){
  const content=<><span className="portalTag">APPRENANT</span><strong>{t}</strong><p>{d}</p></>;
  return href?<Link className="portalCard" href={href}>{content}</Link>:<div className="portalCard">{content}</div>;
}
