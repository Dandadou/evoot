'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function NewTrainingPage(){
 const router=useRouter();const started=useRef(false);const[error,setError]=useState('');
 useEffect(()=>{if(started.current)return;started.current=true;(async()=>{try{const r=await fetch('/api/trainings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'Nouvelle formation'})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Impossible de créer la formation.');router.replace(`/dashboard/trainings/${d.slug}`)}catch(e){setError(e instanceof Error?e.message:'Impossible de créer la formation.')}})()},[router]);
 return <main className="scenarioEditor" style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#080808',color:'#fff'}}><div style={{textAlign:'center'}}><div style={{color:'#F7941D',fontWeight:900,letterSpacing:2,fontSize:12}}>ÉVOOT</div><h1>{error?'Création impossible':'Création de ta formation…'}</h1>{error&&<p>{error}</p>}</div></main>
}
