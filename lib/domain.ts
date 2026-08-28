export type OrganizationRole = 'OWNER' | 'ADMIN' | 'TRAINER';

export type User = {
  id: string;
  email: string;
  displayName: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
};

export type Membership = {
  userId: string;
  organizationId: string;
  role: OrganizationRole;
};

export type Training = {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  blockCount: number;
};

export type LiveSessionStatus = 'LOBBY' | 'QUESTION' | 'DISCUSSION' | 'RESULTS' | 'FINISHED';

export type LiveSession = {
  id: string;
  organizationId: string;
  trainingId: string;
  code: string;
  status: LiveSessionStatus;
  participantCount: number;
};
