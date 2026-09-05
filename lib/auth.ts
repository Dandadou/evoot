import {createHash} from 'node:crypto';
import {cookies} from 'next/headers';
import {getDB} from '@/lib/db';

export const AUTH_COOKIE='evoot_session';

export type PlatformRole='EVOOT_ADMIN';
export type OrganizationRole='ORG_ADMIN'|'TRAINER'|'LEARNER';
export type EvootRole=PlatformRole|OrganizationRole;

export type AuthContext={
  sessionId:number;
  userId:number;
  email:string;
  displayName:string;
  organizationId:string|null;
  roles:EvootRole[];
  isEvootAdmin:boolean;
};

function hashToken(token:string){
  return createHash('sha256').update(token).digest('hex');
}

export async function getAuthContext():Promise<AuthContext|null>{
  const store=await cookies();
  const token=store.get(AUTH_COOKIE)?.value?.trim();
  if(!token)return null;

  const db=getDB();
  const session=await db.prepare(`
    SELECT s.id sessionId,s.user_id userId,s.active_organization_id organizationId,
           u.email,u.display_name displayName
    FROM auth_sessions s
    JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=?
      AND s.revoked_at IS NULL
      AND s.expires_at>CURRENT_TIMESTAMP
      AND u.status='ACTIVE'
    LIMIT 1
  `).bind(hashToken(token)).first<{
    sessionId:number;userId:number;organizationId:string|null;
    email:string;displayName:string;
  }>();
  if(!session)return null;

  const memberships=await db.prepare(`
    SELECT organization_id organizationId,role
    FROM organization_members
    WHERE user_id=? AND status='ACTIVE'
  `).bind(session.userId).all<{organizationId:string;role:EvootRole}>();

  const all=memberships.results||[];
  const isEvootAdmin=all.some(m=>m.organizationId==='evoot'&&m.role==='EVOOT_ADMIN');
  const internalEvootContext=isEvootAdmin&&session.organizationId==='evoot';
  const orgRoles:EvootRole[]=internalEvootContext
    ? ['EVOOT_ADMIN','ORG_ADMIN','TRAINER','LEARNER']
    : session.organizationId
      ? all.filter(m=>m.organizationId===session.organizationId&&m.role!=='EVOOT_ADMIN').map(m=>m.role)
      : [];

  await db.prepare('UPDATE auth_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE id=?').bind(session.sessionId).run();

  return {...session,roles:orgRoles,isEvootAdmin};
}

export function hasOrganizationRole(auth:AuthContext,role:OrganizationRole){
  if(role==='TRAINER')return auth.roles.includes('TRAINER')||auth.roles.includes('ORG_ADMIN');
  return auth.roles.includes(role);
}

export async function requireEvootAdmin(){
  const auth=await getAuthContext();
  if(!auth?.isEvootAdmin)throw new Error('UNAUTHORIZED');
  return auth;
}

export async function requireOrganizationRole(role:OrganizationRole){
  const auth=await getAuthContext();
  if(!auth||!auth.organizationId||!hasOrganizationRole(auth,role))throw new Error('UNAUTHORIZED');
  return auth;
}
