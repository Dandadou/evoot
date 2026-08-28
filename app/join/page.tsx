'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

export default function JoinPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('code') || '';
    setCode(value.replace(/\D/g, '').slice(0, 6));
  }, []);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (code.length === 6 && name.trim() && jobTitle.trim()) setJoined(true);
  }

  if (joined) {
    return <main className="participantPage">
      <section className="participantCard">
        <div className="brand">ÉV<span>OO</span>T!</div>
        <div className="eyebrow">SÉANCE {code}</div>
        <h1>Tu es connecté.</h1>
        <p><strong>{name}</strong> · {jobTitle}</p>
        <div className="waitingPulse">En attente du formateur…</div>
        <p className="participantHint">La prochaine question apparaîtra ici automatiquement.</p>
      </section>
      <footer>Propulsé par ÉVOOT — Évolution PME, créateur de marques.</footer>
    </main>;
  }

  return <main className="participantPage">
    <section className="participantCard">
      <Link className="brand" href="/">ÉV<span>OO</span>T!</Link>
      <div className="eyebrow">REJOINDRE UNE FORMATION</div>
      <h1>Entre dans la séance.</h1>
      <p>Pas de compte. Ton nom, ton poste, pis c’est parti.</p>
      <form className="participantForm" onSubmit={submit}>
        <label>Code de séance<input inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}/></label>
        <label>Nom<input autoComplete="name" placeholder="Ton nom" value={name} onChange={e=>setName(e.target.value)}/></label>
        <label>Titre du poste<input placeholder="Ex. Hygiéniste dentaire" value={jobTitle} onChange={e=>setJobTitle(e.target.value)}/></label>
        <button className="primary" disabled={code.length!==6 || !name.trim() || !jobTitle.trim()}>Rejoindre</button>
      </form>
    </section>
    <footer>Propulsé par ÉVOOT — Évolution PME, créateur de marques.</footer>
  </main>;
}
