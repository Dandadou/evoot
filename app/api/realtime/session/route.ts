import {NextResponse} from 'next/server';

const REALTIME_BASE='https://rtc.live.cloudflare.com/v1';

export async function POST(){
  try{
    const appId=process.env.EVOOFI_REALTIME_APP_ID?.trim();
    const appSecret=process.env.EVOOFI_REALTIME_APP_SECRET?.trim();
    if(!appId||!appSecret){
      return NextResponse.json({error:'Cloudflare Realtime is not configured.',detail:`missing:${!appId?' APP_ID':''}${!appSecret?' APP_SECRET':''}`.trim()},{status:503});
    }

    // Cloudflare's current Realtime SFU echo example creates an empty
    // PeerConnection session with POST /sessions/new and NO request body.
    // SDP is negotiated afterwards when local tracks are published.
    const response=await fetch(`${REALTIME_BASE}/apps/${encodeURIComponent(appId)}/sessions/new`,{
      method:'POST',
      headers:{Authorization:`Bearer ${appSecret}`},
      cache:'no-store'
    });

    const text=await response.text();
    let payload:any={};
    try{payload=text?JSON.parse(text):{}}catch{payload={message:text.slice(0,500)}}
    if(!response.ok){
      console.error('Cloudflare Realtime session creation failed',response.status,payload);
      const cloudflareMessage=payload?.errorDescription||payload?.error_description||payload?.error||payload?.message||payload?.errors?.[0]?.message||'Cloudflare rejected the request.';
      return NextResponse.json({error:'Unable to open the realtime media connection.',detail:`Cloudflare ${response.status}: ${String(cloudflareMessage)}`},{status:502});
    }

    const sessionId=payload.sessionId||payload.session_id||payload.id;
    if(!sessionId)return NextResponse.json({error:'Cloudflare created a session but returned no session ID.',detail:'Unexpected Realtime API response.'},{status:502});
    return NextResponse.json({sessionId});
  }catch(error:any){
    console.error('Cloudflare Realtime session error',error);
    return NextResponse.json({error:'Unable to open the realtime media connection.',detail:error?.message||'Server fetch failed.'},{status:500});
  }
}
