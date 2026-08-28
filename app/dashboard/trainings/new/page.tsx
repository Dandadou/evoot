import Link from 'next/link';
import TrainingBuilder from './TrainingBuilder';
export default function NewTrainingPage(){return <main className="builderPage"><header className="builderHeader"><div><Link className="brand" href="/">ÉV<span>OO</span>T!</Link><span className="crumb"> / Évolution PME / Éditeur</span></div><Link className="ghost" href="/dashboard/trainings">← Formations</Link></header><TrainingBuilder/></main>}
