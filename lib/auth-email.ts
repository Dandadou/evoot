const RESEND_ENDPOINT='https://api.resend.com/emails';

function escapeHtml(value:string){
  return value.replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]||char));
}

export async function sendLoginEmail(input:{email:string;token:string;origin:string}){
  const apiKey=process.env.RESEND_API_KEY?.trim();
  if(!apiKey)throw new Error('RESEND_NOT_CONFIGURED');

  const configuredOrigin=process.env.EVOOT_APP_URL?.trim();
  const appOrigin=(configuredOrigin||input.origin).replace(/\/$/,'');
  const callbackUrl=`${appOrigin}/api/auth/login/callback?token=${encodeURIComponent(input.token)}`;
  const from=process.env.EVOOT_EMAIL_FROM?.trim()||'EVOOT! <connexion@evoot.evolutionpme.ca>';

  const response=await fetch(RESEND_ENDPOINT,{
    method:'POST',
    headers:{
      Authorization:`Bearer ${apiKey}`,
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      from,
      to:[input.email],
      subject:'Ton lien de connexion EVOOT!',
      html:`<div style="font-family:Arial,sans-serif;background:#0b0b0b;color:#fff;padding:32px;border-radius:16px;max-width:560px"><div style="font-size:28px;font-weight:800;margin-bottom:18px">EVOOT<span style="color:#F7941D">!</span></div><p style="font-size:16px;line-height:1.6">Voici ton lien sécurisé pour te connecter à EVOOT!. Il est valide pendant 15 minutes et ne peut être utilisé qu'une seule fois.</p><p style="margin:28px 0"><a href="${escapeHtml(callbackUrl)}" style="display:inline-block;background:#F7941D;color:#111;text-decoration:none;font-weight:800;padding:14px 22px;border-radius:10px">Me connecter à EVOOT!</a></p><p style="font-size:13px;color:#aaa;line-height:1.5">Si tu n'as pas demandé ce lien, tu peux simplement ignorer ce courriel.</p></div>`
    }),
    cache:'no-store'
  });

  if(!response.ok){
    const detail=await response.text();
    console.error('Resend login email failed',response.status,detail.slice(0,500));
    throw new Error('EMAIL_DELIVERY_FAILED');
  }
}
