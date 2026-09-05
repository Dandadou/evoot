'use client';
import Link from 'next/link';
import {useEffect,useState,type CSSProperties} from 'react';
import '../portals.css';

type Organization={id:string;name:string;logoUrl:string|null;primaryColor:string|null;secondaryColor:string|null};
type Enrollment={id:number;trainingTitle:string;status:string;progressPercent:number;completedAt:string|null};
type Session={id:number;title:string|null;trainingTitle:string;deliveryMode:string;status:string;startsAt:string|null};
type Resource={id:number;title:string;mimeType:string|null};
type Overview={organization:Organization;enrollments:Enrollment[];sessions:Session[];resources:Resource[]};
type BrandStyle=CSSProperties&{'--client-primary'?:string;'--client-secondary'?:string};

export default function Page(){
 const[data,setData]=useState<Overview|null>(null);const[error,setError]=useState('');
 useEffect(()=>{fetch('/api/learner/overview').then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Erreur');return d}).then(setData).catch(e=>setError(e.message))},[]);
 const brand:BrandStyle={'--client-primary':data?.organization.primaryColor||'#F7941D','--client-secondary':data?.organization.secondaryColor||data?.organization.primaryColor||'#F7941D'};
 const active=data?.enrollments.filter(e=>!e.completedAt)??[];const completed=data?.enrollments.filter(e=>!!e.completedAt)??[];
 return <main className="portal clientBrandedPortal" style={brand}><div className="portalShell">
  <div className="portalTop"><div><div className="portalBrand">ÉV<span>OO</span>T!</div><div className="portalRole">Portail apprenant</div></div><div style={{display:'flex',alignItems:'center',gap:12}}>{data?.organization.logoUrl&&<img src={data.organization.logoUrl} alt={data.organization.name} style={{width:48,height:48,objectFit:'contain',borderRadius:10,background:'#fff',padding:4}}/>}<strong>{data?.organization.name||'Votre organisation'}</strong></div></div>
  <h1>Mon apprentissage</h1><p className="portalLead">Tes cours, formations et ressources, uniquement dans ton organisation.</p>
  {error&&<div className="agendaConflict"><strong>Erreur</strong><span>{error}</span></div>}
  <section style={{margin:'28px 0',padding:'24px',border:'1px solid #2b2b2b',borderRadius:18,background:'#111'}}><span className="portalTag">CLASSE VIRTUELLE</span><h2 style={{margin:'12px 0 8px'}}>Rejoindre une séance en direct</h2><p style={{opacity:.78,marginBottom:18}}>Entre le code donné par ton formateur.</p><Link href="/join" className="portalAction" style={{display:'inline-block',textDecoration:'none'}}>Rejoindre avec un code →</Link></section>
  <div className="portalStats"><Stat n={active.length} l="En cours"/><Stat n={data?.sessions.length} l="Séances"/><Stat n={data?.resources.length} l="Ressources"/><Stat n={completed.length} l="Terminées"/></div>
  <div className="portalGrid"><Card href="/join" t="Prochains cours" d={data?.sessions.length?`${data.sessions.length} séance(s) disponible(s).`:'Aucune séance planifiée.'}/><Card t="En cours" d={active.length?`${active.length} formation(s) à poursuivre.`:'Aucune formation en cours.'}/><Card t="Mes formations" d={data?.enrollments.length?`${data.enrollments.length} inscription(s).`:'Aucune formation attribuée.'}/><Card t="Mes ressources" d={data?.resources.length?`${data.resources.length} ressource(s) disponible(s).`:'Aucune ressource partagée.'}/><Card t="Ma progression" d={completed.length?`${completed.length} formation(s) terminée(s).`:'Ta progression apparaîtra ici.'}/></div>
 </div></main>
}
function Stat({n,l}:{n:number|undefined,l:string}){return <div className="portalStat"><strong>{n??'—'}</strong><span>{l}</span></div>}
function Card({t,d,href}:{t:string,d:string,href?:string}){const content=<><span className="portalTag">APPRENANT</span><strong>{t}</strong><p>{d}</p></>;return href?<Link className="portalCard" href={href}>{content}</Link>:<div className="portalCard">{content}</div>}
