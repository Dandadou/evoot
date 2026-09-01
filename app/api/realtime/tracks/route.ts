import {NextResponse} from 'next/server';

const REALTIME_BASE='https://rtc.live.cloudflare.com/v1';

export async function POST(req:Request){
 try{
  const appId=process.env.EVOOFI_REALTIME_APP_ID?.trim(),appSecret=process.env.EVOOFI_REALTIME_APP_SECRET?.trim();
  if(!appId||!appSecret)return NextResponse.json({error:'Cloudflare Realtime is not configured.'},{status:503});
  const body=await req.json() as {sessionId?:string;sdp?:string;tracks?:Array<{location:'local'|'remote';mid?:string;trackName?:string;sessionId?:string}>};
  if(!body.sessionId||!body.sdp||!body.tracks?.length)return NextResponse.json({error:'sessionId, sdp and tracks are required.'},{status:400});
  const response=await fetch(`${REALTIME_BASE}/apps/${encodeURIComponent(appId)}/sessions/${encodeURIComponent(body.sessionId)}/tracks/new`,{method:'POST',headers:{Authorization:`Bearer ${appSecret}`,'Content-Type':'application/json'},body:JSON.stringify({sessionDescription:{type:'offer',sdp:body.sdp},tracks:body.tracks}),cache:'no-store'});
  const payload:any=await response.json().catch(()=>({}));
  if(!response.ok){console.error('Cloudflare Realtime track negotiation failed',response.status,payload);return NextResponse.json({error:'Unable to publish realtime media.'},{status:502})}
  return NextResponse.json(payload);
 }catch(error){console.error('Cloudflare Realtime tracks error',error);return NextResponse.json({error:'Unable to publish realtime media.'},{status:500})}
}
