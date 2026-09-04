import type {D1Database} from '@cloudflare/workers-types';

export async function ensureMasterAdmin(db:D1Database,organizationId:string,email:string){
 const normalized=email.trim().toLowerCase();
 let user=await db.prepare(`SELECT id FROM users WHERE lower(email)=? LIMIT 1`).bind(normalized).first<{id:number}>();
 if(!user){
  const created=await db.prepare(`INSERT INTO users(email,display_name,status,locale) VALUES(?,?,'ACTIVE','fr-CA')`).bind(normalized,normalized.split('@')[0]).run();
  const id=Number(created.meta?.last_row_id);if(!id)throw new Error('MASTER_USER_CREATE_FAILED');user={id};
 }else await db.prepare(`UPDATE users SET status='ACTIVE' WHERE id=?`).bind(user.id).run();
 const membership=await db.prepare(`SELECT id FROM organization_members WHERE organization_id=? AND user_id=? AND role='ORG_ADMIN' LIMIT 1`).bind(organizationId,user.id).first<{id:number}>();
 if(membership)await db.prepare(`UPDATE organization_members SET status='ACTIVE' WHERE id=?`).bind(membership.id).run();
 else await db.prepare(`INSERT INTO organization_members(organization_id,user_id,role,status) VALUES(?,?,'ORG_ADMIN','ACTIVE')`).bind(organizationId,user.id).run();
 return user.id;
}

export async function revokeMasterAdmin(db:D1Database,organizationId:string,email:string){
 const user=await db.prepare(`SELECT id FROM users WHERE lower(email)=? LIMIT 1`).bind(email.trim().toLowerCase()).first<{id:number}>();
 if(!user)return;
 await db.prepare(`UPDATE organization_members SET status='INACTIVE' WHERE organization_id=? AND user_id=? AND role='ORG_ADMIN'`).bind(organizationId,user.id).run();
}
