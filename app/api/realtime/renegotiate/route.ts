import {NextResponse} from 'next/server';

const REALTIME_BASE='https://rtc.live.cloudflare.com/v1';

export async function PUT(req:Request){
  try{
    const appId=process.env.EVOOFI_REALTIME_APP_ID?.trim();
    const appSecret=process.env.EVOOFI_REALTIME_APP_SECRET?.trim();
    if(!appId||!appSecret)return NextResponse.json({error:'Cloudflare Realtime is not configured.'},{status:503});
    const body=await req.json() as {sessionId?:string;sdp?:string};
    if(!body.sessionId||!body.sdp)return NextResponse.json({error:'sessionId and sdp are required.'},{status:400});
    const response=await fetch(`${REALTIME_BASE}/apps/${encodeURIComponent(appId)}/sessions/${encodeURIComponent(body.sessionId)}/renegotiate`,{
      method:'PUT',
      headers:{Authorization:`Bearer ${appSecret}`,'Content-Type':'application/json'},
      body:JSON.stringify({sessionDescription:{type:'answer',sdp:body.sdp}}),
      cache:'no-store'
    });
    const text=await response.text();
    let payload:any={};try{payload=text?JSON.parse(text):{}}catch{payload={message:text.slice(0,500)}}
    if(!response.ok){const detail=payload?.errorDescription||payload?.error_description||payload?.error||payload?.message||'Cloudflare rejected renegotiation.';return NextResponse.json({error:'Unable to renegotiate realtime media.',detail:`Cloudflare ${response.status}: ${String(detail)}`},{status:502})}
    return NextResponse.json(payload);
  }catch(error:any){return NextResponse.json({error:'Unable to renegotiate realtime media.',detail:error?.message||'Server error.'},{status:500})}
}
