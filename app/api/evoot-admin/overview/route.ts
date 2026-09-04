import {NextResponse} from 'next/server';
import {getDB} from '@/lib/db';
import {requireEvootAdmin} from '@/lib/auth';

export async function GET(){
  try{
    await requireEvootAdmin();
    const db=getDB();
    const [organizations,users,memberships,subscriptions,sessions]=await Promise.all([
      db.prepare(`SELECT COUNT(*) count FROM organizations WHERE id<>'evoot'`).first<{count:number}>(),
      db.prepare(`SELECT COUNT(*) count FROM users WHERE status='ACTIVE'`).first<{count:number}>(),
      db.prepare(`SELECT COUNT(*) count FROM organization_members WHERE status='ACTIVE'`).first<{count:number}>(),
      db.prepare(`SELECT COUNT(*) count FROM subscriptions WHERE status='ACTIVE'`).first<{count:number}>(),
      db.prepare(`SELECT COUNT(*) count FROM auth_sessions WHERE revoked_at IS NULL AND expires_at>CURRENT_TIMESTAMP`).first<{count:number}>()
    ]);
    const recent=await db.prepare(`
      SELECT o.id,o.name,o.status,o.created_at createdAt,
             COUNT(DISTINCT om.user_id) members
      FROM organizations o
      LEFT JOIN organization_members om ON om.organization_id=o.id AND om.status='ACTIVE'
      WHERE o.id<>'evoot'
      GROUP BY o.id,o.name,o.status,o.created_at
      ORDER BY o.created_at DESC
      LIMIT 8
    `).all<{id:string;name:string;status:string;createdAt:string;members:number}>();
    return NextResponse.json({ok:true,stats:{organizations:organizations?.count||0,users:users?.count||0,memberships:memberships?.count||0,subscriptions:subscriptions?.count||0,sessions:sessions?.count||0},recentOrganizations:recent.results||[]});
  }catch(error){
    if(error instanceof Error&&error.message==='UNAUTHORIZED')return NextResponse.json({error:'Non autorisé'},{status:401});
    console.error('EVOOT admin overview failed',error);
    return NextResponse.json({error:'Impossible de charger le tableau de bord'},{status:500});
  }
}
