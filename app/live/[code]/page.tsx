'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function LiveLobbyPage() {
  const params = useParams<{code:string}>();
  const code = String(params.code || '');
  const [started, setStarted] = useState(false);

  return <main className="liveHostPage">
    <header className="liveHostTop"><Link className="brand" href="/dashboard">ÉV<span>OO</span>T!</Link><span className="liveBadge">● LIVE</span></header>
    <section className="liveHostHero">
      <div className="eyebrow">COMPRENDRE SES RÉACTIONS</div>
      {!started ? <>
        <h1>Code de séance</h1>
        <div className="sessionCode">{code}</div>
        <p>Les participants vont sur ÉVOOT, entrent ce code, leur nom et leur poste.</p>
        <div className="joinAddress">evoot.dadou195.workers.dev</div>
        <section className="participantLobby"><div><small>PARTICIPANTS</small><strong>0</strong></div><p>En attente des participants…</p></section>
        <button className="primary liveLaunch" onClick={()=>setStarted(true)}>Commencer la formation →</button>
      </> : <>
        <div className="questionProgress">QUESTION 1 · TON RÉFLEXE</div>
        <h1>Un client arrive très fâché. Ton premier réflexe?</h1>
        <div className="hostAnswers"><div>Lancer mon café au client</div><div>Aller pleurer dans le backstore</div><div>Lui expliquer immédiatement pourquoi il a tort</div><div>Prendre une pause et écouter activement</div></div>
        <div className="hostControls"><button className="secondary">Afficher les résultats</button><button className="primary">Discussion →</button></div>
      </>}
    </section>
  </main>;
}
