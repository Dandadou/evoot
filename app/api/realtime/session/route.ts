import {NextResponse} from 'next/server';

const REALTIME_BASE='https://rtc.live.cloudflare.com/v1';

export async function POST(){
  try{
    const appId=process.env.EVOOFI_REALTIME_APP_ID;
    const appSecret=process.env.EVOOFI_REALTIME_APP_SECRET;
    if(!appId||!appSecret){
      return NextResponse.json({error:'Cloudflare Realtime is not configured.'},{status:503});
    }

    const response=await fetch(`${REALTIME_BASE}/apps/${encodeURIComponent(appId)}/sessions/new`,{
      method:'POST',
      headers:{Authorization:`Bearer ${appSecret}`,'Content-Type':'application/json'},
      body:JSON.stringify({}),
      cache:'no-store'
    });

    const payload:any=await response.json().catch(()=>({}));
    if(!response.ok){
      console.error('Cloudflare Realtime session creation failed',response.status,payload);
      return NextResponse.json({error:'Unable to open the realtime media connection.'},{status:502});
    }

    // Only return the ephemeral Realtime session identifier. The App Secret
    // never leaves the server and must never be exposed to the browser.
    return NextResponse.json({sessionId:payload.sessionId||payload.session_id||payload.id||null});
  }catch(error){
    console.error('Cloudflare Realtime session error',error);
    return NextResponse.json({error:'Unable to open the realtime media connection.'},{status:500});
  }
}
