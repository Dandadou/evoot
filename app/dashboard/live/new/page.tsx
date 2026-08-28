'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewLiveSessionPage() {
  const router = useRouter();
  const [training, setTraining] = useState('comprendre-ses-reactions');

  function createSession() {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    router.push(`/live/${code}?training=${training}`);
  }

  return <main className="liveSetupPage">
    <header className="liveSetupTop">
      <Link className="brand" href="/dashboard">ÉV<span>OO</span>T!</Link>
      <Link className="ghost" href="/dashboard">← Tableau de bord</Link>
    </header>
    <section className="liveSetupCard">
      <div className="eyebrow">NOUVELLE SÉANCE LIVE</div>
      <h1>Prêt à faire participer le monde?</h1>
      <p>Choisis la formation. ÉVOOT crée ensuite un code à 6 chiffres que les participants utilisent sur leur téléphone.</p>
      <label>Formation
        <select value={training} onChange={e=>setTraining(e.target.value)}>
          <option value="comprendre-ses-reactions">Comprendre ses réactions</option>
        </select>
      </label>
      <button className="primary liveLaunch" onClick={createSession}>Créer la séance live →</button>
    </section>
  </main>;
}
