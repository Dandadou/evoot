'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Training={slug:string;title:string;status:string};

export default function NewLiveSessionPage() {
  const router = useRouter();
  const [training, setTraining] = useState('');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('training');
    fetch('/api/trainings',{cache:'no-store'})
      .then(r=>r.json())
      .then(data=>{
        const list:Training[]=data.trainings||[];
        setTrainings(list);
        if(requested && list.some(t=>t.slug===requested)) setTraining(requested);
        else if(list.length) setTraining(list[0].slug);
      })
      .catch(()=>setError('Impossible de charger les formations.'))
      .finally(()=>setLoading(false));
  }, []);

  async function createSession() {
    if(!training)return;
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
      <label>Formation<select value={training} disabled={loading||!trainings.length} onChange={e=>setTraining(e.target.value)}>{loading?<option>Chargement…</option>:trainings.length?trainings.map(t=><option key={t.slug} value={t.slug}>{t.title}{t.status==='DRAFT'?' — Brouillon':''}</option>):<option value="">Aucune formation disponible</option>}</select></label>
      {error && <p>{error}</p>}
      <button className="primary liveLaunch" disabled={creating||loading||!training} onClick={createSession}>{creating ? 'Création…' : 'Créer la séance live →'}</button>
    </section>
  </main>;
}
