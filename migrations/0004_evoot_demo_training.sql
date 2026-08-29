PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO trainings (
  organization_id, slug, title, description, status, target_duration_minutes, delivery_mode
) VALUES (
  'evolution-pme',
  'decouvrir-evoot',
  'Découvrir ÉVOOT!',
  'Une formation guidée pour découvrir le constructeur, le mode Live, les parcours autonomes et les outils du formateur en utilisant ÉVOOT de l’intérieur.',
  'PUBLISHED',
  30,
  'BOTH'
);

DELETE FROM training_blocks WHERE training_id = (
  SELECT id FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot'
);

INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,0,'SECTION','Bienvenue dans ÉVOOT!',json('{"text":"On apprend. On répond. On évolue. Cette courte formation te fait découvrir ÉVOOT en l’utilisant pour vrai."}'),2,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,1,'TRAINER_NOTE','Avant de commencer',json('{"text":"Accueillir le groupe. Expliquer qu’ÉVOOT sert à construire, animer et suivre une formation complète. Montrer brièvement le code de séance et inviter les participants à se connecter."}'),2,'TRAINER' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,2,'TEXT','Le principe des blocs',json('{"text":"Une formation ÉVOOT est un scénario composé de blocs interchangeables : contenu, média, activité, scénario, discussion, question Live, notes formateur, pause et sections. Chaque formateur choisit son propre ordre."}'),3,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,3,'IMAGE','Une formation qui se construit visuellement',json('{"text":"Ajoute ici une capture du constructeur ÉVOOT pour tester le bloc image.","url":""}'),2,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,4,'ACTIVITY','Déplace un bloc',json('{"text":"Dans le constructeur, prends la poignée d’un bloc et déplace-le. Observe comment le scénario se réorganise sans perdre le contenu, la durée ou les paramètres du bloc."}'),3,'LIVE' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,5,'LIVE_QUESTION','TON PREMIER RÉFLEXE',json('{"prompt":"Selon toi, quel est le plus gros avantage d’un constructeur par blocs?","answers":["Pouvoir adapter le déroulement à chaque formation","Avoir le plus de boutons possible","Faire toutes les formations exactement pareilles","Remplacer complètement le formateur"],"why":"ÉVOOT fournit une structure souple : le formateur garde le contrôle du contenu et de l’ordre pédagogique.","relances":["Qu’est-ce que vous changeriez selon votre public?","Quel type de bloc utiliseriez-vous le plus?","Qu’est-ce qui rend un éditeur simple à utiliser?"]}'),4,'LIVE' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,6,'DISCUSSION','Live, autonome ou les deux?',json('{"text":"Une même formation peut être animée avec un formateur, suivie de façon autonome ou combiner les deux. Discutez d’un exemple où le mode hybride serait utile."}'),3,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,7,'VIDEO','Ajoute une vidéo',json('{"text":"Ce bloc sert à tester l’intégration d’une vidéo dans le scénario. Un lien peut être utilisé maintenant; le stockage média sera branché ensuite.","url":""}'),2,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,8,'SCENARIO','Imagine ta propre formation',json('{"text":"Tu dois créer demain une formation pour une équipe. Choisis une durée, un mode de diffusion et trois types de blocs que tu utiliserais pour construire ton scénario."}'),3,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,9,'LIVE_QUESTION','METS-LE EN PRATIQUE',json('{"prompt":"Tu veux préparer une formation qui sera donnée en classe et reprise plus tard par des employés absents. Quel mode choisis-tu?","answers":["Live seulement","Autonome seulement","Live + autonome","Aucun mode"],"why":"Le mode Live + autonome permet de réutiliser le même scénario maître dans plusieurs contextes de diffusion.","relances":["Quels blocs devraient rester privés au formateur?","Quel contenu devrait fonctionner dans les deux modes?","Qu’aimeriez-vous automatiser dans un parcours autonome?"]}'),4,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
INSERT INTO training_blocks (training_id,position,type,title,content_json,duration_minutes,visibility)
SELECT id,10,'SECTION','Tu connais maintenant les bases',json('{"text":"Tu sais maintenant comment ÉVOOT organise une formation, comment les blocs se déplacent et comment une formation peut vivre en Live ou en autonome."}'),2,'BOTH' FROM trainings WHERE organization_id='evolution-pme' AND slug='decouvrir-evoot';
