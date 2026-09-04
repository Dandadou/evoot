import {randomUUID} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {getAuthContext} from '@/lib/auth';
import {getDB,getUploadsBucket} from '@/lib/db';

const PURPOSES=new Set(['ORGANIZATION_LOGO','TRAINING_IMAGE','TRAINING_VIDEO','TRAINING_DOCUMENT','PRESENTATION','INTERACTIVE_BOOK','LEARNER_SUBMISSION','RESOURCE','AVATAR','OTHER']);
const MAX_BYTES=50*1024*1024;
const safeName=(name:string)=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(-120)||'file';

export async function POST(request:NextRequest){
 try{
  const auth=await getAuthContext();if(!auth)return NextResponse.json({error:'Non autorisé'},{status:401});
  const form=await request.formData();const file=form.get('file');const purpose=String(form.get('purpose')||'OTHER');const requestedOrg=String(form.get('organizationId')||'').trim()||null;
  if(!(file instanceof File)||file.size===0)return NextResponse.json({error:'Fichier requis'},{status:400});
  if(file.size>MAX_BYTES)return NextResponse.json({error:'Fichier trop volumineux (50 Mo maximum pour cet upload)'},{status:413});
  if(!PURPOSES.has(purpose))return NextResponse.json({error:'Type d’upload invalide'},{status:400});
  const organizationId=auth.isEvootAdmin?requestedOrg:(auth.organizationId||null);
  if(!auth.isEvootAdmin&&requestedOrg&&requestedOrg!==auth.organizationId)return NextResponse.json({error:'Organisation non autorisée'},{status:403});
  const id=randomUUID();const key=`${organizationId||'platform'}/${purpose.toLowerCase()}/${id}-${safeName(file.name)}`;
  const bucket=getUploadsBucket();await bucket.put(key,await file.arrayBuffer(),{httpMetadata:{contentType:file.type||'application/octet-stream'},customMetadata:{purpose,originalName:file.name}});
  const db=getDB();await db.prepare(`INSERT INTO uploads(id,organization_id,uploaded_by_user_id,purpose,storage_key,original_name,mime_type,size_bytes,visibility) VALUES(?,?,?,?,?,?,?,?,?)`).bind(id,organizationId,auth.userId,purpose,key,file.name,file.type||'application/octet-stream',file.size,'PRIVATE').run();
  return NextResponse.json({ok:true,upload:{id,name:file.name,mimeType:file.type,size:file.size,purpose,url:`/api/uploads/${id}`}});
 }catch(error){console.error('Upload failed',error);return NextResponse.json({error:error instanceof Error&&error.message==='UPLOADS_BUCKET_NOT_CONFIGURED'?'Stockage R2 non configuré':'Téléversement impossible'},{status:500});}
}
