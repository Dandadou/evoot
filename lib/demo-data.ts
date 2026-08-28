import type { LiveSession, Organization, Training, User } from './domain';

export const currentUser: User = {
  id: 'user-demo-owner',
  email: 'demo@evoot.app',
  displayName: 'Compte propriétaire',
};

export const currentOrganization: Organization = {
  id: 'org-evolution-pme',
  name: 'Évolution PME',
  slug: 'evolution-pme',
  primaryColor: '#ff6a00',
};

export const trainings: Training[] = [
  {
    id: 'training-reactions',
    organizationId: currentOrganization.id,
    title: 'Comprendre ses réactions',
    description: 'Reconnaître émotions, interprétations et impulsions afin de choisir une réponse plus efficace.',
    blockCount: 1,
  },
];

export const liveSessions: LiveSession[] = [];
