import {NextResponse} from 'next/server';

const REALTIME_BASE='https://rtc.live.cloudflare.com/v1';

type RealtimeTrack={location:'local'|'remote';mid?:string;trackName?:string;sessionId?:string};

export async function POST(req:Request){
 try{
  const appId=process.env.EVOOFI_REALTIME_APP_ID?.trim(),appSecret=process.env.EVOOFI_REALTIME_APP_SECRET?.trim();
  if(!appId||!appSecret)return NextResponse.json({error:'Cloudflare Realtime is not configured.'},{status:503});
  const body=await req.json() as {sessionId?:string;sdp?:string;tracks?:RealtimeTrack[]};
  if(!body.sessionId||!body.tracks?.length)return NextResponse.json({error:'sessionId and tracks are required.'},{status:400});

  const cloudflareBody:{tracks:RealtimeTrack[];sessionDescription?:{type:'offer';sdp:string}}={tracks:body.tracks};
  if(body.sdp)cloudflareBody.sessionDescription={type:'offer',sdp:body.sdp};

  const response=await fetch(`${REALTIME_BASE}/apps/${encodeURIComponent(appId)}/sessions/${encodeURIComponent(body.sessionId)}/tracks/new`,{
   method:'POST',
   headers:{Authorization:`Bearer ${appSecret}`,'Content-Type':'application/json'},
   body:JSON.stringify(cloudflareBody),
   cache:'no-store'
  });
  const payload:any=await response.json().catch(()=>({}));
  if(!response.ok){
   console.error('Cloudflare Realtime track negotiation failed',response.status,payload);
   const detail=payload?.errorDescription||payload?.error||payload?.message||payload?.errors?.[0]?.message;
   return NextResponse.json({error:'Unable to negotiate realtime media.',...(detail?{detail:String(detail)}:{})},{status:502});
  }
  return NextResponse.json(payload);
 }catch(error){
  console.error('Cloudflare Realtime tracks error',error);
  return NextResponse.json({error:'Unable to negotiate realtime media.'},{status:500});
 }
}
