import Link from 'next/link';

const blocks = [
['Comprendre ses réactions','Reconnaître émotions, interprétations et impulsions afin de choisir une réponse plus efficace.'],
['Communiquer efficacement','Exprimer une demande, clarifier une situation, poser une limite et maintenir une communication professionnelle.'],
['Désamorcer les situations difficiles',"Faire face à l’insatisfaction, à la colère et aux interactions tendues sans alimenter inutilement la confrontation."],
['Le service client est aussi le service employé',"Comprendre comment les interactions internes influencent directement l’expérience offerte à la clientèle."],
['Nous sommes aussi des clients',"Observer nos propres attentes et comportements lorsque nous sommes clients afin de mieux comprendre les deux côtés de l’interaction."],
['Validation et écoute active',"Comprendre et reconnaître ce que vit l’autre sans nécessairement être d’accord avec lui."],
['Garder son efficacité sous pression',"Utiliser des outils de régulation émotionnelle et de tolérance à la détresse pour rester efficace dans une interaction intense."],
['Limites, respect et affirmation de soi',"Être serviable sans tout accepter et préserver à la fois la relation, ses limites et son respect de soi."],
["L’expérience client de A à Z","Observer les points de contact et repérer les irritants qui influencent l’expérience globale du client."],
['Gestionnaires : soutenir ceux qui servent',"Outiller les responsables pour mieux communiquer, soutenir leurs équipes et intervenir lors de situations difficiles."],
];

export default function TrainingsPage(){return <main className="editorShell"><header className="editorTop"><div><Link className="brand" href="/">ÉV<span>OO</span>T!</Link><span className="crumb"> / Évolution PME / Formations</span></div><Link className="secondary" href="/dashboard">Tableau de bord</Link></header><section className="editorHero"><div className="eyebrow">PORTAIL ENTREPRISE · ÉVOLUTION PME</div><h1>Construire les formations.</h1><p>Crée le scénario complet, ajoute les contenus et prépare les interactions Live ou autonomes.</p><button className="primary">+ Nouvelle formation</button></section><section className="catalogue"><Link href="/dashboard/trainings/decouvrir-evoot" className="blockCard"><div className="blockIndex">★</div><div><small>FORMATION DÉMO · ÉVOOT</small><h2>Découvrir ÉVOOT!</h2><p>Une formation de démonstration pour tester le constructeur, les blocs, le Live et les futurs parcours autonomes.</p></div><div className="blockAction">Ouvrir la démo →</div></Link>{blocks.map((b,i)=><Link href={i===0?'/dashboard/trainings/comprendre-ses-reactions':'#'} className="blockCard" key={b[0]}><div className="blockIndex">{String(i+1).padStart(2,'0')}</div><div><small>BLOC ÉVOLUTION PME</small><h2>{b[0]}</h2><p>{b[1]}</p></div><div className="blockAction">{i===0?'Ouvrir l’éditeur →':'Préparer →'}</div></Link>)}</section></main>}
