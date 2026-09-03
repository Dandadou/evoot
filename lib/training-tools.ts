export type TrainingToolCategory='structure'|'content'|'interaction'|'collaboration'|'facilitation';
export type TrainingToolVisibility='LIVE'|'SELF_PACED'|'BOTH'|'TRAINER';
export type TrainingToolType='SECTION'|'TEXT'|'IMAGE'|'VIDEO'|'PRESENTATION'|'ACTIVITY'|'SCENARIO'|'LIVE_QUESTION'|'DISCUSSION'|'TRAINER_NOTE'|'BREAK'|'WHITEBOARD'|'INTERACTIVE_BOOK';

export type TrainingToolDefinition={
  type:TrainingToolType;
  label:string;
  icon:string;
  category:TrainingToolCategory;
  description:string;
  defaultVisibility:TrainingToolVisibility;
  defaultContent:Record<string,unknown>;
  capabilities:{live:boolean;selfPaced:boolean;collaborative:boolean;trainerOnly:boolean};
  status:'active'|'foundation';
};

export const TRAINING_TOOLS:Record<TrainingToolType,TrainingToolDefinition>={
  SECTION:{type:'SECTION',label:'Section',icon:'§',category:'structure',description:'Structure une partie de la formation.',defaultVisibility:'BOTH',defaultContent:{intro:'',objective:''},capabilities:{live:true,selfPaced:true,collaborative:false,trainerOnly:false},status:'active'},
  TEXT:{type:'TEXT',label:'Texte / contenu',icon:'T',category:'content',description:'Présente du contenu pédagogique.',defaultVisibility:'BOTH',defaultContent:{text:'',keyPoint:''},capabilities:{live:true,selfPaced:true,collaborative:false,trainerOnly:false},status:'active'},
  IMAGE:{type:'IMAGE',label:'Image',icon:'▧',category:'content',description:'Présente une image avec contexte.',defaultVisibility:'BOTH',defaultContent:{url:'',caption:'',alt:''},capabilities:{live:true,selfPaced:true,collaborative:false,trainerOnly:false},status:'active'},
  VIDEO:{type:'VIDEO',label:'Vidéo',icon:'▶',category:'content',description:'Présente une vidéo dans le scénario.',defaultVisibility:'BOTH',defaultContent:{url:'',intro:'',instructions:''},capabilities:{live:true,selfPaced:true,collaborative:false,trainerOnly:false},status:'active'},
  PRESENTATION:{type:'PRESENTATION',label:'Présentation PowerPoint',icon:'▣',category:'content',description:'Présente un diaporama PowerPoint directement dans EVOOT sans quitter la formation.',defaultVisibility:'BOTH',defaultContent:{resourceId:'',fileName:'',sourceType:'PPTX',startSlide:1,syncSlide:true,showPresenterNotes:true,allowLearnerNavigation:false},capabilities:{live:true,selfPaced:true,collaborative:false,trainerOnly:false},status:'foundation'},
  ACTIVITY:{type:'ACTIVITY',label:'Activité / exercice',icon:'✦',category:'interaction',description:'Guide une activité pédagogique.',defaultVisibility:'BOTH',defaultContent:{objective:'',instructions:'',materials:'',debrief:''},capabilities:{live:true,selfPaced:true,collaborative:true,trainerOnly:false},status:'active'},
  SCENARIO:{type:'SCENARIO',label:'Scénario',icon:'◇',category:'interaction',description:'Met les participants en situation.',defaultVisibility:'BOTH',defaultContent:{context:'',situation:'',task:'',debrief:''},capabilities:{live:true,selfPaced:true,collaborative:true,trainerOnly:false},status:'active'},
  LIVE_QUESTION:{type:'LIVE_QUESTION',label:'Question ÉVOOT Live',icon:'?',category:'interaction',description:'Question interactive lancée par le formateur.',defaultVisibility:'BOTH',defaultContent:{prompt:'Nouvelle question',answers:['Réponse A','Réponse B','Réponse C','Réponse D'],why:'',relances:['','','']},capabilities:{live:true,selfPaced:true,collaborative:false,trainerOnly:false},status:'active'},
  DISCUSSION:{type:'DISCUSSION',label:'Discussion',icon:'☵',category:'interaction',description:'Anime une discussion guidée.',defaultVisibility:'BOTH',defaultContent:{prompt:'',relances:['','',''],takeaway:''},capabilities:{live:true,selfPaced:false,collaborative:true,trainerOnly:false},status:'active'},
  TRAINER_NOTE:{type:'TRAINER_NOTE',label:'Notes formateur',icon:'✎',category:'facilitation',description:'Repère privé pour le formateur.',defaultVisibility:'TRAINER',defaultContent:{note:'',cue:''},capabilities:{live:true,selfPaced:false,collaborative:false,trainerOnly:true},status:'active'},
  BREAK:{type:'BREAK',label:'Pause',icon:'Ⅱ',category:'facilitation',description:'Insère une pause dans le déroulement.',defaultVisibility:'BOTH',defaultContent:{message:'',instructions:''},capabilities:{live:true,selfPaced:true,collaborative:false,trainerOnly:false},status:'active'},
  WHITEBOARD:{type:'WHITEBOARD',label:'Tableau blanc',icon:'□',category:'collaboration',description:'Tableau pédagogique formateur ou collaboratif.',defaultVisibility:'LIVE',defaultContent:{instructions:'',mode:'TRAINER_ONLY',template:'BLANK'},capabilities:{live:true,selfPaced:false,collaborative:true,trainerOnly:false},status:'foundation'},
  INTERACTIVE_BOOK:{type:'INTERACTIVE_BOOK',label:'Livre interactif',icon:'▤',category:'content',description:'Manuel interactif annotable et synchronisable pendant la formation.',defaultVisibility:'BOTH',defaultContent:{resourceId:'',instructions:'',startPage:1,syncPage:true,allowLearnerAnnotations:false},capabilities:{live:true,selfPaced:true,collaborative:true,trainerOnly:false},status:'foundation'}
};

export const TRAINING_TOOL_TYPES=Object.keys(TRAINING_TOOLS) as TrainingToolType[];
export const getTrainingTool=(type:TrainingToolType)=>TRAINING_TOOLS[type];
export const createTrainingToolBlock=(type:TrainingToolType)=>{const tool=getTrainingTool(type);return {type,title:tool.label,content:structuredClone(tool.defaultContent),durationMinutes:null,visibility:tool.defaultVisibility};};
