'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewLiveSessionPage() {
  const router = useRouter();
  const [training, setTraining] = useState('comprendre-ses-reactions');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('training');
    if (requested === 'decouvrir-evoot') setTraining('decouvrir-evoot');
  }, []);

  async function createSession() {
    setCreating(true); setError('');
    try {
      const response = await fetch('/api/sessions', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ trainingSlug: training }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur');
      router.push(`/live/${data.code}`);
    } catch {
      setError('Impossible de créer la séance. Réessaie dans un instant.');
      setCreating(false);
    }
  }

  return <main className="liveSetupPage">
    <header className="liveSetupTop"><Link className="brand" href="/dashboard">ÉV<span>OO</span>T!</Link><Link className="ghost" href="/dashboard">← Tableau de bord</Link></header>
    <section className="liveSetupCard">
      <div className="eyebrow">NOUVELLE SÉANCE LIVE</div><h1>Prêt à faire participer le monde?</h1>
      <p>Choisis la formation. ÉVOOT crée ensuite un vrai code à 6 chiffres enregistré dans la séance.</p>
      <label>Formation<select value={training} onChange={e=>setTraining(e.target.value)}><option value="decouvrir-evoot">Découvrir ÉVOOT!</option><option value="comprendre-ses-reactions">Comprendre ses réactions</option></select></label>
      {error && <p>{error}</p>}
      <button className="primary liveLaunch" disabled={creating} onClick={createSession}>{creating ? 'Création…' : 'Créer la séance live →'}</button>
    </section>
  </main>;
}
