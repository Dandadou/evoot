import {NextRequest,NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireEvootAdmin} from '@/lib/auth';

const HEX=/^#[0-9A-Fa-f]{6}$/;
const slugify=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60);

export async function GET(){
  try{
    await requireEvootAdmin();
    const db=getDB();
    const rows=await db.prepare(`SELECT o.id,o.name,o.type,o.status,o.timezone,o.locale,o.branding_json brandingJson,o.created_at createdAt,COUNT(DISTINCT om.user_id) members FROM organizations o LEFT JOIN organization_members om ON om.organization_id=o.id AND om.status='ACTIVE' WHERE o.id<>'evoot' GROUP BY o.id ORDER BY o.name`).all();
    return NextResponse.json({ok:true,organizations:rows.results||[]});
  }catch(error){if(error instanceof Error&&error.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});return NextResponse.json({error:'Impossible de charger les organisations'},{status:500});}
}

export async function POST(request:NextRequest){
  try{
    await requireEvootAdmin();
    const body=await request.json() as {name?:string;id?:string;type?:string;timezone?:string;locale?:string;primaryColor?:string;secondaryColor?:string;logoUrl?:string};
    const name=body.name?.trim();
    const id=slugify(body.id||name||'');
    if(!name||!id)return NextResponse.json({error:'Nom de l’organisation requis'},{status:400});
    const type=['BUSINESS','SCHOOL','ORGANIZATION'].includes(body.type||'')?body.type!:'BUSINESS';
    const primaryColor=HEX.test(body.primaryColor||'')?body.primaryColor!:'#F7941D';
    const secondaryColor=HEX.test(body.secondaryColor||'')?body.secondaryColor!:'#111111';
    const branding={primaryColor,secondaryColor,logoUrl:(body.logoUrl||'').trim(),showPoweredByEvoot:true};
    const db=getDB();
    await db.prepare(`INSERT INTO organizations(id,name,type,status,timezone,locale,branding_json) VALUES(?,?,?,'ACTIVE',?,?,?)`).bind(id,name,type,body.timezone?.trim()||'America/Toronto',body.locale?.trim()||'fr-CA',JSON.stringify(branding)).run();
    return NextResponse.json({ok:true,id},{status:201});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});
    console.error('Create organization failed',error);
    return NextResponse.json({error:'Impossible de créer l’organisation. Vérifie que son identifiant est unique.'},{status:500});
  }
}

export async function DELETE(request:NextRequest){
  try{
    await requireEvootAdmin();
    const body=await request.json() as {id?:string};
    const id=body.id?.trim();
    if(!id)return NextResponse.json({error:'Organisation requise'},{status:400});
    if(id==='evoot')return NextResponse.json({error:'L’organisation système EVOOT ne peut pas être supprimée'},{status:403});
    const db=getDB();
    const org=await db.prepare(`SELECT id,name FROM organizations WHERE id=?`).bind(id).first<{id:string;name:string}>();
    if(!org)return NextResponse.json({error:'Organisation introuvable'},{status:404});
    await db.prepare(`DELETE FROM organizations WHERE id=?`).bind(id).run();
    return NextResponse.json({ok:true,id,name:org.name});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});
    console.error('Delete organization failed',error);
    return NextResponse.json({error:'Impossible de supprimer l’organisation'},{status:500});
  }
}
