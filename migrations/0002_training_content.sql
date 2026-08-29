PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT NOT NULL DEFAULT 'evolution-pme',
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, slug)
);

CREATE TABLE IF NOT EXISTS training_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  stage TEXT NOT NULL,
  prompt TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  why TEXT NOT NULL,
  relances_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  UNIQUE(training_id, position)
);

CREATE INDEX IF NOT EXISTS idx_trainings_slug ON trainings(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_training_questions_training ON training_questions(training_id, position);

INSERT OR IGNORE INTO trainings (organization_id, slug, title, description, status)
VALUES ('evolution-pme', 'comprendre-ses-reactions', 'Comprendre ses réactions', 'Reconnaître émotions, interprétations et impulsions afin de choisir une réponse plus efficace.', 'PUBLISHED');

INSERT OR IGNORE INTO training_questions (training_id, position, stage, prompt, answers_json, why, relances_json)
SELECT id, 0, 'TON RÉFLEXE', 'Un client arrive très fâché. Ton premier réflexe?',
 '["Lancer mon café au client","Aller pleurer dans le backstore","Lui expliquer immédiatement pourquoi il a tort","Prendre une pause et écouter activement"]',
 'Sous pression, notre premier réflexe peut arriver avant même qu’on ait choisi quoi faire. Le but ici n’est pas de juger la réaction : c’est de la remarquer.',
 '["Qu’est-ce qui se passe dans ta tête ou dans ton corps à ce moment-là?","Qu’est-ce qui pourrait te faire réagir trop vite?","Qu’est-ce qui t’aiderait à créer une petite pause avant d’agir?"]'
FROM trainings WHERE organization_id='evolution-pme' AND slug='comprendre-ses-reactions';

INSERT OR IGNORE INTO training_questions (training_id, position, stage, prompt, answers_json, why, relances_json)
SELECT id, 1, 'ET MAINTENANT?', 'Le client coupe la parole et hausse encore le ton. Qu’est-ce qui t’aide le plus à rester efficace?',
 '["Répondre plus fort pour reprendre le contrôle","Prendre deux secondes, ralentir et revenir aux faits","Ignorer complètement ce qu’il dit","Lui dire de se calmer immédiatement"]',
 'Ralentir volontairement peut empêcher l’intensité de décider à notre place. Une courte pause aide à revenir à ce qui est réellement utile dans l’interaction.',
 '["Qu’est-ce qui change quand on ralentit volontairement?","Comment rester ferme sans embarquer dans l’escalade?","Quel signe te dit que tu commences à perdre ton efficacité?"]'
FROM trainings WHERE organization_id='evolution-pme' AND slug='comprendre-ses-reactions';

INSERT OR IGNORE INTO training_questions (training_id, position, stage, prompt, answers_json, why, relances_json)
SELECT id, 2, 'CHOISIR SA RÉPONSE', 'Tu sens que tu commences toi-même à être irrité. Quelle action te redonne le plus de choix?',
 '["Répondre tout de suite pour ne pas perdre la face","Remarquer mon irritation, faire une pause et choisir mon objectif","Faire semblant que ça ne me dérange pas","Mettre fin à la conversation sans explication"]',
 'Reconnaître une émotion ne veut pas dire lui obéir. Plus on remarque ce qui monte en nous, plus on peut choisir une réponse cohérente avec notre objectif plutôt qu’une réaction automatique.',
 '["Quelle différence fais-tu entre ressentir une émotion et agir sous son impulsion?","Dans cette situation, quel serait ton véritable objectif?","Qu’est-ce qui pourrait t’aider à garder cet objectif en tête?"]'
FROM trainings WHERE organization_id='evolution-pme' AND slug='comprendre-ses-reactions';

INSERT OR IGNORE INTO training_questions (training_id, position, stage, prompt, answers_json, why, relances_json)
SELECT id, 3, 'METS-LE EN PRATIQUE', 'Le client dit : « C’est toujours pareil ici, personne ne m’écoute! » Que réponds-tu?',
 '["« Ce n’est pas vrai, on vous écoute depuis tout à l’heure. »","« Si vous continuez comme ça, je ne peux rien faire pour vous. »","« Je vois que la situation vous frustre. Dites-moi ce qui est le plus important à régler maintenant. »","« Calmez-vous et on pourra parler. »"]',
 'Ici, on passe de la compréhension à l’action : reconnaître ce que vit l’autre, sans nécessairement être d’accord, puis ramener l’échange vers un objectif concret.',
 '["Qu’est-ce que cette réponse valide sans donner raison au client?","Comment la question finale ramène-t-elle la conversation vers une solution?","Comment dirais-tu la même chose avec tes propres mots?"]'
FROM trainings WHERE organization_id='evolution-pme' AND slug='comprendre-ses-reactions';
