import {NextRequest,NextResponse} from 'next/server';
import {getAuthContext} from '@/lib/auth';
import {getDB,getUploadsBucket} from '@/lib/db';

export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const auth=await getAuthContext();if(!auth)return NextResponse.json({error:'Non autorisé'},{status:401});
 const {id}=await params;const db=getDB();const row=await db.prepare(`SELECT organization_id organizationId,storage_key storageKey,mime_type mimeType,original_name originalName FROM uploads WHERE id=? AND status='ACTIVE' AND deleted_at IS NULL`).bind(id).first<{organizationId:string|null;storageKey:string;mimeType:string;originalName:string}>();
 if(!row)return NextResponse.json({error:'Fichier introuvable'},{status:404});
 if(!auth.isEvootAdmin&&row.organizationId!==auth.organizationId)return NextResponse.json({error:'Accès refusé'},{status:403});
 const object=await getUploadsBucket().get(row.storageKey);if(!object)return NextResponse.json({error:'Fichier introuvable'},{status:404});
 const headers=new Headers();headers.set('Content-Type',row.mimeType||'application/octet-stream');headers.set('Cache-Control','private, max-age=300');headers.set('Content-Disposition',`inline; filename*=UTF-8''${encodeURIComponent(row.originalName)}`);
 const body=await object.arrayBuffer();
 return new Response(body,{headers});
}
