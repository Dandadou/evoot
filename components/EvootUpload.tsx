'use client';
import {useRef,useState} from 'react';

type Props={purpose:string;organizationId?:string;accept?:string;label?:string;onUploaded:(upload:{id:string;url:string;name:string;mimeType:string;size:number;purpose:string})=>void};
export default function EvootUpload({purpose,organizationId,accept,label='Téléverser un fichier',onUploaded}:Props){
 const input=useRef<HTMLInputElement>(null);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function choose(file?:File){if(!file)return;setBusy(true);setMessage('');const body=new FormData();body.append('file',file);body.append('purpose',purpose);if(organizationId)body.append('organizationId',organizationId);const r=await fetch('/api/uploads',{method:'POST',body});const v=await r.json();setBusy(false);if(!r.ok){setMessage(v.error||'Téléversement impossible');return}onUploaded(v.upload);setMessage(`${file.name} téléversé`);}
 return <div><input ref={input} type="file" accept={accept} hidden onChange={e=>choose(e.target.files?.[0])}/><button type="button" className="portalButton" disabled={busy} onClick={()=>input.current?.click()}>{busy?'Téléversement…':label}</button>{message&&<small style={{display:'block',marginTop:8}}>{message}</small>}</div>;
}
