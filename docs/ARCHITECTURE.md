# Architecture ÉVOOT — V0.1

## Colonne vertébrale

```text
Utilisateur
  └── Adhésion à une organisation
        └── Organisation
              ├── Identité visuelle simple
              ├── Membres et rôles
              ├── Formations
              │     └── Blocs / parcours
              │           └── Questions
              │                 ├── choix de réponses
              │                 ├── relances formateur
              │                 └── synthèse pédagogique
              └── Séances live
                    ├── code 6 chiffres
                    ├── participants invités
                    ├── question active
                    ├── réponses
                    └── statistiques
```

## Entités prévues

### User
Compte d'une personne pouvant appartenir à une ou plusieurs organisations.

### Organization
Entreprise cliente. Toutes les données métier portent un `organizationId` afin d'éviter le mélange entre entreprises.

Personnalisation V0.1 :
- nom;
- logo;
- couleur principale.

### Membership
Relie un utilisateur à une organisation.

Rôles initiaux :
- `OWNER`
- `ADMIN`
- `TRAINER`

Les participants d'une séance live n'ont pas besoin d'un compte dans la première version.

### Training
Formation appartenant à une organisation. Évolution PME aura son propre catalogue, mais le moteur n'en dépend pas.

### TrainingBlock
Bloc ou section d'une formation.

### Question
Question interactive rattachée à un bloc.

Phases :
- `OPENING` — réflexes et discussion;
- `INTEGRATION` — application pendant la formation;
- `EVALUATION` — compréhension en fin de parcours.

### LiveSession
Instance temporaire d'une formation animée par un formateur.

États envisagés :
- `LOBBY`
- `QUESTION`
- `DISCUSSION`
- `RESULTS`
- `FINISHED`

### Participant
Participant temporaire joint par code de séance et prénom/pseudonyme.

### Response
Réponse d'un participant à une question d'une séance.

## Temps réel

Une séance live doit avoir un état autoritaire côté serveur. Les téléphones participants et l'écran formateur se synchronisent en temps réel. La cible de déploiement envisagée est Cloudflare, avec un composant stateful/WebSocket adapté aux séances live.

## Séparation des responsabilités

### Moteur ÉVOOT
- comptes;
- organisations;
- rôles;
- éditeur de formations;
- séances live;
- réponses;
- statistiques;
- personnalisation simple.

### Contenu Évolution PME
- 10 blocs de formation;
- scénarios;
- questions;
- relances;
- synthèses;
- adaptations professionnelles des compétences TCD/DBT.

Cette séparation permet d'utiliser ÉVOOT avec d'autres entreprises sans copier ou exposer le contenu propriétaire d'Évolution PME.

## Hors périmètre V0.1

- paiements;
- abonnements;
- marketplace de formations;
- parcours autonomes asynchrones;
- certificats;
- IA générative automatique;
- personnalisation avancée / marque blanche complète.
