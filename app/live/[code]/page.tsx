'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Participant={id:number;name:string;job_title:string|null};
export default function LiveLobbyPage(){
 const params=useParams<{code:string}>();const code=String(params.code||'');const [state,setState]=useState('LOBBY');const [participants,setParticipants]=useState<Participant[]>([]);const [error,setError]=useState('');
 useEffect(()=>{if(!code)return;const poll=async()=>{try{const r=await fetch(`/api/sessions/${code}`,{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error);setState(d.session.state);setParticipants(d.participants||[]);setError('');}catch(err){setError(err instanceof Error?err.message:'Erreur de connexion.');}};poll();const id=setInterval(poll,1500);return()=>clearInterval(id);},[code]);
 async function start(){const r=await fetch(`/api/sessions/${code}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:'QUESTION',currentQuestion:0})});if(r.ok)setState('QUESTION');}
 return <main className="liveHostPage"><header className="liveHostTop"><Link className="brand" href="/dashboard">ÉV<span>OO</span>T!</Link><span className="liveBadge">● LIVE</span></header><section className="liveHostHero"><div className="eyebrow">COMPRENDRE SES RÉACTIONS</div>{error&&<p>{error}</p>}{state==='LOBBY'?<><h1>Code de séance</h1><div className="sessionCode">{code}</div><p>Les participants vont sur ÉVOOT, entrent ce code, leur nom et leur poste.</p><div className="joinAddress">evoot.dadou195.workers.dev/join?code={code}</div><section className="participantLobby"><div><small>PARTICIPANTS</small><strong>{participants.length}</strong></div><div className="participantNames">{participants.length?participants.map(p=><span key={p.id}>{p.name}{p.job_title?` · ${p.job_title}`:''}</span>):<p>En attente des participants…</p>}</div></section><button className="primary liveLaunch" disabled={!participants.length} onClick={start}>Commencer la formation →</button></>:<><div className="questionProgress">QUESTION 1 · TON RÉFLEXE</div><h1>Un client arrive très fâché. Ton premier réflexe?</h1><div className="hostAnswers"><div>Lancer mon café au client</div><div>Aller pleurer dans le backstore</div><div>Lui expliquer immédiatement pourquoi il a tort</div><div>Prendre une pause et écouter activement</div></div><div className="hostControls"><button className="secondary">Afficher les résultats</button><button className="primary">Discussion →</button></div></>}</section></main>;
}
