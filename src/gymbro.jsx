import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════ RANKS ══
const RANKS = [
  {name:"Silver I",   tier:"silver",   color:"#94A3B8",min:0,     icon:"🥈"},
  {name:"Silver II",  tier:"silver",   color:"#94A3B8",min:200,   icon:"🥈"},
  {name:"Silver III", tier:"silver",   color:"#94A3B8",min:500,   icon:"🥈"},
  {name:"Silver IV",  tier:"silver",   color:"#94A3B8",min:900,   icon:"🥈"},
  {name:"Silver V",   tier:"silver",   color:"#94A3B8",min:1400,  icon:"🥈"},
  {name:"Gold I",     tier:"gold",     color:"#FBBF24",min:2000,  icon:"🥇"},
  {name:"Gold II",    tier:"gold",     color:"#FBBF24",min:2800,  icon:"🥇"},
  {name:"Gold III",   tier:"gold",     color:"#FBBF24",min:3700,  icon:"🥇"},
  {name:"Gold IV",    tier:"gold",     color:"#FBBF24",min:4700,  icon:"🥇"},
  {name:"Gold V",     tier:"gold",     color:"#FBBF24",min:5800,  icon:"🥇"},
  {name:"Platinum I", tier:"platinum", color:"#67E8F9",min:7000,  icon:"💎"},
  {name:"Platinum II",tier:"platinum", color:"#67E8F9",min:8500,  icon:"💎"},
  {name:"Platinum III",tier:"platinum",color:"#67E8F9",min:10500, icon:"💎"},
  {name:"Platinum IV",tier:"platinum", color:"#67E8F9",min:13000, icon:"💎"},
  {name:"Platinum V", tier:"platinum", color:"#67E8F9",min:16000, icon:"💎"},
  {name:"Diamond I",  tier:"diamond",  color:"#A78BFA",min:20000, icon:"🔷"},
  {name:"Diamond II", tier:"diamond",  color:"#A78BFA",min:25000, icon:"🔷"},
  {name:"Diamond III",tier:"diamond",  color:"#A78BFA",min:31000, icon:"🔷"},
  {name:"Diamond IV", tier:"diamond",  color:"#A78BFA",min:38000, icon:"🔷"},
  {name:"Diamond V",  tier:"diamond",  color:"#A78BFA",min:46000, icon:"🔷"},
  {name:"Emerald I",  tier:"emerald",  color:"#34D399",min:55000, icon:"💚"},
  {name:"Emerald II", tier:"emerald",  color:"#34D399",min:66000, icon:"💚"},
  {name:"Emerald III",tier:"emerald",  color:"#34D399",min:79000, icon:"💚"},
  {name:"Emerald IV", tier:"emerald",  color:"#34D399",min:94000, icon:"💚"},
  {name:"Emerald V",  tier:"emerald",  color:"#34D399",min:111000,icon:"💚"},
  {name:"Elite I",    tier:"elite",    color:"#FF4D4D",min:130000,icon:"🔥"},
  {name:"Elite II",   tier:"elite",    color:"#FF4D4D",min:155000,icon:"🔥"},
  {name:"Elite III",  tier:"elite",    color:"#FF4D4D",min:185000,icon:"🔥"},
  {name:"Elite IV",   tier:"elite",    color:"#FF4D4D",min:220000,icon:"🔥"},
  {name:"Elite V",    tier:"elite",    color:"#FF4D4D",min:260000,icon:"🔥"},
];
const getRank     = pts => { let r=RANKS[0]; for(const x of RANKS){if(pts>=x.min)r=x;} return r; };
const getNextRank = pts => { for(const x of RANKS){if(pts<x.min)return x;} return null; };

// ══════════════════════ PR EXERCISES (only these count for PR trophies/XP) ══
const PR_EXERCISES = ["Développé couché","Squat","Soulevé de terre","Développé militaire","Rowing barre","Hip thrust","Presse","Tractions"];

// ══════════════════════ MUSCLE MAP DATA ══
// Maps exercise names to muscle groups for the body map
const EX_TO_MUSCLES = {
  // Chest
  "Développé couché":["chest"],"Développé incliné":["chest","shoulders"],"Développé décliné":["chest"],
  "Écarté couché":["chest"],"Pec deck":["chest"],"Push-up":["chest","triceps"],"Dips":["chest","triceps"],
  "Développé haltères":["chest"],"Écarté incliné":["chest"],"Cable fly":["chest"],
  // Back
  "Tractions":["back","biceps"],"Rowing barre":["back"],"Rowing haltère":["back"],
  "Tirage vertical":["back","biceps"],"Tirage horizontal":["back"],"Soulevé de terre":["back","glutes","hamstrings"],
  "Rack pull":["back"],"Shrugs":["traps"],"Face pull":["rear_delts","traps"],"T-bar row":["back"],
  "Tirage nuque":["back"],"Tirage poitrine":["back"],"Superman":["back"],
  // Shoulders
  "Développé militaire":["shoulders"],"Arnold press":["shoulders"],"Élévations latérales":["shoulders"],
  "Oiseau":["rear_delts"],"Upright row":["shoulders","traps"],"Front raise":["shoulders"],
  "Cable latéral":["shoulders"],"Shoulder press machine":["shoulders"],
  // Biceps
  "Curl barre":["biceps"],"Curl haltère":["biceps"],"Curl incliné":["biceps"],"Curl marteau":["biceps"],
  "Curl pupitre":["biceps"],"Curl câble":["biceps"],"Curl concentré":["biceps"],"Spider curl":["biceps"],
  "Curl EZ":["biceps"],"Curl 21":["biceps"],
  // Triceps
  "Dips triceps":["triceps"],"Pushdown câble":["triceps"],"Extension overhead":["triceps"],
  "Skull crusher":["triceps"],"Kick-back":["triceps"],"Close grip bench":["triceps","chest"],"JM press":["triceps"],
  "Pushdown corde":["triceps"],"Extension triceps":["triceps"],
  // Legs
  "Squat":["quads","glutes"],"Presse":["quads","glutes"],"Leg extension":["quads"],
  "Leg curl":["hamstrings"],"Fentes":["quads","glutes"],"Hip thrust":["glutes"],
  "Sumo deadlift":["glutes","hamstrings"],"Good morning":["hamstrings","back"],
  "Calf raise":["calves"],"Hack squat":["quads"],"Bulgarian split squat":["quads","glutes"],
  "Leg press":["quads","glutes"],"Romanian deadlift":["hamstrings","glutes"],
  "Goblet squat":["quads","glutes"],"Step-up":["quads","glutes"],
  // Abs
  "Crunch":["abs"],"Planche":["abs"],"Relevé de jambes":["abs"],"Russian twist":["abs"],
  "Ab wheel":["abs"],"Cable crunch":["abs"],"L-sit":["abs"],"Dragon flag":["abs"],
  "Gainage":["abs"],"Sit-up":["abs"],"Bicycle crunch":["abs"],
  // Cardio
  "Course":[],"Vélo":[],"Elliptique":[],"Rameur":["back","legs"],"HIIT":[],"Corde à sauter":[],"Natation":[],
};

// ══════════════════════ EXERCISE BANK (expanded) ══
const EXERCISE_BANK = {
  "Poitrine":["Développé couché","Développé incliné","Développé décliné","Écarté couché","Pec deck","Push-up","Dips","Développé haltères","Écarté incliné","Cable fly","Développé machine","Push-up diamant","Push-up large","Chest press","Svend press"],
  "Dos":["Tractions","Rowing barre","Rowing haltère","Tirage vertical","Tirage horizontal","Soulevé de terre","Rack pull","Shrugs","Face pull","T-bar row","Tirage nuque","Tirage poitrine","Superman","Rowing machine","Tirage buste","Pull-over","Deadlift roumain","Seal row","Meadows row"],
  "Épaules":["Développé militaire","Arnold press","Élévations latérales","Oiseau","Upright row","Front raise","Cable latéral","Shoulder press machine","Face pull","Push press","Bradford press","Élévations prone","Lu raise"],
  "Biceps":["Curl barre","Curl haltère","Curl incliné","Curl marteau","Curl pupitre","Curl câble","Curl concentré","Spider curl","Curl EZ","Curl 21","Curl Zottman","Reverse curl","Cross body curl"],
  "Triceps":["Dips triceps","Pushdown câble","Extension overhead","Skull crusher","Kick-back","Close grip bench","JM press","Pushdown corde","Extension triceps","Tate press","Rolling triceps"],
  "Jambes":["Squat","Presse","Leg extension","Leg curl","Fentes","Hip thrust","Sumo deadlift","Good morning","Calf raise","Hack squat","Bulgarian split squat","Leg press","Romanian deadlift","Goblet squat","Step-up","Leg press 45°","Sissy squat","Nordic curl","Glute bridge","Hip abduction","Hip adduction","Lying leg curl"],
  "Abdos":["Crunch","Planche","Relevé de jambes","Russian twist","Ab wheel","Cable crunch","L-sit","Dragon flag","Gainage","Sit-up","Bicycle crunch","Crunch oblique","Planche latérale","Hanging knee raise","Windshield wiper"],
  "Fessiers":["Hip thrust","Glute bridge","Fentes","Bulgarian split squat","Step-up","Hip abduction","Cable kickback","Donkey kick","Sumo squat","Good morning"],
  "Trapèzes":["Shrugs","Upright row","Face pull","Tirage vertical nuque","Power clean","Farmer walk"],
  "Avant-bras":["Curl marteau","Reverse curl","Wrist curl","Reverse wrist curl","Farmer walk","Pinch grip","Plate pinch"],
  "Cardio":["Course","Vélo","Elliptique","Rameur","HIIT","Corde à sauter","Natation","Marche rapide","Vélo HIIT","Box jump","Burpees","Jump rope tabata"],
};

// ══════════════════════ PRESETS ══
const PRESET_PROGRAMS = [
  {name:"Push Pull Legs (6j)",freq:6,days:[
    {name:"Push A",exos:["Développé couché","Développé incliné","Élévations latérales","Dips","Pushdown câble"]},
    {name:"Pull A",exos:["Tractions","Rowing barre","Face pull","Curl barre","Curl haltère"]},
    {name:"Legs A",exos:["Squat","Leg extension","Leg curl","Calf raise","Hip thrust"]},
    {name:"Push B",exos:["Développé militaire","Écarté couché","Arnold press","Skull crusher","Cable fly"]},
    {name:"Pull B",exos:["Soulevé de terre","Tirage vertical","Rowing haltère","Curl marteau","Face pull"]},
    {name:"Legs B",exos:["Presse","Fentes","Bulgarian split squat","Leg curl","Calf raise"]},
  ]},
  {name:"Upper Lower (4j)",freq:4,days:[
    {name:"Upper A",exos:["Développé couché","Tractions","Développé militaire","Rowing haltère","Curl barre","Pushdown câble"]},
    {name:"Lower A",exos:["Squat","Leg curl","Leg extension","Hip thrust","Calf raise"]},
    {name:"Upper B",exos:["Développé incliné","Rowing barre","Arnold press","Face pull","Curl haltère","Dips triceps"]},
    {name:"Lower B",exos:["Soulevé de terre","Presse","Fentes","Leg extension","Calf raise"]},
  ]},
  {name:"Full Body (3j)",freq:3,days:[
    {name:"Full A",exos:["Squat","Développé couché","Tractions","Développé militaire","Curl barre","Calf raise"]},
    {name:"Full B",exos:["Soulevé de terre","Développé incliné","Rowing barre","Arnold press","Curl haltère","Leg curl"]},
    {name:"Full C",exos:["Presse","Dips","Tirage vertical","Élévations latérales","Skull crusher","Leg extension"]},
  ]},
  {name:"Bro Split (5j)",freq:5,days:[
    {name:"Chest",exos:["Développé couché","Développé incliné","Écarté couché","Pec deck","Dips"]},
    {name:"Back",exos:["Soulevé de terre","Tractions","Rowing barre","Tirage vertical","Face pull"]},
    {name:"Shoulders",exos:["Développé militaire","Élévations latérales","Oiseau","Arnold press","Upright row"]},
    {name:"Arms",exos:["Curl barre","Curl haltère","Curl pupitre","Skull crusher","Pushdown câble","Extension overhead"]},
    {name:"Legs",exos:["Squat","Presse","Leg extension","Leg curl","Hip thrust","Calf raise"]},
  ]},
];

// ══════════════════════ TROPHIES ══
const TROPHIES = [
  {id:"s1",icon:"🎯",name:"Premier pas",    desc:"Complète ta 1ère séance",      cat:"Séances",rarity:"common",   condition:s=>s.sessions>=1},
  {id:"s2",icon:"💪",name:"Habitude",        desc:"5 séances complétées",          cat:"Séances",rarity:"common",   condition:s=>s.sessions>=5},
  {id:"s3",icon:"🔟",name:"Régulier",        desc:"10 séances complétées",         cat:"Séances",rarity:"rare",     condition:s=>s.sessions>=10},
  {id:"s4",icon:"📅",name:"Mois de fer",     desc:"30 séances complétées",         cat:"Séances",rarity:"epic",     condition:s=>s.sessions>=30},
  {id:"s5",icon:"💯",name:"Centurion",       desc:"100 séances complétées",        cat:"Séances",rarity:"legendary",condition:s=>s.sessions>=100},
  {id:"s6",icon:"🌅",name:"Early bird",      desc:"Séance avant 7h du matin",      cat:"Séances",rarity:"common",   condition:s=>s.earlySession},
  {id:"s7",icon:"🌙",name:"Night owl",       desc:"Séance après 22h",              cat:"Séances",rarity:"common",   condition:s=>s.nightSession},
  {id:"s8",icon:"☀️",name:"Weekend warrior", desc:"5 séances le weekend",          cat:"Séances",rarity:"rare",     condition:s=>s.weekendSessions>=5},
  {id:"st1",icon:"🔥",name:"En feu",         desc:"7 jours consécutifs",           cat:"Streaks",rarity:"rare",     condition:s=>s.streak>=7},
  {id:"st2",icon:"⚡",name:"Inarrêtable",    desc:"14 jours consécutifs",          cat:"Streaks",rarity:"epic",     condition:s=>s.streak>=14},
  {id:"st3",icon:"🌪️",name:"Force de la nature",desc:"30 jours consécutifs",      cat:"Streaks",rarity:"legendary",condition:s=>s.streak>=30},
  {id:"pr1",icon:"🏅",name:"Premier PR",     desc:"Bats ton 1er record sur un grand exercice",cat:"PRs",rarity:"common",condition:s=>s.prs>=1},
  {id:"pr2",icon:"📈",name:"En progression", desc:"5 PRs sur grands exercices",    cat:"PRs",rarity:"rare",     condition:s=>s.prs>=5},
  {id:"pr3",icon:"🚀",name:"Machine à PR",   desc:"20 PRs battus",                 cat:"PRs",rarity:"epic",     condition:s=>s.prs>=20},
  {id:"pr4",icon:"👑",name:"Légende vivante",desc:"50 PRs battus",                 cat:"PRs",rarity:"legendary",condition:s=>s.prs>=50},
  {id:"so1",icon:"📸",name:"Première photo", desc:"Publie ton 1er post",           cat:"Social",rarity:"common",  condition:s=>s.posts>=1},
  {id:"so2",icon:"🎥",name:"Créateur",       desc:"10 posts publiés",              cat:"Social",rarity:"rare",    condition:s=>s.posts>=10},
  {id:"so3",icon:"❤️",name:"100 likes",      desc:"Reçois 100 likes",              cat:"Social",rarity:"common",  condition:s=>s.totalLikes>=100},
  {id:"so4",icon:"💥",name:"1000 likes",     desc:"Reçois 1000 likes",             cat:"Social",rarity:"rare",    condition:s=>s.totalLikes>=1000},
  {id:"so5",icon:"🌟",name:"Viral",          desc:"10 000 likes reçus",            cat:"Social",rarity:"epic",    condition:s=>s.totalLikes>=10000},
  {id:"so6",icon:"👥",name:"100 abonnés",    desc:"Atteins 100 abonnés",           cat:"Social",rarity:"rare",    condition:s=>s.followers>=100},
  {id:"so7",icon:"🏆",name:"Star",           desc:"1000 abonnés",                  cat:"Social",rarity:"epic",    condition:s=>s.followers>=1000},
  {id:"rk1",icon:"🥇",name:"Gold",           desc:"Atteins Gold I",                cat:"Ranked",rarity:"rare",    condition:s=>s.points>=2000},
  {id:"rk2",icon:"💎",name:"Platinum",       desc:"Atteins Platinum I",            cat:"Ranked",rarity:"epic",    condition:s=>s.points>=7000},
  {id:"rk3",icon:"🔷",name:"Diamond",        desc:"Atteins Diamond I",             cat:"Ranked",rarity:"epic",    condition:s=>s.points>=20000},
  {id:"rk4",icon:"💚",name:"Emerald",        desc:"Atteins Emerald I",             cat:"Ranked",rarity:"legendary",condition:s=>s.points>=55000},
  {id:"rk5",icon:"🔥",name:"Elite",          desc:"Atteins Elite I",               cat:"Ranked",rarity:"legendary",condition:s=>s.points>=130000},
  {id:"sp3",icon:"🤝",name:"Ami de gym",     desc:"Suis 10 personnes",             cat:"Spéciaux",rarity:"common", condition:s=>s.following>=10},
  {id:"sp4",icon:"💬",name:"Coach",          desc:"50 commentaires postés",        cat:"Spéciaux",rarity:"rare",   condition:s=>s.commentsSent>=50},
];

const RC = {common:"#6B7280",rare:"#3B82F6",epic:"#8B5CF6",legendary:"#F59E0B"};
const COUNTRIES = ["France","Monde","Allemagne","Espagne","Italie","Royaume-Uni","États-Unis","Belgique","Suisse","Canada"];
const STORAGE_KEY = "gymbro_v5";

// ══════════════════════ UTILS ══
const genId = () => Math.random().toString(36).slice(2,9);
const timeSince = ts => {
  const d=(Date.now()-ts)/1000;
  if(d<60)return "à l'instant"; if(d<3600)return `${Math.floor(d/60)}min`;
  if(d<86400)return `${Math.floor(d/3600)}h`; return `${Math.floor(d/86400)}j`;
};
const saveState = s => { try{localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}catch{} };
// Clear old keys
try{["gymbro_user","gymbro_user_v1","gymbro_v3","gymbro_v4"].forEach(k=>{if(localStorage.getItem(k))localStorage.removeItem(k);});}catch{}

const loadState = () => {
  try {
    const r=localStorage.getItem(STORAGE_KEY); if(!r)return null;
    const s=JSON.parse(r);
    if(!s||!s.user||!s.user.email||!s.user.pseudo||!s.stats){localStorage.removeItem(STORAGE_KEY);return null;}
    s.stats={sessions:0,prs:0,points:0,earlySession:false,nightSession:false,weekendSessions:0,posts:0,streak:0,totalLikes:0,followers:0,following:0,changedCountry:false,commentsSent:0,...s.stats};
    s.posts=Array.isArray(s.posts)?s.posts:[];
    s.programs=Array.isArray(s.programs)?s.programs:[];
    s.following=Array.isArray(s.following)?s.following:[];
    s.conversations=Array.isArray(s.conversations)?s.conversations:[];
    s.exercises=(s.exercises&&typeof s.exercises==="object")?s.exercises:{};
    s.sessionHistory=Array.isArray(s.sessionHistory)?s.sessionHistory:[];
    s.country=s.country||"France";
    s.user.bio=s.user.bio||""; s.user.avatar=s.user.avatar||"";
    s.user.pinnedTrophies=Array.isArray(s.user.pinnedTrophies)?s.user.pinnedTrophies:[];
    s.user.trophyDates=s.user.trophyDates||{};
    s.notifs=Array.isArray(s.notifs)?s.notifs:[];
    return s;
  } catch { try{localStorage.removeItem(STORAGE_KEY);}catch{} return null; }
};

// Avatar renderer (handles data URL, blob, emoji)
const Avatar = ({val,fallback,size=36,border="#444",style:extraStyle={}}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:"#1A1A24",border:`2px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.42,overflow:"hidden",flexShrink:0,...extraStyle}}>
    {val&&(val.startsWith("data:")||val.startsWith("blob:")||val.startsWith("http"))
      ?<img src={val} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
      :<span>{fallback||"👤"}</span>}
  </div>
);

// ══════════════════════ RANK BADGE SVG ══
function RankBadge({tier, size=28, showLabel=false, label=""}) {
  const cfgs = {
    bronze:  {bg:"#2D1500",b1:"#CD7F32",b2:"#A0522D",txt:"B",shape:"hex"},
    silver:  {bg:"#131320",b1:"#C0C0C0",b2:"#808080",txt:"A",shape:"shield"},
    gold:    {bg:"#1F1200",b1:"#FFD700",b2:"#FFA500",txt:"O",shape:"shield"},
    platinum:{bg:"#001520",b1:"#E5F4FB",b2:"#67E8F9",txt:"P",shape:"diamond"},
    diamond: {bg:"#12002A",b1:"#C4B5FD",b2:"#7C3AED",txt:"D",shape:"diamond"},
    emerald: {bg:"#001A10",b1:"#34D399",b2:"#059669",txt:"E",shape:"hex"},
    elite:   {bg:"#200000",b1:"#FF6B6B",b2:"#CC0000",txt:"Ê",shape:"crown"},
  };
  const cfg = cfgs[tier] || cfgs.silver;
  const s = size, h = size;
  const shapes = {
    hex:    `M${s/2},2 L${s-3},${h*0.26} L${s-3},${h*0.74} L${s/2},${h-2} L3,${h*0.74} L3,${h*0.26} Z`,
    shield: `M${s/2},2 L${s-3},${h*0.28} L${s-3},${h*0.65} Q${s/2},${h-2} ${s/2},${h-2} Q${s/2},${h-2} 3,${h*0.65} L3,${h*0.28} Z`,
    diamond:`M${s/2},2 L${s-2},${h/2} L${s/2},${h-2} L2,${h/2} Z`,
    crown:  `M3,${h*0.72} L3,${h-3} L${s-3},${h-3} L${s-3},${h*0.72} L${s*0.78},${h*0.33} L${s/2},${h*0.53} L${s*0.22},${h*0.33} Z`,
  };
  const gid = `gb_${tier}_${size}`;
  return (
    <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:2,flexShrink:0}}>
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`} style={{filter:`drop-shadow(0 0 ${s*0.13}px ${cfg.b1}55)`,display:"block"}}>
        <defs>
          <linearGradient id={`${gid}_b`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.b1}/><stop offset="100%" stopColor={cfg.b2}/>
          </linearGradient>
        </defs>
        <path d={shapes[cfg.shape]} fill={cfg.bg} stroke={`url(#${gid}_b)`} strokeWidth="1.5"/>
        <text x={s/2} y={h/2+0.5} textAnchor="middle" dominantBaseline="middle"
          fill={cfg.b1} fontSize={s*0.36} fontWeight="900" fontFamily="'Barlow Condensed',sans-serif">
          {cfg.txt}
        </text>
      </svg>
      {showLabel && <span style={{fontSize:Math.max(8,size*0.28),fontWeight:800,color:cfg.b1,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:".04em",lineHeight:1,whiteSpace:"nowrap"}}>{label}</span>}
    </div>
  );
}

// ══════════════════════ CSS ══
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0;}
html,body{background:#0A0A0F;font-family:'Barlow Condensed','Arial Narrow',sans-serif;}
::-webkit-scrollbar{display:none;}
.sa{overflow-y:auto;-ms-overflow-style:none;scrollbar-width:none;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes popIn{0%{transform:scale(.7) translateY(20px);opacity:0}70%{transform:scale(1.05) translateY(-3px)}100%{transform:scale(1) translateY(0);opacity:1}}
.fu{animation:fadeUp .35s ease both}
.fi{animation:fadeIn .25s ease both}
.si{animation:scaleIn .3s cubic-bezier(.34,1.56,.64,1) both}
.su{animation:slideUp .28s ease both}
.pi{animation:popIn .4s cubic-bezier(.34,1.56,.64,1) both}
.rb{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:.04em;}
.tab-b{flex:1;padding:9px 0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#444;background:none;border:none;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
.tab-b.on{color:#F0F0F0;border-bottom-color:#FF3D3D;}
.nav-i{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0 5px;cursor:pointer;background:none;border:none;}
.inp{width:100%;padding:12px 14px;background:#13131A;border:1.5px solid #1E1E2E;border-radius:10px;color:#F0F0F0;font-family:'Barlow',sans-serif;font-size:14px;outline:none;transition:border-color .2s;}
.inp:focus{border-color:#FF3D3D55;}
.inp::placeholder{color:#2A2A3A;}
.inp.err{border-color:#FF3D3D88;background:#1A0D0D;}
.btn-r{width:100%;padding:14px;background:linear-gradient(135deg,#FF3D3D,#CC2020);border:none;color:#FFF;border-radius:12px;font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:900;letter-spacing:.07em;cursor:pointer;transition:opacity .2s;}
.btn-r:disabled{opacity:.4;cursor:not-allowed;}
.btn-r:active{opacity:.85;}
.btn-g{padding:9px 14px;background:#1A1A24;border:1.5px solid #2A2A3A;color:#AAA;border-radius:9px;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;}
.btn-g:hover{border-color:#444;color:#F0F0F0;}
.card{background:#0D0D14;border-radius:14px;border:1px solid #1A1A24;}
.modal-bg{position:fixed;inset:0;background:#000000E8;display:flex;align-items:flex-end;justify-content:center;z-index:400;animation:fadeIn .2s ease;overscroll-behavior:contain;touch-action:none;}
.modal-sheet{background:#0F0F18;border-radius:20px 20px 0 0;width:100%;max-width:430px;max-height:91vh;overflow-y:auto;padding:0 0 env(safe-area-inset-bottom,16px);animation:slideUp .3s ease;overscroll-behavior:contain;touch-action:pan-y;}
.modal-center{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:500;padding:20px;animation:fadeIn .2s ease;overscroll-behavior:contain;touch-action:none;}
.modal-handle{width:36px;height:4px;background:#2A2A3A;border-radius:2px;margin:12px auto 14px;}
.fullscreen{position:fixed;inset:0;background:#0A0A0F;z-index:300;overflow-y:auto;max-width:430px;left:50%;transform:translateX(-50%);}
.glow{box-shadow:0 0 18px rgba(255,61,61,.18);}
.pm-b{background:linear-gradient(135deg,#FFD700,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;}
.ex-chip{padding:6px 12px;background:#13131A;border:1px solid #1E1E2E;border-radius:20px;font-size:12px;cursor:pointer;transition:all .2s;white-space:nowrap;font-family:'Barlow',sans-serif;color:#CCC;}
.ex-chip.sel{background:#FF3D3D22;border-color:#FF3D3D;color:#FF3D3D;}
.set-row{display:flex;align-items:center;gap:7px;padding:8px 10px;background:#13131A;border-radius:8px;margin-bottom:5px;transition:all .2s;}
.set-row.done{background:#0D1F18;opacity:.75;}
.num-inp{width:52px;padding:7px 4px;background:#0A0A0F;border:1.5px solid #2A2A3A;border-radius:7px;color:#F0F0F0;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;text-align:center;outline:none;}
.num-inp:focus{border-color:#FF3D3D;}
.sx-b{flex:1;padding:11px 6px;background:#13131A;border:1.5px solid #2A2A3A;border-radius:10px;color:#888;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;text-align:center;}
.sx-b.on{background:#FF3D3D22;border-color:#FF3D3D;color:#FF3D3D;}
.ps{height:4px;border-radius:2px;background:#2A2A3A;transition:all .3s;}
.ps.cur{background:#FF3D3D;}
.ps.dn{background:#FF3D3D88;}
.notif-toast{position:fixed;top:env(safe-area-inset-top,0);left:50%;transform:translateX(-50%);z-index:600;pointer-events:none;width:calc(100% - 32px);max-width:390px;}
.msg-b{max-width:75%;padding:9px 13px;border-radius:18px;font-size:13px;font-family:'Barlow',sans-serif;line-height:1.45;word-break:break-word;white-space:pre-wrap;}
.pill{padding:5px 11px;border-radius:20px;border:1px solid #1A1A24;background:transparent;color:#444;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:800;cursor:pointer;letter-spacing:.04em;white-space:nowrap;transition:all .15s;flex-shrink:0;}
.pill.on{border-color:#FF3D3D;background:#FF3D3D18;color:#FF6B6B;}
`;

// ══════════════════════ TOAST NOTIFICATION ══
function Toast({toasts}) {
  return (
    <div className="notif-toast">
      {toasts.map(t=>(
        <div key={t.id} className="pi" style={{background:"#1A1A24",border:`1px solid ${t.color||"#FF3D3D"}55`,borderRadius:14,padding:"11px 14px",marginTop:8,display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px #00000088"}}>
          <span style={{fontSize:22,flexShrink:0}}>{t.icon||"⚡"}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:13,color:t.color||"#FF3D3D"}}>{t.title}</div>
            <div style={{color:"#AAA",fontSize:11,fontFamily:"'Barlow',sans-serif",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.msg}</div>
          </div>
          {t.xp&&<div style={{background:"#FF3D3D22",color:"#FF8080",borderRadius:6,padding:"3px 7px",fontSize:11,fontWeight:800,flexShrink:0}}>+{t.xp} XP</div>}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════ AUTH ══
const AUTH_STEPS=[{title:"Ton compte",sub:"Email · pseudo · mot de passe"},{title:"Qui es-tu ?",sub:"Âge et sexe"},{title:"Ton physique",sub:"Poids et taille"}];

function Splash({goLogin,goSignup}){
  return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",top:-80,right:-80,width:260,height:260,borderRadius:"50%",background:"radial-gradient(circle,#FF3D3D20 0%,transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:-60,left:-60,width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,#FF6B0015 0%,transparent 70%)"}}/>
      <div className="fu" style={{textAlign:"center",marginBottom:52}}>
        <div style={{fontSize:66,marginBottom:8}}>🏋️</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:2,marginBottom:14}}>
          <span style={{fontSize:52,fontWeight:900,color:"#FF3D3D",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-.02em"}}>GYM</span>
          <span style={{fontSize:52,fontWeight:900,color:"#F0F0F0",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"-.02em"}}>BRO</span>
        </div>
        <p style={{color:"#555",fontSize:15,fontFamily:"'Barlow',sans-serif",margin:0,lineHeight:1.6}}>Progresse. Compète. Domine.<br/><span style={{color:"#FF3D3D",fontWeight:600}}>La communauté muscu.</span></p>
      </div>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:10}}>
        <button className="btn-r" onClick={goSignup}>CRÉER MON COMPTE 🚀</button>
        <button className="btn-g" onClick={goLogin} style={{width:"100%",padding:"14px",fontSize:14}}>J'ai déjà un compte</button>
      </div>
    </div>
  );
}

function Login({onOk,goBack,goSignup}){
  const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const go=()=>{
    setErr(""); if(!email||!pw){setErr("Remplis tous les champs.");return;} setLoading(true);
    setTimeout(()=>{
      const s=loadState();
      if(!s){setErr("Aucun compte trouvé.");setLoading(false);return;}
      if(s.user.email.toLowerCase()!==email.toLowerCase()){setErr("Email introuvable.");setLoading(false);return;}
      if(s.user.password!==pw){setErr("Mot de passe incorrect.");setLoading(false);return;}
      onOk(s);
    },600);
  };
  return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",flexDirection:"column",padding:"env(safe-area-inset-top,44px) 24px 32px"}}>
      <button onClick={goBack} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,textAlign:"left",marginBottom:32}}>← RETOUR</button>
      <div className="si" style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{marginBottom:28}}><div style={{fontSize:28,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:4}}>Bon retour 💪</div><div style={{color:"#555",fontFamily:"'Barlow',sans-serif",fontSize:14}}>Reprends là où tu t'es arrêté.</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
          <div><div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:".09em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>Email</div><input className={`inp${err?" err":""}`} type="email" placeholder="ton@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div><div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:".09em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>Mot de passe</div><input className={`inp${err?" err":""}`} type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        </div>
        {err&&<div style={{background:"#FF3D3D15",border:"1px solid #FF3D3D44",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#FF8080",fontSize:13,fontFamily:"'Barlow',sans-serif"}}>⚠️ {err}</div>}
        <button className="btn-r" onClick={go} disabled={loading}>{loading?"Connexion...":"SE CONNECTER"}</button>
        <div style={{textAlign:"center",marginTop:20,fontFamily:"'Barlow',sans-serif",fontSize:14,color:"#555"}}>Pas de compte ? <span onClick={goSignup} style={{color:"#FF3D3D",fontWeight:700,cursor:"pointer"}}>S'inscrire</span></div>
      </div>
    </div>
  );
}

function Signup({onOk,goBack}){
  const [step,setStep]=useState(0); const [errs,setErrs]=useState({});
  const [f,setF]=useState({email:"",pseudo:"",password:"",confirm:"",age:"",sexe:"",poids:"",taille:"",referralCode:""});
  const upd=(k,v)=>{setF(p=>({...p,[k]:v}));setErrs(p=>({...p,[k]:""}));};
  const validate=()=>{
    const e={};
    if(step===0){if(!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))e.email="Email invalide";if(!f.pseudo||f.pseudo.length<3)e.pseudo="3 chars min";if(/\s/.test(f.pseudo))e.pseudo="Pas d'espaces";if(!f.password||f.password.length<6)e.password="6 chars min";if(f.password!==f.confirm)e.confirm="Ne correspond pas";}
    if(step===1){const a=Number(f.age);if(!f.age||a<13||a>100)e.age="13-100";if(!f.sexe)e.sexe="Requis";}
    if(step===2){const p=Number(f.poids),t=Number(f.taille);if(!f.poids||p<30||p>300)e.poids="30-300kg";if(!f.taille||t<100||t>250)e.taille="100-250cm";}
    setErrs(e); return Object.keys(e).length===0;
  };
  const next=()=>{
    if(!validate())return;
    if(step<2){setStep(s=>s+1);return;}
    onOk({...f});
  };
  const lbl=(txt,k)=><div style={{fontSize:11,fontWeight:700,color:errs[k]?"#FF8080":"#555",letterSpacing:".09em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>{txt}{errs[k]&&<span style={{fontWeight:400,fontSize:11,textTransform:"none",letterSpacing:0,marginLeft:6}}>— {errs[k]}</span>}</div>;
  const imc=f.poids&&f.taille?(Number(f.poids)/((Number(f.taille)/100)**2)).toFixed(1):null;
  return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",flexDirection:"column",padding:"env(safe-area-inset-top,44px) 24px 32px"}}>
      <button onClick={step===0?goBack:()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,textAlign:"left",marginBottom:24}}>← {step===0?"RETOUR":"PRÉCÉDENT"}</button>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:24}}>{AUTH_STEPS.map((_,i)=><div key={i} className={`ps ${i===step?"cur":i<step?"dn":""}`} style={{width:i===step?36:24}}/>)}<span style={{marginLeft:6,fontSize:11,color:"#444",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{step+1}/3</span></div>
      <div key={step} className="su" style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{marginBottom:24}}><div style={{fontSize:26,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:4}}>{AUTH_STEPS[step].title}</div><div style={{color:"#555",fontSize:13,fontFamily:"'Barlow',sans-serif"}}>{AUTH_STEPS[step].sub}</div></div>
        {step===0&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>{lbl("Email","email")}<input className={`inp${errs.email?" err":""}`} type="email" placeholder="ton@email.com" value={f.email} onChange={e=>upd("email",e.target.value)}/></div>
          <div>{lbl("Pseudo","pseudo")}<input className={`inp${errs.pseudo?" err":""}`} placeholder="tonpseudo" value={f.pseudo} onChange={e=>upd("pseudo",e.target.value)}/></div>
          <div>{lbl("Mot de passe","password")}<input className={`inp${errs.password?" err":""}`} type="password" placeholder="6 caractères min." value={f.password} onChange={e=>upd("password",e.target.value)}/></div>
          <div>{lbl("Confirmation","confirm")}<input className={`inp${errs.confirm?" err":""}`} type="password" placeholder="••••••••" value={f.confirm} onChange={e=>upd("confirm",e.target.value)}/></div>
        </div>}
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>{lbl("Âge","age")}<input className={`inp${errs.age?" err":""}`} type="number" placeholder="25" min="13" max="100" value={f.age} onChange={e=>upd("age",e.target.value)}/></div>
          <div>{lbl("Sexe","sexe")}<div style={{display:"flex",gap:10}}>{[["homme","👨 Homme"],["femme","👩 Femme"],["autre","🧑 Autre"]].map(([v,l])=><button key={v} className={`sx-b ${f.sexe===v?"on":""}`} onClick={()=>upd("sexe",v)}>{l}</button>)}</div>{errs.sexe&&<div style={{color:"#FF8080",fontSize:12,marginTop:5}}>⚠️ Requis</div>}</div>
        </div>}
        {step===2&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>{lbl("Poids","poids")}<div style={{position:"relative"}}><input className={`inp${errs.poids?" err":""}`} type="number" placeholder="75" min="30" max="300" value={f.poids} onChange={e=>upd("poids",e.target.value)} style={{paddingRight:40}}/><span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:13,pointerEvents:"none"}}>kg</span></div></div>
          <div>{lbl("Taille","taille")}<div style={{position:"relative"}}><input className={`inp${errs.taille?" err":""}`} type="number" placeholder="175" min="100" max="250" value={f.taille} onChange={e=>upd("taille",e.target.value)} style={{paddingRight:40}}/><span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:13,pointerEvents:"none"}}>cm</span></div></div>
          {imc&&<div style={{background:"#13131A",border:"1px solid #2A2A3A",borderRadius:10,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:"#666",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>IMC estimé</span><span style={{fontSize:22,fontWeight:900,color:Number(imc)<18.5||Number(imc)>30?"#FFD700":"#22C55E"}}>{imc}</span></div>}
          <div style={{marginTop:4}}>
            {lbl("Code parrain (optionnel)","referralCode")}
            <input className="inp" placeholder="ex: ALX042" value={f.referralCode} onChange={e=>upd("referralCode",e.target.value.toUpperCase())} style={{letterSpacing:".12em",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16}}/>
            <div style={{fontSize:11,color:"#444",marginTop:4,fontFamily:"'Barlow',sans-serif"}}>Saisis le code d'un ami pour lui donner de l'avance vers le Premium ✨</div>
          </div>
        </div>}
        <div style={{flex:1}}/>
        <button className="btn-r" onClick={next} style={{marginTop:20}}>{step<2?"CONTINUER →":"CRÉER MON COMPTE 🚀"}</button>
      </div>
    </div>
  );
}

// ══════════════════════ ROOT ══
export default function GymbroApp({ supabaseMode, supabaseCallbacks, externalAppState, isAuthenticated, externalSaveLocal }){
  // ── Supabase mode: all state comes from parent ──
  if(supabaseMode){
    return <SupabaseBridge
      callbacks={supabaseCallbacks}
      externalAppState={externalAppState}
      isAuthenticated={isAuthenticated}
      externalSaveLocal={externalSaveLocal}
    />;
  }
  // ── Offline / prototype mode (original localStorage) ──
  const [screen,setScreen]=useState("splash");
  const [appState,setAppState]=useState(()=>loadState());
  const updateState=useCallback(patch=>{
    setAppState(prev=>{
      const next={...prev,...(typeof patch==="function"?patch(prev):patch)};
      saveState(next); return next;
    });
  },[]);
  if(!appState){
    return(<><style>{CSS}</style>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",background:"#0A0A0F",color:"#F0F0F0",width:"100%",maxWidth:430,margin:"0 auto",minHeight:"100vh"}}>
        {screen==="splash"&&<Splash goLogin={()=>setScreen("login")} goSignup={()=>setScreen("signup")}/>}
        {screen==="login"&&<Login onOk={s=>{setAppState(s);}} goBack={()=>setScreen("splash")} goSignup={()=>setScreen("signup")}/>}
        {screen==="signup"&&<Signup onOk={s=>{setAppState(s);}} goBack={()=>setScreen("splash")}/>}
      </div></>);
  }
  return(<><style>{CSS}</style><AppMain appState={appState} updateState={updateState} onLogout={()=>{setAppState(null);setScreen("splash");}}/></>);
}


// ══════════════════════ SUPABASE BRIDGE ══
// Adapts the Supabase data shape into the AppMain props
function SupabaseBridge({ callbacks, externalAppState, isAuthenticated, externalSaveLocal }) {
  const [screen, setScreen] = useState("splash");

  if (isAuthenticated && externalAppState) {
    const { onSignUp, onSignIn, onLogout, addPost, toggleLike, addComment,
            toggleFollow, sendMessage, updateProfile, saveSession,
            updatePrograms, updatePinnedTrophies, updateTrophyDate, updateCountry,
            createChallenge, respondChallenge, deleteChallenge,
            createSoloChallenge, deleteSoloChallenge } = callbacks;

    // externalAppState already contains fresh localData (programs/exercises/sessionHistory)
    // because App.jsx builds appState from its own localData state.
    // We just use it directly — no need for a separate local state here.

    const updateState = (patch) => {
      const update = typeof patch === "function" ? patch(externalAppState) : patch;
      if (update.user) updateProfile(update.user).catch(e=>console.error('updateProfile:',e));
      if (update.country) updateCountry(update.country).catch(()=>{});
      if (update.user?.pinnedTrophies) updatePinnedTrophies(update.user.pinnedTrophies).catch(()=>{});
      // Programs — save via callback which calls App.jsx saveLocal → triggers re-render
      const localKeys = ["programs","exercises","sessionHistory"];
      const localUpdate = Object.fromEntries(Object.entries(update).filter(([k]) => localKeys.includes(k)));
      if (Object.keys(localUpdate).length > 0) {
        if (externalSaveLocal) externalSaveLocal(localUpdate);
        if (localUpdate.programs) updatePrograms(localUpdate.programs);
      }
    };

    const wrappedAddPost = async (p) => { await addPost(p); };
    const wrappedSaveSession = async (dayName, programName, result, durationSec) => {
      const res = await saveSession(dayName, programName, result, durationSec, (localPatch) => {
        if (externalSaveLocal) externalSaveLocal(localPatch);
      });
      // XP toasts + notifs — fire after session saved
      if (res?.xpGain > 0) {
        if (res.isNewDay) giveXP(50, "Séance complétée !", "🏋️");
        if (res.isEarly && res.isNewDay) giveXP(75, "Séance Early Bird 🌅", "🌅");
        if (res.prCount > 0) giveXP(res.prCount * 150, res.prCount + " nouveau" + (res.prCount > 1 ? "x" : "") + " PR !", "💪");
      }
      // Always notify session done even if no XP (not new day)
      if (res !== undefined && !res?.isNewDay) {
        addNotif("🏋️", "Séance enregistrée — continue comme ça !");
      }
    };

    return (
      <><style>{CSS}</style>
      <AppMain
        appState={externalAppState}
        updateState={updateState}
        onLogout={onLogout}
        overrides={{
          addPost: wrappedAddPost,
          toggleLike,
          addComment,
          toggleFollow,
          sendMessage,
          saveSession: wrappedSaveSession,
          updateProfile,
          createChallenge,
          respondChallenge,
          deleteChallenge,
          createSoloChallenge,
          deleteSoloChallenge,
          deletePost: async (postId)=>{
            try{
              const {supabase:sb}=await import('./supabase.js');
              await sb.from('posts').delete().eq('id',postId);
            }catch(e){console.error('deletePost:',e);}
          },
        }}
      /></>
    );
  }

  // Show auth screens
  if (!isAuthenticated) {
    const { onSignUp, onSignIn, onLogout } = callbacks;
    return (
      <><style>{CSS}</style>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",background:"#0A0A0F",color:"#F0F0F0",width:"100%",maxWidth:430,margin:"0 auto",minHeight:"100vh"}}>
        {screen==="splash"&&<Splash goLogin={()=>setScreen("login")} goSignup={()=>setScreen("signup")}/>}
        {screen==="login"&&<SupabaseLogin onOk={onSignIn} goBack={()=>setScreen("splash")} goSignup={()=>setScreen("signup")}/>}
        {screen==="signup"&&<SupabaseSignup onOk={onSignUp} goBack={()=>setScreen("splash")}/>}
      </div></>
    );
  }
  return null;
}

// ── Supabase Login (calls supabase.auth.signInWithPassword) ──
function SupabaseLogin({ onOk, goBack, goSignup }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const go = async () => {
    setErr(""); setLoading(true);
    try { await onOk({ email, password: pw }); }
    catch(e) { setErr(e.message || "Erreur de connexion"); }
    setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",flexDirection:"column",padding:"env(safe-area-inset-top,44px) 24px 32px"}}>
      <button onClick={goBack} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,textAlign:"left",marginBottom:32}}>← RETOUR</button>
      <div className="si" style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{marginBottom:28}}><div style={{fontSize:28,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:4}}>Bon retour 💪</div><div style={{color:"#555",fontFamily:"'Barlow',sans-serif",fontSize:14}}>Reprends là où tu t'es arrêté.</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
          <div><div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:".09em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>Email</div><input className={`inp${err?" err":""}`} type="email" placeholder="ton@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div><div style={{fontSize:11,fontWeight:700,color:"#555",letterSpacing:".09em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>Mot de passe</div><input className={`inp${err?" err":""}`} type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        </div>
        {err&&<div style={{background:"#FF3D3D15",border:"1px solid #FF3D3D44",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#FF8080",fontSize:13,fontFamily:"'Barlow',sans-serif"}}>⚠️ {err}</div>}
        <button className="btn-r" onClick={go} disabled={loading}>{loading?"Connexion...":"SE CONNECTER"}</button>
        <div style={{textAlign:"center",marginTop:20,fontFamily:"'Barlow',sans-serif",fontSize:14,color:"#555"}}>Pas de compte ? <span onClick={goSignup} style={{color:"#FF3D3D",fontWeight:700,cursor:"pointer"}}>S'inscrire</span></div>
      </div>
    </div>
  );
}

// ── Supabase Signup ──
function SupabaseSignup({ onOk, goBack }) {
  const [step,setStep]=useState(0);const [errs,setErrs]=useState({});const [loading,setLoading]=useState(false);const [err,setErr]=useState("");
  const [f,setF]=useState({email:"",pseudo:"",password:"",confirm:"",age:"",sexe:"",poids:"",taille:"",country:"France",referralCode:""});
  const upd=(k,v)=>{setF(p=>({...p,[k]:v}));setErrs(p=>({...p,[k]:""}));};
  const validate=()=>{const e={};if(step===0){if(!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))e.email="Email invalide";if(!f.pseudo||f.pseudo.length<3)e.pseudo="3 chars min";if(/\s/.test(f.pseudo))e.pseudo="Pas d'espaces";if(!f.password||f.password.length<6)e.password="6 chars min";if(f.password!==f.confirm)e.confirm="Ne correspond pas";}if(step===1){const a=Number(f.age);if(!f.age||a<13||a>100)e.age="13-100";if(!f.sexe)e.sexe="Requis";}if(step===2){const p=Number(f.poids),t=Number(f.taille);if(!f.poids||p<30||p>300)e.poids="30-300kg";if(!f.taille||t<100||t>250)e.taille="100-250cm";}setErrs(e);return Object.keys(e).length===0;};
  const next=async()=>{
    if(!validate())return;
    if(step<2){setStep(s=>s+1);return;}
    setLoading(true);setErr("");
    try { await onOk({...f,country:f.country||"France"}); }
    catch(e){ setErr(e.message||"Erreur d'inscription"); }
    setLoading(false);
  };
  const lbl=(txt,k)=><div style={{fontSize:11,fontWeight:700,color:errs[k]?"#FF8080":"#555",letterSpacing:".09em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>{txt}{errs[k]&&<span style={{fontWeight:400,fontSize:11,textTransform:"none",letterSpacing:0,marginLeft:6}}>— {errs[k]}</span>}</div>;
  const imc=f.poids&&f.taille?(Number(f.poids)/((Number(f.taille)/100)**2)).toFixed(1):null;
  return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",flexDirection:"column",padding:"env(safe-area-inset-top,44px) 24px 32px"}}>
      <button onClick={step===0?goBack:()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,textAlign:"left",marginBottom:24}}>← {step===0?"RETOUR":"PRÉCÉDENT"}</button>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:24}}>{[0,1,2].map(i=><div key={i} className={`ps ${i===step?"cur":i<step?"dn":""}`} style={{width:i===step?36:24}}/>)}<span style={{marginLeft:6,fontSize:11,color:"#444",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{step+1}/3</span></div>
      <div key={step} className="su" style={{flex:1,display:"flex",flexDirection:"column"}}>
        <div style={{marginBottom:24}}><div style={{fontSize:26,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:4}}>{["Ton compte","Qui es-tu ?","Ton physique"][step]}</div></div>
        {step===0&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>{lbl("Email","email")}<input className={`inp${errs.email?" err":""}`} type="email" placeholder="ton@email.com" value={f.email} onChange={e=>upd("email",e.target.value)}/></div>
          <div>{lbl("Pseudo","pseudo")}<input className={`inp${errs.pseudo?" err":""}`} placeholder="tonpseudo" value={f.pseudo} onChange={e=>upd("pseudo",e.target.value)}/></div>
          <div>{lbl("Mot de passe","password")}<input className={`inp${errs.password?" err":""}`} type="password" placeholder="6 caractères min." value={f.password} onChange={e=>upd("password",e.target.value)}/></div>
          <div>{lbl("Confirmation","confirm")}<input className={`inp${errs.confirm?" err":""}`} type="password" placeholder="••••••••" value={f.confirm} onChange={e=>upd("confirm",e.target.value)}/></div>
        </div>}
        {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>{lbl("Âge","age")}<input className={`inp${errs.age?" err":""}`} type="number" placeholder="25" min="13" max="100" value={f.age} onChange={e=>upd("age",e.target.value)}/></div>
          <div>{lbl("Sexe","sexe")}<div style={{display:"flex",gap:10}}>{[["homme","👨 Homme"],["femme","👩 Femme"],["autre","🧑 Autre"]].map(([v,l])=><button key={v} className={`sx-b ${f.sexe===v?"on":""}`} onClick={()=>upd("sexe",v)}>{l}</button>)}</div>{errs.sexe&&<div style={{color:"#FF8080",fontSize:12,marginTop:5}}>⚠️ Requis</div>}</div>
        </div>}
        {step===2&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>{lbl("Poids","poids")}<div style={{position:"relative"}}><input className={`inp${errs.poids?" err":""}`} type="number" placeholder="75" value={f.poids} onChange={e=>upd("poids",e.target.value)} style={{paddingRight:40}}/><span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:13,pointerEvents:"none"}}>kg</span></div></div>
          <div>{lbl("Taille","taille")}<div style={{position:"relative"}}><input className={`inp${errs.taille?" err":""}`} type="number" placeholder="175" value={f.taille} onChange={e=>upd("taille",e.target.value)} style={{paddingRight:40}}/><span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:13,pointerEvents:"none"}}>cm</span></div></div>
          {imc&&<div style={{background:"#13131A",border:"1px solid #2A2A3A",borderRadius:10,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:"#666",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>IMC estimé</span><span style={{fontSize:22,fontWeight:900,color:Number(imc)<18.5||Number(imc)>30?"#FFD700":"#22C55E"}}>{imc}</span></div>}
          <div><div style={{fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:".09em",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>Pays (pour le classement)</div><select className="inp" value={f.country||"France"} onChange={e=>upd("country",e.target.value)} style={{cursor:"pointer"}}>{["France","Belgique","Suisse","Canada","Allemagne","Espagne","Italie","Royaume-Uni","États-Unis"].map(p=><option key={p} value={p}>{p}</option>)}</select></div>
          <div style={{marginTop:4}}>
            <div style={{fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:".09em",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>Code parrain (optionnel)</div>
            <input className="inp" placeholder="ex: ALX042" value={f.referralCode} onChange={e=>upd("referralCode",e.target.value.toUpperCase())} style={{letterSpacing:".12em",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16}}/>
            <div style={{fontSize:11,color:"#444",marginTop:4,fontFamily:"'Barlow',sans-serif"}}>Saisis le code d'un ami — ça lui rapproche du Premium 🎁</div>
          </div>
        </div>}
        {err&&<div style={{background:"#FF3D3D15",border:"1px solid #FF3D3D44",borderRadius:10,padding:"10px 14px",marginTop:12,color:"#FF8080",fontSize:13,fontFamily:"'Barlow',sans-serif"}}>⚠️ {err}</div>}
        <div style={{flex:1}}/>
        <button className="btn-r" onClick={next} disabled={loading} style={{marginTop:20}}>{loading?"Création...":step<2?"CONTINUER →":"CRÉER MON COMPTE 🚀"}</button>
      </div>
    </div>
  );
}

// ══════════════════════ APP MAIN ══
function AppMain({appState,updateState,onLogout,overrides={}}){
  const [tab,setTab]=useState("feed");
  const [viewProfile,setViewProfile]=useState(null);
  const [pendingConvTarget,setPendingConvTarget]=useState(null);
  const [viewPostGlobal,setViewPostGlobal]=useState(null);
  const [showNotifs,setShowNotifs]=useState(false);
  const [editProfileOpen,setEditProfileOpen]=useState(false);
  const [toasts,setToasts]=useState([]);

  const {user,stats,posts=[],programs=[],exercises={},sessionHistory=[],country="France",following=[],conversations=[]}=appState;
  const challenges=appState.challenges||[];
  const prevChallengesRef=useRef([]);
  useEffect(()=>{
    const prev=prevChallengesRef.current;
    const newPending=challenges.filter(ch=>ch.status==="pending"&&ch.opponentPseudo===user.pseudo&&!prev.some(p=>p.id===ch.id));
    newPending.forEach(ch=>addNotif("⚡",`@${ch.challengerPseudo} te lance un défi "${ch.title}" — va dans Social → Amis pour répondre !`));
    prevChallengesRef.current=challenges;
  },[challenges]);
  const rank=getRank(stats.points);
  const nextRank=getNextRank(stats.points);
  const rankPct=nextRank?((stats.points-rank.min)/(nextRank.min-rank.min))*100:100;
  const av=user.sexe==="femme"?"👩":user.sexe==="autre"?"🧑":"👨";
  const imc=user.poids&&user.taille?(Number(user.poids)/((Number(user.taille)/100)**2)).toFixed(1):null;

  const addToast=useCallback((t)=>{
    const id=genId();
    setToasts(p=>[...p,{...t,id}]);
    setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),3500);
  },[]);

  // Check trophy unlocks after stat change
  const checkTrophies=useCallback((newStats,prevStats,userObj)=>{
    TROPHIES.forEach(t=>{
      const wasUnlocked=t.condition(prevStats);
      const isUnlocked=t.condition(newStats);
      if(!wasUnlocked&&isUnlocked){
        addToast({icon:t.icon,title:`🏆 Trophée débloqué !`,msg:t.name,color:RC[t.rarity]});
        // Save date
        updateState(s=>({user:{...s.user,trophyDates:{...s.user.trophyDates,[t.id]:Date.now()}}}));
      }
    });
  },[addToast,updateState]);

  const sendMessage = overrides.sendMessage || _sendMessage;
  // XP helper: add XP + show toast + check trophies
  const addNotif=useCallback((icon,text)=>{
    const n={id:genId(),icon,text,ts:Date.now(),read:false};
    updateState(s=>({notifs:[n,...(s.notifs||[])].slice(0,50)}));
  },[updateState]);

  const giveXP=useCallback((amount,reason,icon="⚡")=>{
    addToast({icon,title:reason,msg:`+${amount} XP`,color:"#FBBF24",xp:amount});
    addNotif(icon,`${reason} — +${amount} XP`);
    updateState(s=>{
      const newStats={...s.stats,points:s.stats.points+amount};
      checkTrophies(newStats,s.stats,s.user);
      return {stats:newStats};
    });
  },[addToast,addNotif,updateState,checkTrophies]);

  const _addPost=p=>{
    const newPost={...p,id:genId(),userId:"me",pseudo:user.pseudo,avatarVal:user.avatar||"",avatarFallback:av,rankTier:getRank(stats.points).tier,rankName:getRank(stats.points).name,rankColor:getRank(stats.points).color,rankIcon:getRank(stats.points).icon,points:stats.points,ts:Date.now(),likes:[],commentsList:[],imgPos:p.imgPos||"center"};
    updateState(s=>{
      const newStats={...s.stats,posts:s.stats.posts+1};
      checkTrophies(newStats,s.stats,s.user);
      return {posts:[newPost,...s.posts],stats:newStats};
    });
  };
  const addPost = overrides.addPost || _addPost;

  const _toggleLike=id=>{
    updateState(s=>{
      const post=s.posts.find(p=>p.id===id);
      if(!post)return {};
      const nowLiked=!post.liked;
      return {posts:s.posts.map(p=>p.id!==id?p:{...p,liked:nowLiked,likes:nowLiked?[...p.likes,"me"]:p.likes.filter(x=>x!=="me")})};
    });
  };
  const toggleLike = (id) => {
    // Optimistic update: flip liked state and count immediately
    updateState(s=>({posts:s.posts.map(p=>{
      if(p.id!==id)return p;
      const nowLiked=!p.liked;
      const newLikes=nowLiked?[...p.likes,"me"]:p.likes.filter(x=>x!=="me");
      return {...p,liked:nowLiked,likes:newLikes};
    })}));
    // Then sync to Supabase (overrides.toggleLike reloads feed after)
    if(overrides.toggleLike) overrides.toggleLike(id);
  };

  const _addComment=(postId,text)=>{
    updateState(s=>{
      const post=s.posts.find(p=>p.id===postId);
      const newStats={...s.stats,commentsSent:(s.stats.commentsSent||0)+1};
      checkTrophies(newStats,s.stats,s.user);
      // Add notif if someone else commented on your post (userId!=="me" means other person's post—but
      // in a single-user prototype we skip self-notif)
      const newComment={id:genId(),pseudo:s.user.pseudo,avatarVal:s.user.avatar||"",avatarFallback:av,text,ts:Date.now()};
      return {
        posts:s.posts.map(p=>p.id!==postId?p:{...p,commentsList:[...(p.commentsList||[]),newComment]}),
        stats:newStats
      };
    });
  };

  const addComment = overrides.addComment || _addComment;
  const toggleFollow=(uid)=>{
    if(overrides.toggleFollow){
      // Supabase mode — App.jsx handles optimistic + sync
      overrides.toggleFollow(uid);
    } else {
      // Local mode
      updateState(s=>({following:s.following.some(f=>f.id===uid)?s.following.filter(f=>f.id!==uid):[...s.following,{id:uid,pseudo:'',avatarUrl:'',points:0}]}));
    }
  };

  const _sendMessage=(toId,toPseudo,toAvatarVal,toAvatarFb,text)=>{
    if(toId==="me"||toPseudo===user.pseudo)return; // no self-messaging
    updateState(s=>{
      const convs=[...(s.conversations||[])];
      let ci=convs.findIndex(c=>c.withId===toId);
      const msg={id:genId(),from:"me",text,ts:Date.now()};
      if(ci===-1)convs.push({id:genId(),withId:toId,withPseudo:toPseudo,avatarVal:toAvatarVal,avatarFallback:toAvatarFb,messages:[msg]});
      else convs[ci]={...convs[ci],messages:[...convs[ci].messages,msg]};
      return {conversations:convs};
    });
  };

  // Save session result
  const _saveSession=useCallback((dayName,programName,result,durationSec)=>{
    const now=Date.now();
    const hour=new Date(now).getHours();
    const dayOfWeek=new Date(now).getDay();
    const isEarly=hour<7;
    const isNight=hour>=22;
    const isWeekend=dayOfWeek===0||dayOfWeek===6;
    // Compute isNewDay from current sessionHistory (for XP gate)
    const today=new Date().toDateString();
    const lastSH=appState.sessionHistory&&appState.sessionHistory.length>0?new Date(appState.sessionHistory[0].date).toDateString():null;
    const isNewDayXP=lastSH!==today;
    const newExercises={...exercises};
    let prCount=0;
    result.forEach(ex=>{
      if(!ex.sets||ex.sets.length===0)return;
      if(!newExercises[ex.name])newExercises[ex.name]=[];
      newExercises[ex.name].push({date:now,sets:ex.sets});
      // Count PR only on big exercises
      if(PR_EXERCISES.includes(ex.name)){
        const prev=newExercises[ex.name].slice(0,-1);
        const prevMax=prev.flatMap(h=>h.sets.map(s=>s.weight)).reduce((a,b)=>Math.max(a,b),-1);
        const curMax=ex.sets.map(s=>s.weight).reduce((a,b)=>Math.max(a,b),-1);
        if(curMax>prevMax&&prevMax>=0)prCount++;
      }
    });
    const historyEntry={id:genId(),date:now,dayName,programName,durationSec,exercises:result.map(e=>({name:e.name,sets:e.sets}))};
    updateState(s=>{
      const prevStats=s.stats;
      // Limit trophy session count to 1 per calendar day
      const today=new Date().toDateString();
      const lastSessionDate=s.sessionHistory&&s.sessionHistory.length>0?new Date(s.sessionHistory[0].date).toDateString():null;
      const isNewDay=lastSessionDate!==today;
      const newStats={
        ...prevStats,
        sessions:prevStats.sessions+(isNewDay?1:0), // only +1 per day for trophies
        prs:prevStats.prs+prCount,
        earlySession:prevStats.earlySession||isEarly,
        nightSession:prevStats.nightSession||isNight,
        weekendSessions:(prevStats.weekendSessions||0)+(isWeekend&&isNewDay?1:0),
      };
      checkTrophies(newStats,prevStats,s.user);
      return {exercises:newExercises,stats:newStats,sessionHistory:[historyEntry,...(s.sessionHistory||[])]};
    });
    // XP — only award once per calendar day
    if(isNewDayXP){
      giveXP(50,"Séance complétée !","🏋️");
      if(isEarly)giveXP(75,"Séance Early Bird 🌅","🌅");
    }
    if(prCount>0){
      giveXP(prCount*150,prCount+" nouveau"+(prCount>1?"x":"")+" PR !","💪");
      addToast({icon:"💪",title:"PR battu !",msg:"Nouveau record personnel !",color:"#F59E0B"});
    }
  },[exercises,appState,updateState,checkTrophies,giveXP,addToast]);

  const saveSession = overrides.saveSession || _saveSession;

  // Listen for message send events from MessagesTab (Supabase bridge)
  useEffect(()=>{
    const handler=(e)=>{
      const {toId,toPseudo,avatarVal,avatarFb,text}=e.detail||{};
      if(toId&&text) sendMessage(toId,toPseudo,avatarVal,avatarFb,text);
    };
    window.addEventListener("gymbro_sendmsg",handler);
    return()=>window.removeEventListener("gymbro_sendmsg",handler);
  },[sendMessage]);

  return(
    <div style={{fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",background:"#0A0A0F",color:"#F0F0F0",width:"100%",maxWidth:430,margin:"0 auto",minHeight:"100vh",position:"relative",overflowX:"hidden",letterSpacing:".02em"}}>
      <Toast toasts={toasts}/>
      {/* Header */}
      <div style={{background:"#0A0A0FEE",backdropFilter:"blur(14px)",padding:"max(env(safe-area-inset-top,0px),12px) 16px 8px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,borderBottom:"1px solid #1A1A24"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:24,fontWeight:900,color:"#FF3D3D",letterSpacing:"-.01em",fontFamily:"'Barlow Condensed',sans-serif"}}>GYM</span>
          <span style={{fontSize:24,fontWeight:900,color:"#F0F0F0",letterSpacing:"-.01em",fontFamily:"'Barlow Condensed',sans-serif"}}>BRO</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <RankBadge tier={rank.tier} size={24}/>
            <span style={{fontSize:12,fontWeight:800,color:rank.color}}>{rank.name}</span>
          </div>
          <div style={{position:"relative",cursor:"pointer"}} onClick={()=>setShowNotifs(true)}>
            <div style={{width:32,height:32,borderRadius:10,background:"#13131A",border:"1px solid #1E1E2E",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <div style={{position:"absolute",top:3,right:3,width:7,height:7,borderRadius:"50%",background:"#FF3D3D",border:"2px solid #0A0A0F"}}/>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sa" style={{height:"calc(100vh - 56px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 56px)",paddingBottom:16}}>
        {tab==="feed"     && <FeedTab appState={appState} updateState={updateState} addPost={addPost} onOpenProfile={p=>setViewProfile(p)} toggleLike={toggleLike} addComment={addComment} toggleFollow={toggleFollow} following={following} av={av} myPseudo={user.pseudo} myAvatarVal={user.avatar||""}/>}
        {tab==="messages" && <MessagesTab conversations={conversations} user={user} av={av} updateState={updateState} appState={appState} overrides={overrides} onOpenProfile={p=>setViewProfile(p)} pendingConvTarget={pendingConvTarget} onConvOpened={()=>setPendingConvTarget(null)}/>}
        {tab==="program"  && <ProgramTab appState={appState} updateState={updateState} saveSession={saveSession}/>}
        {tab==="trophies" && <TrophiesTab stats={stats} user={user} updateState={updateState}/>}
        {tab==="ranked"   && <RankedTab appState={{...appState,_openProfile:(p)=>setViewProfile(p)}} updateState={updateState} rank={rank} nextRank={nextRank} rankPct={rankPct} stats={stats} giveXP={giveXP}/>}
        {tab==="profile"  && <ProfileTab appState={appState} updateState={updateState} rank={rank} imc={imc} av={av} onEdit={()=>setEditProfileOpen(true)} onLogout={onLogout} posts={posts} checkTrophies={checkTrophies} deletePost={overrides.deletePost} onOpenPost={(p)=>setViewPostGlobal(p)} overrides={overrides}/>}
      </div>

      {/* Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#0A0A0F",borderTop:"1px solid #1A1A24",display:"flex",padding:`0 0 calc(env(safe-area-inset-bottom,0px) + 4px)`,zIndex:100}}>
        {[
          {id:"feed",    label:"Feed",     icon:(a)=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#FF3D3D":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
          {id:"messages",label:"Social", icon:(a)=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#FF3D3D":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
          {id:"program", label:"Séance",   icon:(a)=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#FF3D3D":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
          {id:"trophies",label:"Trophées", icon:(a)=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#FF3D3D":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>},
          {id:"ranked",  label:"Ranked",   icon:(a)=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#FF3D3D":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>},
          {id:"profile", label:"Profil",   icon:(a)=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a?"#FF3D3D":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>},
        ].map(n=>(
          <button key={n.id} className="nav-i" onClick={()=>setTab(n.id)}>
            {n.icon(tab===n.id)}
            <div style={{fontSize:8,fontWeight:800,color:tab===n.id?"#FF3D3D":"#444",letterSpacing:".04em",textTransform:"uppercase"}}>{n.label}</div>
          </button>
        ))}
      </div>

      {/* Notifications */}
      {showNotifs&&(
        <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={()=>setShowNotifs(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div style={{padding:"0 18px"}}>
              <div style={{fontSize:18,fontWeight:900,marginBottom:14}}>Notifications</div>
              {(appState.notifs||[]).length===0&&(
                <div style={{textAlign:"center",padding:"30px 0",color:"#444"}}>
                  <div style={{fontSize:36,marginBottom:8}}>🔔</div>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>Aucune notification</div>
                  <div style={{fontSize:12,fontFamily:"'Barlow',sans-serif"}}>Les likes et commentaires sur tes posts apparaîtront ici.</div>
                </div>
              )}
              {(appState.notifs||[]).map(n=>(
                <div key={n.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:"1px solid #1A1A24"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"#1A1A24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{n.icon}</div>
                  <div style={{flex:1,fontSize:13,fontFamily:"'Barlow',sans-serif",color:"#CCC",lineHeight:1.4,wordBreak:"break-word"}}>{n.text}</div>
                  <div style={{color:"#444",fontSize:11,flexShrink:0}}>{timeSince(n.ts)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editProfileOpen&&<EditProfileModal user={user} onClose={()=>setEditProfileOpen(false)} onSave={u=>{
        // Update via overrides.updateProfile if available (Supabase mode), else local
        if(overrides.updateProfile){
          overrides.updateProfile(u).then(()=>setEditProfileOpen(false));
        } else {
          updateState(s=>({
            user:{...s.user,...u},
            posts:s.posts.map(p=>p.userId==="me"?{...p,avatarVal:u.avatar||p.avatarVal,pseudo:u.pseudo||p.pseudo}:p)
          }));
        }
      }}/>}
      {/* Profile overlay — uses viewport units to guarantee full screen */}
      {viewProfile&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,width:"100vw",height:"100vh",background:"#0A0A0F",zIndex:999,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
          <FullUserProfile post={viewProfile} posts={posts} following={following} toggleFollow={toggleFollow}
              onClose={()=>setViewProfile(null)}
              onMessage={(id,p,av,fb)=>{
                // Create conversation if not exists
                updateState(s=>{
                  const exists=(s.conversations||[]).some(cv=>cv.withId===id||cv.id===id);
                  if(!exists){
                    const newConv={id,withId:id,withPseudo:p,avatarVal:av,avatarFallback:fb,messages:[]};
                    return{conversations:[...(s.conversations||[]),newConv]};
                  }
                  return s;
                });
                setPendingConvTarget({id,pseudo:p,avatarVal:av,avatarFallback:fb});
                setViewProfile(null);
                setTab("messages");
              }}
              myPseudo={user.pseudo} av={av} userAvatar={user.avatar}
              myStats={stats} myUser={user} appState={appState}
              onOpenPost={(p)=>setViewPostGlobal(p)}/>
        </div>
      )}
      {/* Global PostViewModal — zIndex:1100 above profile overlay (999) */}
      {viewPostGlobal&&<PostViewModal
        post={viewPostGlobal}
        onClose={()=>setViewPostGlobal(null)}
        toggleLike={()=>{if(overrides.toggleLike)overrides.toggleLike(viewPostGlobal.id);setViewPostGlobal(p=>p?{...p,liked:!p.liked,likes:!p.liked?[...p.likes,"x"]:p.likes.slice(1)}:null);}}
        addComment={addComment}
        myPseudo={user.pseudo} myAvatarVal={user.avatar||""} av={av}
        onDelete={overrides.deletePost?(postId)=>{updateState(s=>({posts:s.posts.filter(p=>p.id!==postId)}));overrides.deletePost(postId);}:null}
        zIndex={1100}
      />}
    </div>
  );
}

// ══════════════════════ FEED ══
function FeedTab({appState,updateState,addPost,onOpenProfile,toggleLike,addComment,toggleFollow,following,av,myPseudo,myAvatarVal}){
  const {posts=[]}=appState;
  const [feedTab,setFeedTab]=useState("discover");
  const [search,setSearch]=useState("");
  const [rankFilter,setRankFilter]=useState("all");
  const [commentPostId,setCommentPostId]=useState(null);
  const [commentText,setCommentText]=useState("");
  const [showCreate,setShowCreate]=useState(false);
  const commentRef=useRef(null);

  const filtered=posts.filter(p=>{
    if(feedTab==="following"&&(p.userId==="me"||!following.some(f=>f.id===p.userId)))return false;
    if(search){const q=search.toLowerCase();if(!p.caption?.toLowerCase().includes(q)&&!p.pseudo?.toLowerCase().includes(q)&&!(p.tags||[]).some(t=>t.toLowerCase().includes(q)))return false;}
    if(rankFilter!=="all"){const tier=(p.rankTier||(p.rankName||"").split(" ")[0].toLowerCase()||"silver");if(tier!==rankFilter)return false;}
    return true;
  });

  const submitComment=()=>{
    if(!commentText.trim()||!commentPostId)return;
    addComment(commentPostId,commentText.trim());
    setCommentText("");
  };

  return(
    <div>
      <div style={{padding:"8px 14px 6px",borderBottom:"1px solid #1A1A24"}}>
        <div style={{position:"relative",marginBottom:8}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input className="inp" placeholder="#tags, @utilisateurs..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:32,fontSize:13,padding:"9px 12px 9px 30px"}}/>
        </div>
        <div style={{display:"flex"}}>
          <button className={`tab-b ${feedTab==="following"?"on":""}`} onClick={()=>setFeedTab("following")}>Abonnements</button>
          <button className={`tab-b ${feedTab==="discover"?"on":""}`} onClick={()=>setFeedTab("discover")}>Découvrir</button>
        </div>
      </div>
      <div style={{padding:"8px 0 6px",display:"flex",gap:5,overflowX:"auto",paddingLeft:14,paddingRight:14}}>
        {[["all","Tous"],["silver","Argent"],["gold","Or"],["platinum","Platine"],["diamond","Diamant"],["emerald","Émeraude"],["elite","Élite"]].map(([v,l])=>(
          <button key={v} className={`pill${rankFilter===v?" on":""}`} onClick={()=>setRankFilter(v)}>{l.toUpperCase()}</button>
        ))}
      </div>
      <div style={{padding:"4px 14px"}}>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"50px 20px",color:"#444"}}>
            <div style={{fontSize:44,marginBottom:10}}>📭</div>
            <div style={{fontSize:17,fontWeight:800,marginBottom:5}}>{feedTab==="following"?"Aucun post":"Aucun résultat"}</div>
            <div style={{fontSize:12,color:"#333",fontFamily:"'Barlow',sans-serif",marginBottom:18}}>{feedTab==="following"?"Suis des personnes ou publie !":"Essaie d'autres mots-clés"}</div>
            <button className="btn-r" onClick={()=>setShowCreate(true)} style={{width:"auto",padding:"11px 22px"}}>+ Créer un post</button>
          </div>
        )}
        {filtered.map((post,i)=>(
          <PostCard key={post.id} post={post} i={i} onProfile={()=>onOpenProfile(post)} toggleLike={()=>toggleLike(post.id)} onComment={()=>{setCommentPostId(post.id);setTimeout(()=>commentRef.current?.focus(),200);}} following={following} toggleFollow={()=>toggleFollow(post.userId)} isMe={post.userId==="me"}/>
        ))}
      </div>
      <button onClick={()=>setShowCreate(true)} style={{position:"fixed",bottom:"calc(env(safe-area-inset-bottom,0px) + 64px)",right:"calc(50% - 210px + 14px)",width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#FF3D3D,#FF6B00)",border:"none",color:"#FFF",fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(255,61,61,.35)",zIndex:90}}>+</button>

      {commentPostId&&(
        <div className="modal-center" onClick={()=>{setCommentPostId(null);setCommentText("");}} style={{alignItems:"center",zIndex:500}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#13131A",borderRadius:20,width:"calc(100% - 32px)",maxWidth:390,maxHeight:"78vh",display:"flex",flexDirection:"column",border:"1px solid #2A2A3A",boxShadow:"0 8px 40px #000000CC",animation:"scaleIn .25s cubic-bezier(.34,1.56,.64,1)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 16px 12px",borderBottom:"1px solid #1E1E28",flexShrink:0}}>
              <div style={{fontWeight:900,fontSize:16}}>Commentaires</div>
              <button onClick={()=>{setCommentPostId(null);setCommentText("");}} style={{background:"none",border:"none",color:"#666",fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
            </div>
            <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"12px 16px",minHeight:0}}>
              {(posts.find(p=>p.id===commentPostId)?.commentsList||[]).length===0
                ?<div style={{color:"#444",textAlign:"center",padding:"28px 0",fontSize:13}}>Aucun commentaire. Sois le premier !</div>
                :(posts.find(p=>p.id===commentPostId)?.commentsList||[]).map(cm=>(
                  <div key={cm.id} style={{display:"flex",gap:9,marginBottom:14}}>
                    <Avatar val={cm.avatarVal||""} fallback={cm.avatarFallback||"👤"} size={30} border="#2A2A3A"/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:12,marginBottom:3,color:"#E0E0E0"}}>@{cm.pseudo}</div>
                      <div style={{color:"#CCC",fontSize:13,fontFamily:"'Barlow',sans-serif",lineHeight:1.45,wordBreak:"break-word"}}>{cm.text}</div>
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{display:"flex",gap:8,padding:"10px 14px 14px",borderTop:"1px solid #1E1E28",flexShrink:0}}>
              <Avatar val={myAvatarVal} fallback={av} size={30} border="#2A2A3A"/>
              <textarea ref={commentRef} className="inp" placeholder="Commenter..." value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}} rows={2} style={{flex:1,fontSize:13,padding:"9px 11px",resize:"none",lineHeight:1.4,fontFamily:"'Barlow',sans-serif",minHeight:38,maxHeight:80}}/>
              <button onClick={submitComment} disabled={!commentText.trim()} style={{background:"#FF3D3D",border:"none",color:"#FFF",borderRadius:10,padding:"0 13px",cursor:"pointer",fontWeight:800,fontSize:16,alignSelf:"flex-end",height:38,flexShrink:0}}>→</button>
            </div>
          </div>
        </div>
      )}
      {showCreate&&<CreatePostModal onClose={()=>setShowCreate(false)} onSubmit={async p=>{await addPost(p);setShowCreate(false);}}/>}
    </div>
  );
}

function PostCard({post,i,onProfile,toggleLike,onComment,following,toggleFollow,isMe}){
  const [showShare,setShowShare]=useState(false);
  const isFollowing=following.some(f=>f.id===post.userId);
  return(
    <div className="fu" style={{marginBottom:18,animationDelay:`${Math.min(i,.5)*0.06}s`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",flex:1,minWidth:0}} onClick={onProfile}>
          <Avatar val={post.avatarVal||""} fallback={post.avatarFallback||"👤"} size={36} border={(post.rankColor||"#444")+"77"}/>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:800,fontSize:14,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span>@{post.pseudo}</span>
              {post.isInfluencer&&<span style={{background:"#FF3D3D1A",color:"#FF6B6B",fontSize:9,fontWeight:800,padding:"2px 5px",borderRadius:4,letterSpacing:".04em"}}>✓ PRO</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
              <RankBadge tier={post.rankTier||"silver"} size={14}/>
              <span style={{fontSize:11,color:post.rankColor||"#888",fontWeight:700}}>{post.rankName||"Silver I"}</span>
              <span style={{color:"#222",fontSize:10}}>·</span>
              <span style={{fontSize:11,color:"#444"}}>{timeSince(post.ts)}</span>
            </div>
          </div>
        </div>
        {!isMe&&<button onClick={e=>{e.stopPropagation();toggleFollow();}} style={{background:isFollowing?"#1A1A24":"#FF3D3D22",border:`1px solid ${isFollowing?"#333":"#FF3D3D66"}`,color:isFollowing?"#888":"#FF3D3D",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,marginLeft:6}}>{isFollowing?"✓ Suivi":"+Follow"}</button>}
      </div>
      {post.mediaUrl&&<div style={{borderRadius:11,overflow:"hidden",marginBottom:8,background:"#0D0D14"}}>
        {post.isVideo?<video src={post.mediaUrl} style={{width:"100%",maxHeight:300,objectFit:"cover",display:"block"}} controls/>:<img src={post.mediaUrl} alt="" style={{width:"100%",maxHeight:340,objectFit:"cover",objectPosition:post.imgPos||"center",display:"block"}}/>}
      </div>}
      {post.caption&&<p style={{margin:"0 0 8px",fontSize:13,color:"#CCC",lineHeight:1.45,fontFamily:"'Barlow',sans-serif",wordBreak:"break-word"}}>
        <span style={{fontWeight:700,color:"#F0F0F0"}}>@{post.pseudo} </span>{post.caption}
        {post.tags?.length>0&&<span style={{color:"#FF3D3D"}}>{" "}{post.tags.map(t=>`#${t}`).join(" ")}</span>}
      </p>}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <button onClick={toggleLike} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:post.liked?"#FF3D3D":"#666",fontSize:13,fontWeight:700,fontFamily:"inherit"}}><span style={{fontSize:15}}>{post.liked?"❤️":"🤍"}</span>{post.likes.length}</button>
        <button onClick={onComment} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:"#666",fontSize:13,fontWeight:700,fontFamily:"inherit"}}><span style={{fontSize:15}}>💬</span>{(post.commentsList||[]).length}</button>
        <button onClick={()=>setShowShare(!showShare)} style={{background:"none",border:"none",cursor:"pointer",color:"#666",fontSize:15,marginLeft:"auto"}}>🔗</button>
      </div>
      {showShare&&<div style={{background:"#13131A",borderRadius:9,padding:"9px 12px",marginTop:7,display:"flex",gap:8}}>
        {["📋 Copier","💌 Envoyer","📤 Partager"].map(a=><button key={a} style={{flex:1,background:"#1A1A24",border:"1px solid #2A2A3A",color:"#CCC",padding:"7px 4px",borderRadius:7,fontSize:10,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setShowShare(false)}>{a}</button>)}
      </div>}
      <div style={{height:1,background:"#1A1A24",marginTop:12}}/>
    </div>
  );
}

function CreatePostModal({onClose,onSubmit}){
  const [caption,setCaption]=useState(""); const [tags,setTags]=useState(""); const [isVideo,setIsVideo]=useState(false); const [mediaPreview,setMediaPreview]=useState(null); const [loading,setLoading]=useState(false); const [imgPos,setImgPos]=useState("center");
  const fileRef=useRef();
  const handleFile=e=>{
    const file=e.target.files[0]; if(!file)return;
    setIsVideo(file.type.startsWith("video/"));
    const reader=new FileReader();
    reader.onload=ev=>setMediaPreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const submit=async()=>{
    if(loading)return;
    setLoading(true);
    try{
      const tagArr=tags.split(/[^\w#]+/).map(t=>t.replace(/^#/,"")).filter(Boolean);
      await onSubmit({caption,tags:tagArr,mediaUrl:mediaPreview,isVideo,imgPos});
    }catch(e){
      console.error("Post submit error:",e);
    }finally{
      setLoading(false);
    }
  };
  return(
    <div className="modal-center" onClick={onClose} style={{alignItems:"center",zIndex:500}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#13131A",borderRadius:20,width:"calc(100% - 32px)",maxWidth:390,maxHeight:"80vh",display:"flex",flexDirection:"column",border:"1px solid #2A2A3A",boxShadow:"0 8px 40px #000000CC",animation:"scaleIn .25s cubic-bezier(.34,1.56,.64,1)"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 16px 12px",borderBottom:"1px solid #1E1E28",flexShrink:0}}>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#666",fontSize:20,cursor:"pointer",lineHeight:1,width:32}}>✕</button>
          <div style={{fontSize:16,fontWeight:900}}>Nouveau post</div>
          <button onClick={submit} disabled={(!caption.trim()&&!mediaPreview)||loading}
            style={{background:(!caption.trim()&&!mediaPreview)||loading?"#333":"linear-gradient(135deg,#FF3D3D,#FF6B00)",border:"none",color:"#FFF",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
            {loading?"⏳":"Publier 🚀"}
          </button>
        </div>
        {/* Scrollable body */}
        <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 16px 18px",flex:1}}>
          {/* Photo zone: tap to pick, then drag/pinch hint */}
          <div style={{position:"relative",borderRadius:12,overflow:"hidden",marginBottom:10,background:"#0D0D14",aspectRatio:"1",border:"2px dashed #2A2A3A",cursor:"pointer"}}
            onClick={()=>!mediaPreview&&fileRef.current.click()}>
            {mediaPreview
              ?(isVideo
                ?<video src={mediaPreview} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                :<img src={mediaPreview} alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:imgPos}}/>)
              :<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",color:"#444"}}>
                <div style={{fontSize:36,marginBottom:6}}>📷</div>
                <div style={{fontSize:12,fontFamily:"'Barlow',sans-serif"}}>Ajouter une photo / vidéo</div>
              </div>}
            {mediaPreview&&!isVideo&&(
              <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,#000000AA)",padding:"20px 10px 8px",display:"flex",justifyContent:"center",gap:6}}>
                {[["center","⬜ Centre"],["top","⬆️ Haut"],["bottom","⬇️ Bas"]].map(([pos,lbl])=>(
                  <button key={pos} onClick={e=>{e.stopPropagation();setImgPos(pos);}} style={{background:imgPos===pos?"#FF3D3D":"rgba(0,0,0,.6)",border:`1px solid ${imgPos===pos?"#FF3D3D":"#444"}`,color:"#FFF",borderRadius:6,padding:"3px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>{lbl}</button>
                ))}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" style={{display:"none"}} onChange={handleFile}/>
          {mediaPreview&&<button onClick={e=>{e.stopPropagation();setMediaPreview(null);}} style={{background:"none",border:"1px solid #FF3D3D44",color:"#FF6060",borderRadius:7,padding:"3px 9px",fontSize:11,cursor:"pointer",fontFamily:"inherit",marginBottom:10,display:"block"}}>✕ Retirer</button>}
          <textarea className="inp" placeholder="Décris ta séance..." value={caption} onChange={e=>setCaption(e.target.value)} rows={3} style={{resize:"none",marginBottom:9,lineHeight:1.5,fontFamily:"'Barlow',sans-serif"}}/>
          <input className="inp" placeholder="#tag1 #tag2" value={tags} onChange={e=>setTags(e.target.value)} style={{fontSize:13}}/>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════ FULL USER PROFILE ══
function FullUserProfile({post,posts,following,toggleFollow,onClose,onMessage,myPseudo,av,userAvatar,myStats,myUser,appState,onOpenPost}){
  const isMe=post.userId==="me"||post.pseudo===myPseudo;
  // Define userPosts FIRST so it can be used in displayStats
  const userPosts=posts.filter(p=>p.pseudo===post.pseudo&&p.mediaUrl);
  const displayUser=isMe&&myUser?myUser:null;
  // For own profile use real stats; for others use post snapshot + profile data attached to post
  const [fetchedProfile,setFetchedProfile]=useState(null);
  useEffect(()=>{
    if(isMe||!post.userId||post.userId==="me")return;
    import('./supabase.js').then(({supabase:sb})=>{
      // Fetch profile stats
      sb.from('profiles').select('sessions,prs,points,pseudo,avatar_url').eq('id',post.userId).maybeSingle()
        .then(({data})=>{ if(data) setFetchedProfile(p=>({...p,...data})); });
      // Fetch exercise records for PR display
      sb.from('session_history').select('exercises').eq('user_id',post.userId).order('created_at',{ascending:false}).limit(50)
        .then(({data})=>{
          if(!data)return;
          const exMap={};
          data.forEach(row=>{
            (row.exercises||[]).forEach(ex=>{
              if(!exMap[ex.name])exMap[ex.name]=[];
              exMap[ex.name].push(...(ex.sets||[]));
            });
          });
          setFetchedProfile(p=>({...p,exercises:exMap}));
        });
    }).catch(()=>{});
  },[post.userId,isMe]);

  const displayStats=isMe&&myStats?myStats:{
    sessions:fetchedProfile?.sessions||0,
    prs:fetchedProfile?.prs||0,
    points:fetchedProfile?.points||post.points||0,
    earlySession:false,nightSession:false,weekendSessions:0,
    posts:userPosts.length,streak:0,totalLikes:0,
    followers:0,following:0,commentsSent:0,changedCountry:false
  };
  const otherExercises=fetchedProfile?.exercises||{};
  const liveRank=getRank(displayStats.points);
  const rank=isMe&&myStats?liveRank:{name:post.rankName||"Silver I",color:post.rankColor||"#94A3B8",icon:post.rankIcon||"🥈",tier:post.rankTier||"silver"};
  const isFollowing=following.some(f=>f.id===post.userId);
  const [profTab,setProfTab]=useState("posts");
  const [viewPost,setViewPost]=useState(null);
  const unlocked=TROPHIES.filter(t=>t.condition(displayStats));
  // For own profile: use real pinned trophies. For others: use data from post._profilePinnedTrophies
  const pinnedIds=isMe?(displayUser?.pinnedTrophies||[]):(post._profilePinnedTrophies||[]);
  const pinnedTrophies=pinnedIds.map(id=>TROPHIES.find(t=>t.id===id)).filter(Boolean);
  return(
    <div style={{position:"fixed",inset:0,background:"#0A0A0F",zIndex:300,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"max(env(safe-area-inset-top,0px),14px) 16px 10px",borderBottom:"1px solid #1A1A24",background:"#0A0A0F",position:"sticky",top:0,zIndex:10}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#888",fontSize:22,cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center"}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{fontSize:16,fontWeight:900}}>@{post.pseudo}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4}}>
          <RankBadge tier={rank.tier} size={20}/>
          <span style={{fontSize:12,fontWeight:800,color:rank.color}}>{rank.name}</span>
        </div>
      </div>
      <div style={{padding:"16px 16px 80px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
          <Avatar val={post.avatarVal||""} fallback={post.avatarFallback||"👤"} size={72} border={rank.color}/>
          {!isMe&&<div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={()=>toggleFollow(post.userId)} style={{background:isFollowing?"#1A1A24":"#FF3D3D",border:isFollowing?"1px solid #333":"none",color:"#FFF",padding:"8px 18px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{isFollowing?"✓ Suivi":"+Follow"}</button>
            <button onClick={()=>onMessage(post.userId,post.pseudo,post.avatarVal||"",post.avatarFallback||"👤")} style={{background:"#1A1A24",border:"1px solid #2A2A3A",color:"#CCC",padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>💬 Message</button>
          </div>}
        </div>
        <div style={{fontSize:18,fontWeight:900,marginBottom:4,color:"#F0F0F0"}}>@{post.pseudo}</div>
        <span className="rb" style={{background:rank.color+"22",color:rank.color,marginBottom:10,display:"inline-flex"}}>{rank.icon} {rank.name} · {displayStats.points.toLocaleString()} XP</span>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginTop:12,marginBottom:14}}>
          {[
            {l:"Posts",v:userPosts.length},
            {l:"Séances",v:displayStats.sessions},
            {l:"XP",v:displayStats.points.toLocaleString()}
          ].map((s,i)=>(
            <div key={i} style={{background:"#0D0D14",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontSize:16,fontWeight:900,color:"#F0F0F0"}}>{s.v}</div>
              <div style={{color:"#888",fontSize:10,fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>
        {(pinnedTrophies.length>0||unlocked.length>0)&&<div style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:800,marginBottom:8,color:"#E0E0E0"}}>
            {pinnedTrophies.length>0?"TROPHÉES ÉPINGLÉS":"TROPHÉES"}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {(pinnedTrophies.length>0?pinnedTrophies:unlocked.slice(0,9)).map(t=>(
              <div key={t.id} title={t.name} style={{width:38,height:38,borderRadius:9,background:RC[t.rarity]+"18",border:`1px solid ${RC[t.rarity]}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{t.icon}</div>
            ))}
            {pinnedTrophies.length===0&&unlocked.length>9&&<div style={{width:38,height:38,borderRadius:9,background:"#13131A",border:"1px solid #2A2A3A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#888",fontWeight:700}}>+{unlocked.length-9}</div>}
          </div>
        </div>}
        <div style={{display:"flex",borderBottom:"1px solid #1E1E28",marginBottom:10}}>
          {["posts","stats","PRs"].map(t=><button key={t} className={`tab-b ${profTab===t?"on":""}`} onClick={()=>setProfTab(t)} style={{textTransform:"uppercase"}}>{t}</button>)}
        </div>
        {profTab==="posts"&&(userPosts.length===0
          ?<div style={{textAlign:"center",padding:"24px 0",color:"#444",fontSize:13}}>Aucun post.</div>
          :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3}}>
            {userPosts.map(p=>(
              <div key={p.id} onClick={()=>onOpenPost?onOpenPost(p):setViewPost(p)} style={{aspectRatio:"1",borderRadius:4,overflow:"hidden",background:"#13131A",cursor:"pointer",position:"relative"}}>
                {p.isVideo?<video src={p.mediaUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<img src={p.mediaUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                {p.isVideo&&<div style={{position:"absolute",top:4,right:4,fontSize:10,color:"#FFF",background:"rgba(0,0,0,.5)",borderRadius:3,padding:"1px 4px"}}>▶</div>}
              </div>
            ))}
          </div>)}
        {profTab==="stats"&&(
          <div style={{padding:"4px 0"}}>
            {(()=>{
              const sourceExercises=isMe&&appState?appState.exercises:otherExercises;
              const entries=Object.entries(sourceExercises||{});
              if(entries.length===0)return <div style={{textAlign:"center",padding:"32px 0",color:"#444"}}><div style={{fontSize:32,marginBottom:8}}>💪</div><div style={{fontSize:13}}>Aucun exercice enregistré</div></div>;
              return entries.map(([exName,history])=>{
                const allSets=Array.isArray(history)&&history.length>0
                  ?(history[0]?.sets?history.flatMap(h=>h.sets||[]):history)
                  :[];
                const prVal=allSets.map(s=>Number(s.weight)||0).reduce((a,b)=>Math.max(a,b),0);
                if(!prVal)return null;
                return(
                  <div key={exName} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #1A1A24"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#DDD"}}>{exName}</span>
                    <span style={{fontWeight:900,fontSize:15,color:"#FBBF24"}}>{prVal}<span style={{fontSize:10,color:"#555",marginLeft:3}}>kg PR</span></span>
                  </div>
                );
              });
            })()}
          </div>)}
        {profTab==="PRs"&&<div style={{paddingBottom:20}}>
          <div style={{background:"linear-gradient(135deg,#FBBF2422,#0D0D14)",border:"1px solid #FBBF2433",borderRadius:11,padding:"11px 14px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,color:"#E0E0E0",fontWeight:700}}>PRs validés</div>
            <div style={{fontSize:22,fontWeight:900,color:"#FBBF24"}}>{displayStats.prs}</div>
          </div>
          {(()=>{
            // For own profile: use local exercises. For others: use fetched exercises
            const sourceExercises=isMe&&appState?appState.exercises:otherExercises;
            const entries=Object.entries(sourceExercises||{});
            if(entries.length===0)return <div style={{textAlign:"center",padding:"32px 0",color:"#444"}}><div style={{fontSize:32,marginBottom:8}}>💪</div><div style={{fontSize:13}}>Aucun exercice enregistré</div></div>;
            return entries.map(([exName,history])=>{
              // history can be array of session objects with .sets, or direct sets
              const allSets=Array.isArray(history)&&history.length>0
                ?(history[0]?.sets?history.flatMap(h=>h.sets||[]):history)
                :[];
              const prVal=allSets.map(s=>Number(s.weight)||0).reduce((a,b)=>Math.max(a,b),0);
              if(!prVal)return null;
              return(
                <div key={exName} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #1A1A24"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#E0E0E0"}}>{exName}</span>
                  <span style={{fontWeight:900,fontSize:15,color:"#FBBF24"}}>{prVal} kg 🏆</span>
                </div>
              );
            });
          })()}
        </div>}

      </div>
    </div>
  );
}





// ══════════════════════ DEFI PRESETS ══
const DEFI_PRESETS = [
  {id:"pr_bench",    icon:"🏋️", title:"PR Développé couché",   desc:"Le plus gros PR au bench en 2 semaines",   type:"pr",       exercise:"Développé couché",    unit:"kg",     durationDays:14},
  {id:"pr_squat",    icon:"🦵", title:"PR Squat",               desc:"Le plus gros PR au squat en 2 semaines",   type:"pr",       exercise:"Squat",                unit:"kg",     durationDays:14},
  {id:"pr_deadlift", icon:"💀", title:"PR Soulevé de terre",    desc:"Le plus gros PR au deadlift en 2 semaines",type:"pr",       exercise:"Soulevé de terre",     unit:"kg",     durationDays:14},
  {id:"pr_ohp",      icon:"🔝", title:"PR Développé militaire", desc:"Le plus gros PR au OHP en 2 semaines",     type:"pr",       exercise:"Développé militaire",  unit:"kg",     durationDays:14},
  {id:"sessions",    icon:"🔥", title:"Plus de séances",        desc:"Qui fait le plus de séances cette semaine",type:"sessions", exercise:null,                   unit:"séances",durationDays:7},
  {id:"volume",      icon:"📊", title:"Volume total",           desc:"Qui soulève le plus de kg au total",       type:"volume",   exercise:null,                   unit:"kg",     durationDays:7},
  {id:"streak",      icon:"⚡", title:"Streak — tiens bon",     desc:"Premier à louper une séance a perdu",      type:"streak",   exercise:null,                   unit:"jours",  durationDays:7},
];

// ══════════════════════ MESSAGES ══
function MessagesTab({conversations,user,av,updateState,appState,overrides,onOpenProfile,pendingConvTarget,onConvOpened}){
  const [openConv,setOpenConv]=useState(null);
  const [msgSubTab,setMsgSubTab]=useState("messages");
  const [msgText,setMsgText]=useState("");
  const [showDefiModal,setShowDefiModal]=useState(null);
  const [selPreset,setSelPreset]=useState(null);
  const endRef=useRef(null);
  // conv: from conversations array OR synthesized from directTarget
  const convFromList = openConv ? conversations?.find(cv=>cv.id===openConv||cv.withId===openConv) : null;
  const conv = convFromList || (directTarget&&!openConv ? {
    id: directTarget.id,
    withId: directTarget.id,
    withPseudo: directTarget.pseudo,
    avatarVal: directTarget.avatarVal||"",
    avatarFallback: directTarget.avatarFallback||"👤",
    messages: []
  } : null);
  useEffect(()=>{if(conv&&endRef.current)endRef.current.scrollIntoView({behavior:"smooth"});},[conv,conversations]);

  // Pending conversation target (from profile message button)
  const [directTarget,setDirectTarget]=useState(null);
  useEffect(()=>{
    if(pendingConvTarget){
      setMsgSubTab("messages");
      setDirectTarget(pendingConvTarget);
      setOpenConv(null); // clear any open conv — we use directTarget instead
      if(onConvOpened) onConvOpened();
    }
  },[pendingConvTarget]);

  const sendMsg=()=>{
    if(!msgText.trim()||!conv)return;
    const text=msgText.trim(); setMsgText("");
    // If this is a new conversation (from directTarget), persist it first
    if(directTarget&&!convFromList){
      updateState(s=>{
        const exists=(s.conversations||[]).some(cv=>cv.id===conv.id||cv.withId===conv.withId);
        if(!exists) return{conversations:[...s.conversations,{...conv,messages:[{id:genId(),from:"me",text,ts:Date.now()}]}]};
        return{conversations:(s.conversations||[]).map(cv=>cv.id===conv.id||cv.withId===conv.withId?{...cv,messages:[...cv.messages,{id:genId(),from:"me",text,ts:Date.now()}]}:cv)};
      });
      setDirectTarget(null);
      setOpenConv(conv.id);
    } else {
    // Optimistic local update
    updateState(s=>{
      const convs=(s.conversations||[]).map(cv=>cv.id!==conv.id&&cv.withId!==conv.withId?cv:{...cv,messages:[...cv.messages,{id:genId(),from:"me",text,ts:Date.now()}]});
      return {conversations:convs};
    });
    // Send via Supabase bridge
    if(conv.withId&&conv.withId!=="me"){
      window.dispatchEvent(new CustomEvent("gymbro_sendmsg",{detail:{toId:conv.withId,toPseudo:conv.withPseudo,avatarVal:conv.avatarVal||"",avatarFb:conv.avatarFallback||"👤",text}}));
    } else if(conv.id&&conv.id!=="me"){
      window.dispatchEvent(new CustomEvent("gymbro_sendmsg",{detail:{toId:conv.id,toPseudo:conv.withPseudo,avatarVal:conv.avatarVal||"",avatarFb:conv.avatarFallback||"👤",text}}));
    }
    } // close else block for existing conv
  };

  const launchDefi=async()=>{
    if(!selPreset)return;
    if(!showDefiModal?.uid){console.error("No opponent uid"); return;}
    if(!overrides?.createChallenge){console.error("createChallenge not in overrides"); return;}
    try{
      await overrides.createChallenge({
        opponentId:showDefiModal.uid,
        type:selPreset.type,
        exercise:selPreset.exercise||null,
        title:selPreset.title,
        durationDays:selPreset.durationDays,
      });
      setShowDefiModal(null);setSelPreset(null);
    }catch(e){
      console.error("createChallenge error:",e);
      alert("Erreur: "+((e?.message)||"impossible de lancer le défi"));
    }
  };

  const challenges=appState?.challenges||[];
  // derive myId from supabase session if possible — fallback to matching pseudo
  const myPseudoLocal=user?.pseudo||"";
  const pendingChallenges=challenges.filter(c=>c.status==="pending"&&c.opponentPseudo===myPseudoLocal);
  const activeChallenges=challenges.filter(c=>c.status==="active");
  const doneChallenges=challenges.filter(c=>c.status==="finished"||c.status==="declined").slice(0,5);

  const timeLeft=(endDateStr)=>{
    const ms=new Date(endDateStr).getTime()-Date.now();
    if(ms<=0)return"Terminé";
    const d=Math.floor(ms/86400000);
    const h=Math.floor((ms%86400000)/3600000);
    return d>0?`${d}j ${h}h`:`${h}h`;
  };

  const unitLabel=(type)=>{
    if(type==="pr"||type==="volume")return"kg";
    if(type==="sessions")return"séances";
    return"j";
  };

  if((openConv||directTarget)&&conv){
    return(
      <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 56px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px) - 56px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:"1px solid #1A1A24",background:"#0A0A0F",flexShrink:0}}>
          <button onClick={()=>{setOpenConv(null);setDirectTarget(null);}} style={{background:"none",border:"none",color:"#888",cursor:"pointer",display:"flex",alignItems:"center"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <Avatar val={conv.avatarVal||""} fallback={conv.avatarFallback||"👤"} size={34} border="#2A2A3A"/>
          <div style={{fontSize:15,fontWeight:900}}>@{conv.withPseudo}</div>
          <div style={{marginLeft:"auto",width:8,height:8,borderRadius:"50%",background:"#22C55E"}}/>
        </div>
        <div className="sa" style={{flex:1,padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
          {conv.messages.map(m=>{
            const mine=m.from==="me";
            return(<div key={m.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start",alignItems:"flex-end",gap:7}}>
              {!mine&&<Avatar val={conv.avatarVal||""} fallback={conv.avatarFallback||"👤"} size={26} border="#2A2A3A"/>}
              <div className="msg-b" style={{background:mine?"#FF3D3D":"#13131A",color:mine?"#FFF":"#E0E0E0",borderRadius:mine?"18px 18px 4px 18px":"18px 18px 18px 4px"}}>{m.text}</div>
              {mine&&<Avatar val={user.avatar||""} fallback={av} size={26} border="#2A2A3A"/>}
            </div>);
          })}
          <div ref={endRef}/>
        </div>
        <div style={{padding:"8px 12px 14px",borderTop:"1px solid #1A1A24",display:"flex",gap:8,background:"#0A0A0F",flexShrink:0}}>
          <textarea className="inp" placeholder="Message..." value={msgText} onChange={e=>setMsgText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} rows={1} style={{flex:1,fontSize:13,padding:"9px 12px",resize:"none",fontFamily:"'Barlow',sans-serif",lineHeight:1.4,minHeight:38,maxHeight:80}}/>
          <button onClick={sendMsg} disabled={!msgText.trim()} style={{background:"#FF3D3D",border:"none",color:"#FFF",borderRadius:10,padding:"0 14px",cursor:"pointer",fontWeight:800,fontSize:16,alignSelf:"flex-end",height:38,flexShrink:0}}>→</button>
        </div>
      </div>
    );
  }

  const following=appState?.following||[];
  return(
    <div>
      {/* Header */}
      <div style={{padding:"16px 16px 0",borderBottom:"1px solid #1A1A24",background:"#0A0A0FEE",backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:10}}>
        <div style={{fontSize:26,fontWeight:900,marginBottom:12}}>Messages</div>
        <div style={{display:"flex"}}>
          <button className={`tab-b ${msgSubTab==="messages"?"on":""}`} onClick={()=>setMsgSubTab("messages")}>MESSAGES</button>
          <button className={`tab-b ${msgSubTab==="amis"?"on":""}`} onClick={()=>setMsgSubTab("amis")}>
            AMIS {pendingChallenges.length>0&&<span style={{background:"#FF3D3D",color:"#FFF",borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,marginLeft:4}}>{pendingChallenges.length}</span>}
          </button>
          <button className={`tab-b ${msgSubTab==="defis"?"on":""}`} onClick={()=>setMsgSubTab("defis")}>
            DÉFIS {activeChallenges.length>0&&<span style={{background:"#FBBF24",color:"#000",borderRadius:"50%",width:16,height:16,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,marginLeft:4}}>{activeChallenges.length}</span>}
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {msgSubTab==="messages"&&(
        <div style={{padding:"0 14px"}}>
          {(!conversations||conversations.length===0)
            ?<div style={{textAlign:"center",padding:"56px 20px",color:"#444"}}>
               <div style={{fontSize:44,marginBottom:10}}>💬</div>
               <div style={{fontSize:16,fontWeight:800,marginBottom:5}}>Aucun message</div>
               <div style={{fontSize:12,color:"#333",fontFamily:"'Barlow',sans-serif"}}>Suis des créateurs et envoie-leur un message depuis leur profil.</div>
             </div>
            :conversations.map(c=>{const last=c.messages[c.messages.length-1];return(
              <div key={c.id} onClick={()=>setOpenConv(c.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:"1px solid #1A1A24",cursor:"pointer"}}>
                <div style={{position:"relative"}}>
                  <Avatar val={c.avatarVal||""} fallback={c.avatarFallback||"👤"} size={46} border="#2A2A3A"/>
                  <div style={{position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:"#22C55E",border:"2px solid #0A0A0F"}}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:15,marginBottom:2}}>@{c.withPseudo}</div>
                  <div style={{color:"#444",fontSize:13,fontFamily:"'Barlow',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?.from==="me"?"Toi: ":""}{last?.text||"…"}</div>
                </div>
                <div style={{color:"#333",fontSize:11,flexShrink:0}}>{last?timeSince(last.ts):""}</div>
              </div>
            );})
          }
        </div>
      )}

      {/* AMIS */}
      {msgSubTab==="amis"&&(
        <div style={{padding:"12px 14px"}}>
          {/* Invitations de défis reçues */}
          {pendingChallenges.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:900,color:"#FF3D3D",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>⚡ Défis reçus</div>
              {pendingChallenges.map(ch=>(
                <div key={ch.id} style={{background:"#1A0A0A",border:"1px solid #FF3D3D44",borderRadius:12,padding:"12px 14px",marginBottom:8}}>
                  <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>@{ch.challengerPseudo} te défie !</div>
                  <div style={{color:"#888",fontSize:12,fontFamily:"'Barlow',sans-serif",marginBottom:10}}>{ch.title}</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>overrides?.respondChallenge(ch.id,true)} style={{flex:1,background:"linear-gradient(135deg,#FF3D3D,#CC2020)",border:"none",color:"#FFF",borderRadius:9,padding:"9px 0",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:".04em"}}>✓ ACCEPTER</button>
                    <button onClick={()=>overrides?.respondChallenge(ch.id,false)} style={{flex:1,background:"#1A1A24",border:"1px solid #2A2A3A",color:"#666",borderRadius:9,padding:"9px 0",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>Refuser</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {following.length===0
            ?<div style={{textAlign:"center",padding:"56px 20px",color:"#444"}}>
               <div style={{fontSize:44,marginBottom:10}}>👥</div>
               <div style={{fontSize:16,fontWeight:800,marginBottom:5}}>Aucun ami encore</div>
               <div style={{fontSize:12,color:"#333",fontFamily:"'Barlow',sans-serif"}}>Suis des personnes depuis le feed pour les retrouver ici</div>
             </div>
            :following.map((friend)=>{
              const uid=friend.id;
              const pseudo=friend.pseudo||uid;
              const avatarVal=friend.avatarUrl||"";
              const avatarFb=friend.pseudo?.[0]?.toUpperCase()||"👤";
              const profileObj={userId:uid,pseudo,avatarVal,avatarFallback:avatarFb,rankName:"",rankColor:"#888",rankTier:"silver",points:friend.points||0};
              return(
                <div key={uid} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"1px solid #1A1A24"}}>
                  <div onClick={()=>onOpenProfile&&onOpenProfile(profileObj)} style={{cursor:"pointer",flexShrink:0}}>
                    <Avatar val={avatarVal} fallback={avatarFb} size={46} border="#2A2A3A"/>
                  </div>
                  <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>onOpenProfile&&onOpenProfile(profileObj)}>
                    <div style={{fontWeight:800,fontSize:15}}>@{pseudo}</div>
                    <div style={{fontSize:11,color:"#555",marginTop:2,fontFamily:"'Barlow',sans-serif"}}>voir profil →</div>
                  </div>
                  <div style={{display:"flex",gap:7,flexShrink:0}}>
                    <button onClick={()=>{
                      setMsgSubTab("messages");
                      if(c){
                        setOpenConv(c.id);
                      } else {
                        const newConv={id:uid,withId:uid,withPseudo:pseudo,avatarVal,avatarFallback:avatarFb,messages:[]};
                        updateState(s=>({conversations:[...(s.conversations||[]),newConv]}));
                        setOpenConv(uid);
                      }
                    }} style={{background:"#13131A",border:"1px solid #1E1E2E",color:"#888",borderRadius:9,padding:"8px 10px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </button>
                    <button onClick={()=>setShowDefiModal({uid,pseudo,avatarVal,avatarFb})} style={{background:"#FF3D3D14",border:"1px solid #FF3D3D44",color:"#FF6B6B",borderRadius:9,padding:"7px 12px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:".04em"}}>
                      ⚡ DÉFI
                    </button>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {/* DÉFIS */}
      {msgSubTab==="defis"&&(
        <div style={{padding:"12px 14px"}}>
          {activeChallenges.length===0&&doneChallenges.length===0
            ?<div style={{textAlign:"center",padding:"56px 20px",color:"#444"}}>
               <div style={{fontSize:44,marginBottom:10}}>⚡</div>
               <div style={{fontSize:16,fontWeight:800,marginBottom:5}}>Aucun défi en cours</div>
               <div style={{fontSize:12,color:"#333",fontFamily:"'Barlow',sans-serif"}}>Lance un défi depuis l'onglet Amis</div>
             </div>
            :null
          }
          {activeChallenges.length>0&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:900,color:"#FBBF24",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>🔥 En cours</div>
              {activeChallenges.map(ch=>{
                const amChallenger=ch.challengerPseudo===myPseudoLocal;
                const myScore=amChallenger?ch.challengerScore:ch.opponentScore;
                const theirScore=amChallenger?ch.opponentScore:ch.challengerScore;
                const theirPseudo=amChallenger?ch.opponentPseudo:ch.challengerPseudo;
                const theirAvatar=amChallenger?ch.opponentAvatar:ch.challengerAvatar;
                const isWinning=myScore>=theirScore;
                const total=myScore+theirScore||1;
                const myPct=Math.round((myScore/total)*100);
                return(
                  <div key={ch.id} style={{background:"#0D0D14",border:"1px solid #FBBF2433",borderRadius:14,padding:"14px",marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{fontWeight:900,fontSize:15}}>{ch.title}</div>
                        <div style={{color:"#555",fontSize:11,fontFamily:"'Barlow',sans-serif",marginTop:2}}>⏱ {timeLeft(ch.endDate)}</div>
                      </div>
                      <button onClick={()=>overrides?.deleteChallenge(ch.id)} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:16,lineHeight:1}}>✕</button>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{flex:1,textAlign:"center"}}>
                        <Avatar val={user?.avatar||""} fallback={av} size={40} border={isWinning?"#22C55E":"#2A2A3A"}/>
                        <div style={{fontSize:11,fontWeight:800,marginTop:4,color:isWinning?"#22C55E":"#F0F0F0"}}>@{myPseudoLocal}</div>
                        <div style={{fontSize:26,fontWeight:900,color:isWinning?"#22C55E":"#F0F0F0",lineHeight:1.2}}>{myScore}</div>
                        <div style={{fontSize:10,color:"#444"}}>{unitLabel(ch.type)}</div>
                      </div>
                      <div style={{fontSize:13,fontWeight:900,color:"#333",flexShrink:0}}>VS</div>
                      <div style={{flex:1,textAlign:"center"}}>
                        <Avatar val={theirAvatar} fallback="👤" size={40} border={!isWinning?"#FF3D3D":"#2A2A3A"}/>
                        <div style={{fontSize:11,fontWeight:800,marginTop:4,color:!isWinning?"#FF6060":"#888"}}>@{theirPseudo}</div>
                        <div style={{fontSize:26,fontWeight:900,color:!isWinning?"#FF6060":"#888",lineHeight:1.2}}>{theirScore}</div>
                        <div style={{fontSize:10,color:"#444"}}>{unitLabel(ch.type)}</div>
                      </div>
                    </div>
                    <div style={{height:5,background:"#1A1A24",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${myPct}%`,background:isWinning?"#22C55E":"#FF3D3D",borderRadius:3,transition:"width .5s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:"#444"}}>
                      <span>{myPct}%</span><span>{100-myPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {doneChallenges.length>0&&(
            <div>
              <div style={{fontSize:11,fontWeight:900,color:"#444",letterSpacing:".06em",textTransform:"uppercase",marginBottom:8}}>Terminés</div>
              {doneChallenges.map(ch=>{
                const amChallenger=ch.challengerPseudo===myPseudoLocal;
                const iWon=amChallenger?ch.challengerScore>ch.opponentScore:ch.opponentScore>ch.challengerScore;
                const isDraw=ch.challengerScore===ch.opponentScore;
                const theirPseudo=amChallenger?ch.opponentPseudo:ch.challengerPseudo;
                return(
                  <div key={ch.id} style={{background:"#0D0D14",border:`1px solid ${iWon?"#22C55E33":isDraw?"#FBBF2433":"#FF3D3D22"}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                    <div style={{fontSize:28,flexShrink:0}}>{iWon?"🏆":isDraw?"🤝":"😤"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:800,fontSize:13}}>{ch.title}</div>
                      <div style={{fontSize:12,color:iWon?"#22C55E":isDraw?"#FBBF24":"#FF6060",fontWeight:700,marginTop:2}}>
                        {iWon?"Victoire 🎉":isDraw?"Égalité":"Défaite"} vs @{theirPseudo}
                      </div>
                    </div>
                    <button onClick={()=>overrides?.deleteChallenge(ch.id)} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:14}}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL LANCER UN DÉFI */}
      {showDefiModal&&(
        <div className="modal-bg"
          onClick={()=>{setShowDefiModal(null);setSelPreset(null);}}
          onTouchMove={e=>e.stopPropagation()}
          onWheel={e=>e.stopPropagation()}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} onTouchMove={e=>e.stopPropagation()} style={{display:"flex",flexDirection:"column",maxHeight:"88vh"}}>
            <div className="modal-handle" style={{flexShrink:0}}/>
            {/* Header — fixe */}
            <div style={{padding:"0 16px 12px",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar val={showDefiModal.avatarVal||""} fallback={showDefiModal.avatarFb||"👤"} size={40} border="#2A2A3A"/>
                <div>
                  <div style={{fontSize:11,color:"#555",fontFamily:"'Barlow',sans-serif"}}>Défier</div>
                  <div style={{fontWeight:900,fontSize:18}}>@{showDefiModal.pseudo}</div>
                </div>
              </div>
              <div style={{fontSize:11,fontWeight:800,color:"#555",letterSpacing:".08em",marginTop:14,marginBottom:2,textTransform:"uppercase"}}>Choisir un défi</div>
            </div>
            {/* Liste scrollable */}
            <div className="sa" style={{flex:1,overflowY:"auto",padding:"0 16px",minHeight:0}}>
              {DEFI_PRESETS.map(p=>(
                <div key={p.id} onClick={()=>setSelPreset(selPreset?.id===p.id?null:p)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",background:selPreset?.id===p.id?"#FF3D3D14":"#0D0D14",border:`1.5px solid ${selPreset?.id===p.id?"#FF3D3D":"#1A1A24"}`,borderRadius:11,marginBottom:7,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"#1A1A24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:800,fontSize:13,color:selPreset?.id===p.id?"#FF6B6B":"#F0F0F0"}}>{p.title}</div>
                    <div style={{color:"#444",fontSize:11,fontFamily:"'Barlow',sans-serif",marginTop:1}}>{p.desc}</div>
                  </div>
                  <div style={{fontSize:10,color:"#444",flexShrink:0,whiteSpace:"nowrap"}}>{p.durationDays}j</div>
                  {selPreset?.id===p.id&&<div style={{color:"#FF3D3D",fontSize:16,flexShrink:0}}>✓</div>}
                </div>
              ))}
              <div style={{height:8}}/>
            </div>
            {/* Bouton LANCER — toujours visible en bas */}
            <div style={{padding:"12px 16px",paddingBottom:"max(16px,env(safe-area-inset-bottom,16px))",borderTop:"1px solid #1A1A24",flexShrink:0,background:"#0F0F18"}}>
              <button onClick={launchDefi} disabled={!selPreset}
                style={{width:"100%",padding:"14px",background:selPreset?"linear-gradient(135deg,#FF3D3D,#CC2020)":"#1A1A24",border:"none",color:selPreset?"#FFF":"#444",borderRadius:12,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,cursor:selPreset?"pointer":"not-allowed",letterSpacing:".06em",transition:"all .2s"}}>
                {selPreset?`⚡ LANCER — ${selPreset.durationDays} JOURS`:"Sélectionne un défi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function ProgramTab({appState,updateState,saveSession}){
  const {programs=[],exercises={},sessionHistory=[]}=appState;
  const [view,setView]=useState("list"); // list | new | active | progress | history | body
  const [activeSession,setActiveSession]=useState(null);
  const [selEx,setSelEx]=useState(null);

  if(view==="active"&&activeSession){
    return <ActiveSession session={activeSession}
      onFinish={(result,dur)=>{saveSession(activeSession.day.name,activeSession.program.name,result,dur);setActiveSession(null);setView("list");}}
      onCancel={()=>{setActiveSession(null);setView("list");}}/>;
  }
  if(view==="progress")return <ProgressView exercises={exercises} onBack={()=>setView("list")} selEx={selEx} setSelEx={setSelEx}/>;
  if(view==="history") return <SessionHistory sessionHistory={sessionHistory} onBack={()=>setView("list")} onDelete={(idOrIdx)=>{
    updateState(s=>{
      const newHist=(s.sessionHistory||[]).filter((h,i)=>h.id!==idOrIdx&&i!==idOrIdx);
      return {sessionHistory:newHist};
    });
    // Also sync to Supabase if id is a real uuid
    if(typeof idOrIdx==="string"&&idOrIdx.length>8){
      import('./supabase.js').then(({supabase:sb})=>{
        sb.from('session_history').delete().eq('id',idOrIdx).then(()=>{}).catch(()=>{});
      }).catch(()=>{});
    }
  }}/>;
  if(view==="new")     return <NewProgramWizard onDone={prog=>{updateState(s=>({programs:[...s.programs,prog]}));setView("list");}} onCancel={()=>setView("list")}/>;
  if(view==="body")    return <MuscleMap exercises={exercises} sessionHistory={sessionHistory} onBack={()=>setView("list")}/>;

  return(
    <div style={{padding:"14px 14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontSize:19,fontWeight:900}}>PROGRAMMES</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>
          <button className="btn-g" onClick={()=>setView("body")} style={{padding:"6px 10px",fontSize:11}}>💪 Corps</button>
          <button className="btn-g" onClick={()=>setView("history")} style={{padding:"6px 10px",fontSize:11}}>📅 Historique</button>
          <button className="btn-g" onClick={()=>setView("progress")} style={{padding:"6px 10px",fontSize:11}}>📈 Progression</button>
          <button onClick={()=>setView("new")} style={{background:"#FF3D3D",border:"none",color:"#FFF",padding:"6px 12px",borderRadius:9,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>+ Nouveau</button>
        </div>
      </div>
      {programs.length===0?(
        <div style={{textAlign:"center",padding:"50px 20px"}}>
          <div style={{fontSize:44,marginBottom:12}}>🏋️</div>
          <div style={{fontSize:17,fontWeight:800,marginBottom:6}}>Aucun programme</div>
          <div style={{color:"#444",fontSize:12,fontFamily:"'Barlow',sans-serif",marginBottom:18}}>Crée ton premier programme</div>
          <button className="btn-r" onClick={()=>setView("new")} style={{width:"auto",padding:"11px 22px"}}>CRÉER UN PROGRAMME</button>
        </div>
      ):(
        programs.map((prog,pi)=>(
          <div key={pi} className="card" style={{padding:13,marginBottom:11}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontSize:16,fontWeight:800}}>{prog.name}</div><div style={{color:"#555",fontSize:12,marginTop:1}}>{prog.days.length} jour{prog.days.length>1?"s":""}</div></div>
              <button onClick={()=>updateState(s=>({programs:s.programs.filter((_,i)=>i!==pi)}))} style={{background:"none",border:"none",color:"#444",fontSize:15,cursor:"pointer",padding:"2px 4px"}}>🗑</button>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {prog.days.map((d,di)=>(
                <button key={di} onClick={()=>{setActiveSession({day:d,program:prog});setView("active");}} style={{padding:"7px 13px",borderRadius:8,background:"linear-gradient(135deg,#FF3D3D22,#1A1A24)",border:"1px solid #FF3D3D44",color:"#FF8080",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>▶ {d.name}</button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ══════════════════════ NEW PROGRAM WIZARD ══
function NewProgramWizard({onDone,onCancel}){
  const [step,setStep]=useState(0);
  const [prog,setProg]=useState({name:"",days:[]});
  const [editDayIdx,setEditDayIdx]=useState(null);
  const [exoSearch,setExoSearch]=useState("");
  const [selCat,setSelCat]=useState("Poitrine");

  if(step===0)return(
    <div style={{padding:"14px 14px"}}>
      <button onClick={onCancel} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginBottom:18}}>← Retour</button>
      <div style={{fontSize:21,fontWeight:900,marginBottom:4}}>Nouveau programme</div>
      <div style={{color:"#555",fontSize:12,fontFamily:"'Barlow',sans-serif",marginBottom:18}}>Commence de zéro ou choisis un preset</div>
      <button onClick={()=>{setProg({name:"Mon programme",days:[{name:"Jour 1",exercises:[]}]});setStep(2);}} style={{width:"100%",padding:"14px",background:"#13131A",border:"2px dashed #2A2A3A",borderRadius:13,color:"#CCC",marginBottom:10,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",gap:12,alignItems:"center"}}>
        <span style={{fontSize:28}}>✏️</span><div><div style={{fontSize:15,fontWeight:800}}>Programme vierge</div><div style={{color:"#555",fontSize:11}}>Construis depuis zéro</div></div>
      </button>
      <div style={{fontSize:13,fontWeight:800,marginBottom:8,marginTop:14}}>PROGRAMMES POPULAIRES</div>
      {PRESET_PROGRAMS.map((p,i)=>(
        <button key={i} onClick={()=>{setProg({name:p.name,days:p.days.map(d=>({name:d.name,exercises:d.exos.map(n=>({name:n,sets:3}))}))});setStep(2);}} style={{width:"100%",padding:"12px 14px",background:"#0D0D14",border:"1px solid #1A1A24",borderRadius:11,color:"#CCC",marginBottom:7,cursor:"pointer",fontFamily:"inherit",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:14,fontWeight:800}}>{p.name}</div><div style={{color:"#555",fontSize:11}}>{p.freq} jours / semaine</div></div>
          <span style={{fontSize:16,color:"#555"}}>→</span>
        </button>
      ))}
    </div>
  );

  const addDay=()=>setProg(p=>({...p,days:[...p.days,{name:`Jour ${p.days.length+1}`,exercises:[]}]}));
  const removeDay=i=>setProg(p=>({...p,days:p.days.filter((_,di)=>di!==i)}));
  const addExo=(di,name)=>{
    setProg(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,exercises:[...d.exercises,{name,sets:3}]}:d)}));
    // Don't close modal here — let user close manually or add multiple
  };
  const removeExo=(di,ei)=>setProg(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,exercises:d.exercises.filter((_,j)=>j!==ei)}:d)}));
  const updSets=(di,ei,v)=>setProg(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,exercises:d.exercises.map((e,j)=>j===ei?{...e,sets:Math.max(1,Number(v)||1)}:e)}:d)}));

  const allExosFlat=Object.values(EXERCISE_BANK).flat();
  const searchResults=exoSearch?allExosFlat.filter(e=>e.toLowerCase().includes(exoSearch.toLowerCase())):EXERCISE_BANK[selCat]||[];

  return(
    <div style={{padding:"14px 14px"}}>
      <button onClick={()=>setStep(0)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginBottom:14}}>← Retour</button>
      <div style={{fontSize:17,fontWeight:900,marginBottom:12}}>Configurer</div>
      <div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:".09em",marginBottom:5,fontFamily:"'Barlow Condensed',sans-serif"}}>Nom</div><input className="inp" value={prog.name} onChange={e=>setProg(p=>({...p,name:e.target.value}))} placeholder="Nom du programme"/></div>
      <div style={{fontSize:13,fontWeight:800,marginBottom:8}}>JOURS ({prog.days.length})</div>
      {prog.days.map((day,di)=>(
        <div key={di} className="card" style={{padding:11,marginBottom:9}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
            <input className="inp" value={day.name} onChange={e=>setProg(p=>({...p,days:p.days.map((d,i)=>i===di?{...d,name:e.target.value}:d)}))} style={{flex:1,fontSize:13,padding:"7px 10px"}}/>
            <button onClick={()=>removeDay(di)} style={{background:"none",border:"none",color:"#555",fontSize:15,cursor:"pointer",flexShrink:0}}>🗑</button>
          </div>
          {day.exercises.map((ex,ei)=>(
            <div key={ei} style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,background:"#13131A",borderRadius:7,padding:"7px 9px"}}>
              <span style={{flex:1,fontSize:12,color:"#CCC",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.name}</span>
              <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
                <button onClick={()=>updSets(di,ei,ex.sets-1)} style={{width:20,height:20,borderRadius:"50%",background:"#2A2A3A",border:"none",color:"#FFF",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <span style={{fontSize:12,fontWeight:700,minWidth:18,textAlign:"center"}}>{ex.sets}</span>
                <button onClick={()=>updSets(di,ei,ex.sets+1)} style={{width:20,height:20,borderRadius:"50%",background:"#2A2A3A",border:"none",color:"#FFF",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                <span style={{fontSize:10,color:"#555",marginLeft:1}}>x</span>
              </div>
              <button onClick={()=>removeExo(di,ei)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:13,flexShrink:0}}>✕</button>
            </div>
          ))}
          <button onClick={()=>setEditDayIdx(di)} style={{width:"100%",padding:"7px",background:"#FF3D3D12",border:"1px dashed #FF3D3D44",borderRadius:7,color:"#FF3D3D",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:3}}>+ Ajouter exercice</button>
        </div>
      ))}
      <button onClick={addDay} className="btn-g" style={{width:"100%",padding:"9px",marginBottom:14}}>+ Ajouter un jour</button>
      <button className="btn-r" onClick={()=>{if(prog.name&&prog.days.length>0)onDone(prog);}} disabled={!prog.name||prog.days.length===0}>CRÉER LE PROGRAMME</button>

      {/* Exercise bank modal — key fix: only render when editDayIdx is not null */}
      {editDayIdx!==null&&(
        <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={()=>setEditDayIdx(null)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:"82vh"}}>
            <div className="modal-handle"/>
            <div style={{padding:"0 14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:16,fontWeight:900}}>Banque d'exercices</div>
                <button onClick={()=>setEditDayIdx(null)} style={{background:"none",border:"none",color:"#666",fontSize:20,cursor:"pointer"}}>✕</button>
              </div>
              <input className="inp" placeholder="Rechercher un exercice..." value={exoSearch} onChange={e=>setExoSearch(e.target.value)} style={{marginBottom:9,fontSize:12,padding:"8px 11px"}}/>
              {!exoSearch&&(
                <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10}}>
                  {Object.keys(EXERCISE_BANK).map(cat=><button key={cat} onClick={()=>setSelCat(cat)} style={{padding:"4px 10px",borderRadius:20,background:selCat===cat?"#FF3D3D":"#1A1A24",border:"none",color:"#F0F0F0",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{cat}</button>)}
                </div>
              )}
              <div style={{display:"flex",flexWrap:"wrap",gap:7,maxHeight:320,overflowY:"auto"}}>
                {searchResults.map(exo=>{
                  const already=editDayIdx!==null&&prog.days[editDayIdx]?.exercises.some(e=>e.name===exo);
                  return(
                    <button key={exo} className={`ex-chip ${already?"sel":""}`} onClick={()=>{addExo(editDayIdx,exo);}}>
                      {exo}{already?" ✓":""}
                    </button>
                  );
                })}
              </div>
              <button className="btn-r" onClick={()=>setEditDayIdx(null)} style={{marginTop:14}}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════ ACTIVE SESSION ══
function ActiveSession({session,onFinish,onCancel}){
  const {day}=session;
  const [exercises,setExercises]=useState(()=>{
    try{
      const s=localStorage.getItem('gymbro_active_session');
      if(s){const d=JSON.parse(s);if(d.exercises&&d.day?.name===day.name)return d.exercises;}
    }catch{}
    return day.exercises.map(ex=>({name:ex.name,sets:Array.from({length:ex.sets},()=>({reps:"",weight:"",done:false}))}));
  });
  const [time,setTime]=useState(()=>{
    try{ const s=localStorage.getItem('gymbro_active_session'); if(s){const d=JSON.parse(s);if(d.startTs)return Math.floor((Date.now()-d.startTs)/1000);} }catch{}
    return 0;
  });
  const [showAddExo,setShowAddExo]=useState(false);
  const [exoSearch,setExoSearch]=useState("");
  const [selCat,setSelCat]=useState("Poitrine");
  const timerRef=useRef();
  const startTsRef=useRef(Date.now()-time*1000);

  // Persist session state to localStorage so background doesn't lose it
  useEffect(()=>{
    try{
      localStorage.setItem('gymbro_active_session',JSON.stringify({startTs:startTsRef.current,day:session.day,program:session.program}));
    }catch{}
  },[session]);

  // Timer: use real elapsed time to stay accurate in background
  useEffect(()=>{
    timerRef.current=setInterval(()=>{
      setTime(Math.floor((Date.now()-startTsRef.current)/1000));
    },1000);
    return()=>{
      clearInterval(timerRef.current);
      // Clear persisted session on unmount only if finishing
    };
  },[]);

  // Persist exercises state too
  useEffect(()=>{
    try{
      const s=localStorage.getItem('gymbro_active_session');
      if(s){const d=JSON.parse(s); localStorage.setItem('gymbro_active_session',JSON.stringify({...d,exercises}));}
    }catch{}
  },[exercises]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const totalSets=exercises.reduce((a,e)=>a+e.sets.length,0);
  const doneSets=exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);

  const toggleSet=(ei,si)=>setExercises(prev=>prev.map((e,i)=>i===ei?{...e,sets:e.sets.map((s,j)=>j===si?{...s,done:!s.done}:s)}:e));
  const updSet=(ei,si,k,v)=>setExercises(prev=>prev.map((e,i)=>i===ei?{...e,sets:e.sets.map((s,j)=>j===si?{...s,[k]:v}:s)}:e));
  const addSet=ei=>setExercises(prev=>prev.map((e,i)=>i===ei?{...e,sets:[...e.sets,{reps:"",weight:"",done:false}]}:e));
  const removeSet=(ei,si)=>setExercises(prev=>prev.map((e,i)=>i===ei?{...e,sets:e.sets.filter((_,j)=>j!==si)}:e));
  const removeExo=ei=>setExercises(prev=>prev.filter((_,i)=>i!==ei));
  const addExo=name=>{setExercises(prev=>[...prev,{name,sets:[{reps:"",weight:"",done:false},{reps:"",weight:"",done:false},{reps:"",weight:"",done:false}]}]);setShowAddExo(false);};

  const finish=()=>{
    // Check for exercises with no validated sets
    const emptyExos=exercises.filter(ex=>ex.sets.filter(s=>s.done).length===0);
    if(emptyExos.length>0){
      const names=emptyExos.map(e=>e.name).join(", ");
      if(!window.confirm(`⚠️ Ces exercices n'ont aucune série validée :\n${names}\n\nTerminer quand même ?`)) return;
    }
    const result=exercises.map(ex=>({name:ex.name,sets:ex.sets.filter(s=>s.done).map(s=>({reps:Number(s.reps)||0,weight:Number(s.weight)||0}))}));
    try{localStorage.removeItem('gymbro_active_session');}catch{}
    onFinish(result,time);
  };

  const allExosFlat=Object.values(EXERCISE_BANK).flat();
  const searchResults=exoSearch?allExosFlat.filter(e=>e.toLowerCase().includes(exoSearch.toLowerCase())):EXERCISE_BANK[selCat]||[];

  return(
    <div style={{padding:"12px 14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:11}}>
        <div><div style={{fontSize:15,fontWeight:900,color:"#FF3D3D"}}>⏱ {day.name}</div><div style={{fontSize:26,fontWeight:900,fontVariantNumeric:"tabular-nums"}}>{fmt(time)}</div></div>
        <div style={{textAlign:"right"}}><div style={{color:"#555",fontSize:10}}>Séries</div><div style={{fontSize:19,fontWeight:900,color:doneSets===totalSets&&totalSets>0?"#22C55E":"#F0F0F0"}}>{doneSets}/{totalSets}</div></div>
      </div>
      <div style={{height:4,background:"#1A1A24",borderRadius:3,overflow:"hidden",marginBottom:14}}>
        <div style={{height:"100%",width:`${totalSets>0?(doneSets/totalSets)*100:0}%`,background:"linear-gradient(90deg,#FF3D3D,#22C55E)",transition:"width .3s",borderRadius:3}}/>
      </div>

      {exercises.map((ex,ei)=>(
        <div key={ei} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
            <div style={{fontWeight:800,fontSize:14,color:"#F0F0F0"}}>{ex.name}{PR_EXERCISES.includes(ex.name)&&<span style={{color:"#FFD700",fontSize:10,marginLeft:6}}>PR</span>}</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>addSet(ei)} style={{background:"#1A1A24",border:"1px solid #2A2A3A",color:"#888",padding:"3px 8px",borderRadius:6,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>+ Série</button>
              <button onClick={()=>removeExo(ei)} style={{background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer"}}>✕</button>
            </div>
          </div>
          {ex.sets.map((s,si)=>(
            <div key={si} className={`set-row ${s.done?"done":""}`}>
              <div onClick={()=>toggleSet(ei,si)} style={{width:24,height:24,borderRadius:"50%",background:s.done?"#22C55E":"#1A1A30",border:`2px solid ${s.done?"#22C55E":"#333"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,cursor:"pointer",transition:"all .2s"}}>{s.done?"✓":si+1}</div>
              <span style={{flex:1,fontSize:12,color:"#777"}}>Série {si+1}</span>
              <input className="num-inp" placeholder="reps" value={s.reps} onChange={e=>updSet(ei,si,"reps",e.target.value)} type="number" min="0"/>
              <span style={{color:"#333",fontSize:11}}>×</span>
              <input className="num-inp" placeholder="kg" value={s.weight} onChange={e=>updSet(ei,si,"weight",e.target.value)} type="number" min="0" step="0.5"/>
              <span style={{color:"#444",fontSize:10}}>kg</span>
              <button onClick={()=>removeSet(ei,si)} style={{background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer",flexShrink:0,marginLeft:2}}>✕</button>
            </div>
          ))}
        </div>
      ))}

      <button onClick={()=>setShowAddExo(true)} style={{width:"100%",padding:"9px",background:"#FF3D3D12",border:"1px dashed #FF3D3D44",borderRadius:8,color:"#FF3D3D",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:14}}>+ Ajouter exercice</button>

      <div style={{display:"flex",gap:9}}>
        <button onClick={()=>{try{localStorage.removeItem('gymbro_active_session');}catch{}onCancel();}} className="btn-g" style={{flex:1,padding:"12px 0",fontSize:13}}>Annuler</button>
        <button onClick={finish} style={{flex:2,padding:"12px 0",background:"linear-gradient(135deg,#22C55E,#16A34A)",border:"none",color:"#FFF",borderRadius:10,fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit"}}>✓ TERMINER ({fmt(time)})</button>
      </div>

      {showAddExo&&(
        <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={()=>setShowAddExo(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:"80vh"}}>
            <div className="modal-handle"/>
            <div style={{padding:"0 14px 16px"}}>
              <div style={{fontSize:16,fontWeight:900,marginBottom:10}}>Ajouter un exercice</div>
              <input className="inp" placeholder="Rechercher..." value={exoSearch} onChange={e=>setExoSearch(e.target.value)} style={{marginBottom:9,fontSize:12,padding:"8px 11px"}}/>
              {!exoSearch&&<div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:10}}>{Object.keys(EXERCISE_BANK).map(cat=><button key={cat} onClick={()=>setSelCat(cat)} style={{padding:"4px 10px",borderRadius:20,background:selCat===cat?"#FF3D3D":"#1A1A24",border:"none",color:"#F0F0F0",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{cat}</button>)}</div>}
              <div style={{display:"flex",flexWrap:"wrap",gap:7,maxHeight:280,overflowY:"auto"}}>
                {searchResults.map(exo=><button key={exo} className="ex-chip" onClick={()=>addExo(exo)}>{exo}</button>)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════ SESSION HISTORY ══
function SessionHistory({sessionHistory,onBack,onDelete}){
  const [detail,setDetail]=useState(null);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  if(detail){
    return(
      <div style={{padding:"14px 14px"}}>
        <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginBottom:14}}>← Historique</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div><div style={{fontSize:19,fontWeight:900}}>{detail.dayName}</div><div style={{color:"#555",fontSize:13,marginTop:2}}>{detail.programName}</div></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#FF3D3D"}}>{detail.durationSec?fmt(detail.durationSec):"—"}</div>
            <div style={{color:"#666",fontSize:11}}>{new Date(detail.date).toLocaleDateString("fr",{day:"numeric",month:"long",year:"numeric"})}</div>
          </div>
        </div>
        {(detail.exercises||[]).map((ex,ei)=>(
          <div key={ei} className="card" style={{padding:12,marginBottom:9}}>
            <div style={{fontWeight:800,fontSize:14,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              {ex.name}
              {PR_EXERCISES.includes(ex.name)&&<span style={{background:"#FBBF2422",color:"#FBBF24",borderRadius:4,padding:"1px 6px",fontSize:9,fontWeight:800}}>PR</span>}
            </div>
            {(ex.sets||[]).length===0?<div style={{color:"#444",fontSize:11}}>Aucune série validée</div>:(
              <div>
                {ex.sets.map((s,si)=>(
                  <div key={si} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:si<ex.sets.length-1?"1px solid #1A1A24":"none"}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:"#22C55E22",border:"1.5px solid #22C55E66",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#22C55E",fontWeight:700,flexShrink:0}}>{si+1}</div>
                    <div style={{flex:1,fontFamily:"'Barlow',sans-serif",fontSize:13,color:"#CCC"}}>
                      <span style={{fontWeight:700,color:"#F0F0F0"}}>{s.reps||"—"}</span> reps
                      {s.weight>0&&<><span style={{color:"#555",margin:"0 6px"}}>·</span><span style={{fontWeight:700,color:"#FBBF24"}}>{s.weight}kg</span></>}
                    </div>

                  </div>
                ))}
                <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #1A1A24",fontSize:11,color:"#555"}}>
                  {ex.sets.length} série{ex.sets.length>1?"s":""}
                </div>
              </div>
            )}
          </div>
        ))}

      </div>
    );
  }

  return(
    <div style={{padding:"14px 14px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginBottom:14}}>← Programmes</button>
      <div style={{fontSize:19,fontWeight:900,marginBottom:14}}>📅 HISTORIQUE</div>
      {!sessionHistory||sessionHistory.length===0?(
        <div style={{textAlign:"center",padding:"50px 20px",color:"#444"}}><div style={{fontSize:38,marginBottom:10}}>📅</div><div style={{fontSize:15,fontWeight:800,marginBottom:5}}>Aucune séance</div><div style={{fontSize:12,fontFamily:"'Barlow',sans-serif"}}>Tes séances apparaîtront ici.</div></div>
      ):(
        sessionHistory.map((h,i)=>(
          <div key={h.id||i} className="card" style={{padding:13,marginBottom:10,cursor:"pointer",position:"relative"}} onClick={()=>setDetail(h)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:15,fontWeight:800}}>{h.dayName}</div>
                <div style={{color:"#555",fontSize:11,marginTop:1}}>{h.programName}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#FF3D3D"}}>{h.durationSec?fmt(h.durationSec):"—"}</div>
                <div style={{color:"#555",fontSize:11}}>{new Date(h.date).toLocaleDateString("fr",{day:"numeric",month:"short",year:"numeric"})}</div>
                {onDelete&&<button onClick={e=>{e.stopPropagation();if(window.confirm("Supprimer cette séance ?"))onDelete(h.id||i);}} style={{background:"none",border:"none",color:"#444",fontSize:13,cursor:"pointer",marginTop:2,display:"block",marginLeft:"auto"}}>🗑</button>}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
              {(h.exercises||[]).map((ex,ei)=>(
                <span key={ei} style={{background:"#1A1A24",borderRadius:6,padding:"3px 8px",fontSize:10,color:"#888"}}>{ex.name}</span>
              ))}
            </div>
            <div style={{color:"#555",fontSize:10,display:"flex",alignItems:"center",gap:4}}>Voir le détail <span style={{fontSize:12}}>→</span></div>
          </div>
        ))
      )}
    </div>
  );
}

// ══════════════════════ PROGRESS VIEW ══
// ══════════════════════ PROGRESS VIEW ══
// Simple SVG line chart — no IIFEs, pure JSX
function LineChart({data,color}){
  if(!data||data.length<2)return null;
  const W=280,H=110,PL=32,PB=22,PT=14,PR=6;
  const ys_=H-PT-PB, xs_=W-PL-PR;
  const vals=data.map(d=>d.y);
  const minV=Math.min(...vals), maxV=Math.max(...vals);
  const range=maxV===minV?1:maxV-minV;
  const points=data.map((d,i)=>[
    PL+i*(xs_/(data.length-1)),
    PT+ys_-((d.y-minV)/range)*ys_
  ]);
  const line=points.map((p,i)=>(i===0?`M`:` L`)+p[0].toFixed(1)+","+p[1].toFixed(1)).join("");
  const area=line+" L"+points[points.length-1][0].toFixed(1)+","+(H-PB)+" L"+PL+","+(H-PB)+" Z";
  const c=color||"#FF3D3D";
  const gid="g"+c.replace("#","");
  return(
    <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",display:"block"}} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={c} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <line x1={PL} y1={PT} x2={PL} y2={H-PB} stroke="#222" strokeWidth="1"/>
      <line x1={PL} y1={H-PB} x2={W-PR} y2={H-PB} stroke="#222" strokeWidth="1"/>
      {[0,0.5,1].map((t,i)=>{
        const vy=(minV+t*range).toFixed(1);
        const ly=PT+ys_-t*ys_;
        return(
          <g key={i}>
            <line x1={PL} y1={ly} x2={W-PR} y2={ly} stroke="#1A1A28" strokeWidth="1"/>
            <text x={PL-4} y={ly+4} textAnchor="end" fill="#555" fontSize="8">{vy}</text>
          </g>
        );
      })}
      <path d={area} fill={"url(#"+gid+")"} />
      <path d={line} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      {points.map((p,i)=>(
        <circle key={i} cx={p[0]} cy={p[1]} r={i===points.length-1?5:3}
          fill={i===points.length-1?c:"#0A0A0F"} stroke={c} strokeWidth="2"/>
      ))}
      {data.map((d,i)=>{
        if(data.length>7&&i%2!==0&&i!==data.length-1)return null;
        return(
          <text key={i} x={points[i][0]} y={H-4}
            textAnchor="middle" fill="#444" fontSize="7.5">{d.x}</text>
        );
      })}
      <text x={points[points.length-1][0]} y={points[points.length-1][1]-8}
        textAnchor="middle" fill={c} fontSize="9" fontWeight="700">
        {data[data.length-1].y}kg
      </text>
    </svg>
  );
}

function ProgressView({exercises,onBack}){
  const exNames=Object.keys(exercises||{});
  const [sel,setSel]=useState(exNames[0]||null);
  // update sel if new exercise added and nothing selected
  if(!sel&&exNames.length>0)setSel(exNames[0]);

  const history=(sel&&exercises[sel])||[];
  const maxWeight=history.length>0
    ? history.flatMap(h=>h.sets.map(s=>Number(s.weight)||0)).reduce((a,b)=>Math.max(a,b),0)
    : 0;

  const chartData=history.slice(-12).map(h=>({
    x:new Date(h.date).toLocaleDateString("fr",{day:"numeric",month:"short"}),
    y:h.sets.length>0?Math.max(...h.sets.map(s=>Number(s.weight)||0)):0
  })).filter(d=>d.y>0);

  const firstVal=chartData.length>0?chartData[0].y:0;
  const lastVal=chartData.length>0?chartData[chartData.length-1].y:0;
  const progression=firstVal>0?((lastVal-firstVal)/firstVal*100).toFixed(1):null;

  return(
    <div style={{padding:"14px 14px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:700,marginBottom:14}}>{"<"} Programmes</button>
      <div style={{fontSize:19,fontWeight:900,marginBottom:12}}>{"📈"} PROGRESSION</div>
      {exNames.length===0
        ?<div style={{textAlign:"center",padding:"50px 20px",color:"#444"}}>
           <div style={{fontSize:38,marginBottom:10}}>{"📊"}</div>
           <div style={{fontSize:15,fontWeight:800,marginBottom:5}}>Aucune donnée</div>
           <div style={{fontSize:12,fontFamily:"'Barlow',sans-serif"}}>Complète des séances pour voir ta progression</div>
         </div>
        :<div>
          <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:14,paddingBottom:2}}>
            {exNames.map(n=>{
              const exMax=(exercises[n]||[]).flatMap(h=>h.sets.map(s=>Number(s.weight)||0)).reduce((a,b)=>Math.max(a,b),0);
              return(
                <button key={n} onClick={()=>setSel(n)}
                  style={{padding:"6px 12px",borderRadius:20,flexShrink:0,
                    background:sel===n?"#FF3D3D":"#1A1A24",
                    border:sel===n?"none":"1px solid #2A2A3A",
                    color:"#F0F0F0",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
                    display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                  <span>{n}</span>
                  {exMax>0&&<span style={{color:sel===n?"rgba(255,255,255,.7)":"#FBBF24",fontSize:9,fontWeight:800}}>{exMax}kg</span>}
                </button>
              );
            })}
          </div>

          {sel&&(
            <div>
              <div style={{background:"linear-gradient(135deg,#FF3D3D22,#0D0D14)",border:"1px solid #FF3D3D33",borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:900,color:"#F0F0F0"}}>{sel}</div>
                  <div style={{color:"#555",fontSize:11,marginTop:2}}>{history.length} séance{history.length!==1?"s":""}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:26,fontWeight:900,color:"#FFD700"}}>{maxWeight}kg</div>
                  <div style={{color:"#FBBF24",fontSize:10,fontWeight:700}}>PR PERSO</div>
                </div>
              </div>

              {chartData.length>=2
                ?<div style={{background:"#0D0D14",border:"1px solid #1A1A24",borderRadius:12,padding:"14px 12px 8px",marginBottom:12}}>
                   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                     <div style={{fontSize:11,fontWeight:700,color:"#666"}}>CHARGE MAX / SÉANCE (kg)</div>
                     {progression!==null&&<div style={{fontSize:11,fontWeight:800,color:Number(progression)>=0?"#22C55E":"#EF4444"}}>{Number(progression)>=0?"+":""}{progression}%</div>}
                   </div>
                   <LineChart data={chartData} color="#FF3D3D"/>
                 </div>
                :<div style={{background:"#0D0D14",border:"1px solid #1A1A24",borderRadius:12,padding:"20px",textAlign:"center",marginBottom:12}}>
                   <div style={{color:"#444",fontSize:12,fontFamily:"'Barlow',sans-serif"}}>Fais 2+ séances avec cet exercice pour voir la courbe.</div>
                 </div>
              }

              <div style={{background:"#0D0D14",border:"1px solid #1A1A24",borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"9px 14px",borderBottom:"1px solid #1A1A24",fontSize:11,fontWeight:700,color:"#666",letterSpacing:".06em"}}>JOURNAL</div>
                <div style={{maxHeight:200,overflowY:"auto"}}>
                  {[...history].reverse().map((h,i)=>{
                    const sMax=h.sets.length>0?Math.max(...h.sets.map(s=>Number(s.weight)||0)):0;
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderBottom:i<history.length-1?"1px solid #131320":"none"}}>
                        <div style={{color:"#555",fontSize:10,minWidth:54}}>{new Date(h.date).toLocaleDateString("fr",{day:"numeric",month:"short"})}</div>
                        <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:4}}>
                          {h.sets.map((s,si)=>(
                            <span key={si} style={{background:"#13131A",borderRadius:5,padding:"2px 6px",fontSize:10,color:"#AAA"}}>
                              {s.reps||"?"}×{s.weight||0}kg
                            </span>
                          ))}
                        </div>
                        <div style={{fontWeight:800,fontSize:12,color:"#FF3D3D",flexShrink:0}}>{sMax}kg</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      }
    </div>
  );
}

// ══════════════════════ MUSCLE MAP ══
// All muscle paths defined as plain data — NO IIFEs in JSX
// ══════════════════════ MUSCLE WORK CALC ══
function getMusclesWorked(exerciseHistory){
  const counts={};
  const oneWeekAgo=Date.now()-7*24*3600*1000;
  Object.entries(exerciseHistory||{}).forEach(([exName,sessions])=>{
    if(!Array.isArray(sessions))return;
    if(sessions.some(s=>s.date>=oneWeekAgo)){
      const muscles=EX_TO_MUSCLES[exName]||[];
      muscles.forEach(m=>{ counts[m]=(counts[m]||0)+1; });
    }
  });
  return counts;
}


const MUSCLE_DEFS_FRONT = [
  {id:"chest",     label:"Poitrine",   d:"M70 65 C62 68 56 80 56 95 L56 128 L94 122 L94 68 Z"},
  {id:"chest",     label:"Poitrine",   d:"M130 65 C138 68 144 80 144 95 L144 128 L106 122 L106 68 Z"},
  {id:"shoulders", label:"Épaules",    d:"M46 62 C36 62 30 73 30 84 L30 100 L50 96 L54 68 Z"},
  {id:"shoulders", label:"Épaules",    d:"M154 62 C164 62 170 73 170 84 L170 100 L150 96 L146 68 Z"},
  {id:"biceps",    label:"Biceps",     d:"M32 100 C29 110 29 130 32 144 L42 148 L50 130 L50 96 Z"},
  {id:"biceps",    label:"Biceps",     d:"M168 100 C171 110 171 130 168 144 L158 148 L150 130 L150 96 Z"},
  {id:"abs",       label:"Abdos",      d:"M76 128 L124 128 L126 182 L100 185 L74 182 Z"},
  {id:"quads",     label:"Quadriceps", d:"M44 210 C40 218 38 240 40 270 L43 295 L75 295 L78 265 L80 215 Z"},
  {id:"quads",     label:"Quadriceps", d:"M156 210 C160 218 162 240 160 270 L157 295 L125 295 L122 265 L120 215 Z"},
  {id:"calves",    label:"Mollets",    d:"M40 295 C37 308 37 332 41 350 L50 356 L75 354 L78 344 L78 295 Z"},
  {id:"calves",    label:"Mollets",    d:"M160 295 C163 308 163 332 159 350 L150 356 L125 354 L122 344 L122 295 Z"},
  {id:"triceps",   label:"Triceps",    d:"M28 98 C25 108 25 128 28 142 L38 146 L46 128 L46 94 Z"},
  {id:"triceps",   label:"Triceps",    d:"M172 98 C175 108 175 128 172 142 L162 146 L154 128 L154 94 Z"},
  {id:"abs",       label:"Obliques",   d:"M56 128 L76 128 L74 182 L52 170 Z"},
  {id:"abs",       label:"Obliques",   d:"M144 128 L124 128 L126 182 L148 170 Z"},
];
const MUSCLE_DEFS_BACK = [
  {id:"back",       label:"Dos",           d:"M58 68 C50 75 48 95 48 118 L50 180 L150 180 L152 118 C152 95 150 75 142 68 Z"},
  {id:"traps",      label:"Trapèzes",      d:"M72 58 L128 58 L138 70 L100 78 L62 70 Z"},
  {id:"rear_delts", label:"Deltoïdes arr.",d:"M48 68 C38 68 32 78 32 90 L34 108 L52 104 L54 74 Z"},
  {id:"rear_delts", label:"Deltoïdes arr.",d:"M152 68 C162 68 168 78 168 90 L166 108 L148 104 L146 74 Z"},
  {id:"triceps",    label:"Triceps",       d:"M32 104 C29 116 29 136 33 150 L44 154 L52 136 L52 100 Z"},
  {id:"triceps",    label:"Triceps",       d:"M168 104 C171 116 171 136 167 150 L156 154 L148 136 L148 100 Z"},
  {id:"glutes",     label:"Fessiers",      d:"M48 185 C42 192 40 205 44 222 L78 228 L100 225 L122 228 L156 222 C160 205 158 192 152 185 Z"},
  {id:"hamstrings", label:"Ischio-jambiers",d:"M45 225 C40 235 38 258 41 282 L44 296 L75 295 L78 278 L80 228 Z"},
  {id:"hamstrings", label:"Ischio-jambiers",d:"M155 225 C160 235 162 258 159 282 L156 296 L125 295 L122 278 L120 228 Z"},
  {id:"calves",     label:"Mollets",       d:"M40 295 C37 308 37 332 41 350 L50 356 L75 354 L78 344 L78 295 Z"},
  {id:"calves",     label:"Mollets",       d:"M160 295 C163 308 163 332 159 350 L150 356 L125 354 L122 344 L122 295 Z"},
];

function getStatusLabel(count){
  if(count===0)return{label:"Pas travaillé",color:"#555"};
  if(count===1)return{label:"1 exo cette semaine",color:"#22C55E"};
  if(count===2)return{label:"2 exos cette semaine",color:"#FBBF24"};
  if(count===3)return{label:"3 exos cette semaine",color:"#F97316"};
  return{label:count+" exos cette semaine",color:"#EF4444"};
}
function getMuscleColor(muscleWork,id){
  const c=muscleWork[id]||0;
  if(c===0)return"#1A1A2A";
  if(c===1)return"#22C55E";
  if(c===2)return"#FBBF24";
  if(c===3)return"#F97316";
  return"#EF4444";
}
function getMuscleLabel(c){
  if(c===0)return{text:"Pas travaillé",color:"#555"};
  if(c===1)return{text:"1 exo cette semaine",color:"#22C55E"};
  if(c===2)return{text:"2 exos cette semaine",color:"#FBBF24"};
  if(c===3)return{text:"3 exos cette semaine",color:"#F97316"};
  return{text:c+" exos cette semaine",color:"#EF4444"};
}

function MuscleMap({exercises,onBack}){
  const [showBack,setShowBack]=useState(false);
  const [selected,setSelected]=useState(null);
  const muscleWork=getMusclesWorked(exercises||{});
  const defs=showBack?MUSCLE_DEFS_BACK:MUSCLE_DEFS_FRONT;

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px 10px",borderBottom:"1px solid #1A1A24",background:"#0A0A0FEE",backdropFilter:"blur(14px)",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:"none",border:"none",color:"#888",cursor:"pointer",display:"flex",alignItems:"center"}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{fontSize:20,fontWeight:900}}>Corps</div>
        </div>
        <div style={{display:"flex",background:"#13131A",borderRadius:10,overflow:"hidden",border:"1px solid #1E1E2E"}}>
          <button onClick={()=>setShowBack(false)} style={{padding:"8px 16px",background:!showBack?"#FF3D3D":"transparent",border:"none",color:"#F0F0F0",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:".04em",transition:"all .2s"}}>AVANT</button>
          <button onClick={()=>setShowBack(true)}  style={{padding:"8px 16px",background:showBack?"#FF3D3D":"transparent",border:"none",color:"#F0F0F0",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:".04em",transition:"all .2s"}}>ARRIÈRE</button>
        </div>
      </div>

      <div style={{padding:"0 16px 24px"}}>
        {/* Legend */}
        <div style={{display:"flex",gap:12,padding:"10px 0",overflowX:"auto",marginBottom:4}}>
          {[{c:"#1A1A2A",b:"#2A2A3A",l:"Non travaillé"},{c:"#22C55E",l:"1 exo"},{c:"#FBBF24",l:"2 exos"},{c:"#F97316",l:"3 exos"},{c:"#EF4444",l:"4+"}].map(({c,b,l})=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#888",fontFamily:"'Barlow',sans-serif",flexShrink:0}}>
              <div style={{width:10,height:10,borderRadius:3,background:c,border:b?`1px solid ${b}`:"none",flexShrink:0}}/>
              {l}
            </div>
          ))}
        </div>

        {/* SVG Body - new anatomical design */}
        <div style={{display:"flex",justifyContent:"center",margin:"8px 0 16px"}}>
          <svg viewBox="0 0 200 420" style={{width:"min(100%,220px)",display:"block",filter:"drop-shadow(0 4px 20px rgba(0,0,0,.5))"}} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#252535"/>
                <stop offset="100%" stopColor="#141420"/>
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>

            {/* Body silhouette — head */}
            <ellipse cx="100" cy="28" rx="20" ry="23" fill="url(#bodyGrad)" stroke="#252535" strokeWidth="1.5"/>
            {/* Neck */}
            <rect x="93" y="49" width="14" height="12" rx="4" fill="#1E1E2E" stroke="#252535" strokeWidth="1"/>
            {/* Torso */}
            <path d="M68 58 C55 60 48 72 46 88 L44 185 L156 185 L154 88 C152 72 145 60 132 58 Z" fill="url(#bodyGrad)" stroke="#252535" strokeWidth="1.5"/>
            {/* Upper arms */}
            <path d="M46 75 C36 75 30 84 30 96 L30 148 C30 158 36 162 44 162 L50 162 L50 88 Z" fill="#1E1E2E" stroke="#252535" strokeWidth="1"/>
            <path d="M154 75 C164 75 170 84 170 96 L170 148 C170 158 164 162 156 162 L150 162 L150 88 Z" fill="#1E1E2E" stroke="#252535" strokeWidth="1"/>
            {/* Forearms */}
            <path d="M30 148 C28 158 28 178 32 192 L40 195 L50 188 L50 148 Z" fill="#1E1E2E" stroke="#252535" strokeWidth="1"/>
            <path d="M170 148 C172 158 172 178 168 192 L160 195 L150 188 L150 148 Z" fill="#1E1E2E" stroke="#252535" strokeWidth="1"/>
            {/* Hips transition */}
            <path d="M46 185 L154 185 L158 210 L42 210 Z" fill="#1E1E2E" stroke="#252535" strokeWidth="1"/>
            {/* Thighs */}
            <path d="M44 208 C40 212 36 225 37 255 L40 298 L78 298 L82 255 C83 225 80 212 78 208 Z" fill="url(#bodyGrad)" stroke="#252535" strokeWidth="1.5"/>
            <path d="M156 208 C160 212 164 225 163 255 L160 298 L122 298 L118 255 C117 225 120 212 122 208 Z" fill="url(#bodyGrad)" stroke="#252535" strokeWidth="1.5"/>
            {/* Calves */}
            <path d="M40 296 C37 308 37 330 40 350 L48 360 L74 358 L78 348 L78 296 Z" fill="url(#bodyGrad)" stroke="#252535" strokeWidth="1"/>
            <path d="M160 296 C163 308 163 330 160 350 L152 360 L126 358 L122 348 L122 296 Z" fill="url(#bodyGrad)" stroke="#252535" strokeWidth="1"/>

            {/* Muscle detail lines — chest separation (front only) */}
            {!showBack&&<>
              <line x1="100" y1="65" x2="100" y2="125" stroke="#1A1A2A" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="58" y1="105" x2="142" y2="105" stroke="#1A1A2A" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
              <line x1="62" y1="125" x2="138" y2="125" stroke="#1A1A2A" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
              {/* Abs lines */}
              <line x1="88" y1="128" x2="88" y2="182" stroke="#1A1A2A" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
              <line x1="112" y1="128" x2="112" y2="182" stroke="#1A1A2A" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
              <line x1="76" y1="145" x2="124" y2="145" stroke="#1A1A2A" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
              <line x1="76" y1="163" x2="124" y2="163" stroke="#1A1A2A" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
            </>}

            {/* Muscle overlays */}
            {defs.map((m,i)=>{
              const col=getMuscleColor(muscleWork,m.id);
              const isActive=col!=="1A1A2A"&&col!=="#1A1A2A";
              return(
                <path key={i} d={m.d}
                  fill={col} fillOpacity={isActive?0.75:0}
                  stroke={isActive?col:"transparent"} strokeWidth="0.5"
                  style={{cursor:"pointer",transition:"fill-opacity .3s"}}
                  onClick={()=>setSelected({id:m.id,label:m.label,count:muscleWork[m.id]||0})}
                />
              );
            })}
          </svg>
        </div>

        {/* Selected muscle info */}
        {selected&&(
          <div style={{background:"#0D0D14",border:`1px solid ${getMuscleLabel(selected.count).color}44`,borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:800,fontSize:15}}>{selected.label}</div>
              <div style={{color:getMuscleLabel(selected.count).color,fontWeight:700,fontSize:12,marginTop:2}}>{getMuscleLabel(selected.count).text}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#444",fontSize:18,cursor:"pointer"}}>✕</button>
          </div>
        )}

        {/* Weekly summary grid */}
        <div style={{fontSize:12,fontWeight:900,letterSpacing:".05em",color:"#888",marginBottom:10,textTransform:"uppercase"}}>Résumé cette semaine</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[
            {id:"chest",label:"Poitrine"},{id:"back",label:"Dos"},{id:"shoulders",label:"Épaules"},
            {id:"biceps",label:"Biceps"},{id:"triceps",label:"Triceps"},{id:"abs",label:"Abdos"},
            {id:"quads",label:"Quadriceps"},{id:"hamstrings",label:"Ischio"},{id:"glutes",label:"Fessiers"},
            {id:"calves",label:"Mollets"},{id:"traps",label:"Trapèzes"},{id:"rear_delts",label:"Deltoïdes arr."},
          ].map(({id,label})=>{
            const count=muscleWork[id]||0;
            const {color}=getStatusLabel(count);
            return(
              <div key={id} style={{background:"#0D0D14",borderRadius:9,padding:"9px 11px",display:"flex",alignItems:"center",gap:9,border:`1px solid ${count>0?color+"33":"#1A1A24"}`}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:color,flexShrink:0,boxShadow:count>0?`0 0 6px ${color}88`:"none"}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:12}}>{label}</div>
                  <div style={{color:"#444",fontSize:10,marginTop:1}}>{count===0?"Non travaillé":count===1?"1 exo":count===2?"2 exos":count+"+ exos"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ══════════════════════ TROPHIES ══
function TrophiesTab({stats,user,updateState}){
  const [filter,setFilter]=useState("Tous");
  const [selTrophy,setSelTrophy]=useState(null);
  const unlocked=TROPHIES.filter(t=>t.condition(stats));
  const cats=["Tous",...[...new Set(TROPHIES.map(t=>t.cat))]];
  const filtered=filter==="Tous"?TROPHIES:TROPHIES.filter(t=>t.cat===filter);
  const pct=Math.round((unlocked.length/TROPHIES.length)*100);

  return(
    <div style={{padding:"14px 14px"}}>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:19,fontWeight:900}}>TROPHÉES</div>
          <div style={{color:"#888",fontSize:12}}>{unlocked.length}/{TROPHIES.length}</div>
        </div>
        <div style={{height:7,background:"#1A1A24",borderRadius:4,overflow:"hidden",marginBottom:3}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#FF3D3D,#FFD700)",borderRadius:4,transition:"width 1s ease"}}/>
        </div>
        <div style={{fontSize:10,color:"#555",textAlign:"right"}}>{pct}% complété</div>
      </div>
      <div style={{display:"flex",gap:5,overflowX:"auto",marginBottom:12}}>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"4px 10px",borderRadius:20,background:filter===c?"#FF3D3D":"#1A1A24",border:"none",color:"#F0F0F0",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{c}</button>)}
      </div>
      {["legendary","epic","rare","common"].map(r=>{
        const list=filtered.filter(t=>t.rarity===r);
        if(!list.length)return null;
        return(
          <div key={r}>
            <div style={{fontSize:9,fontWeight:800,color:RC[r],letterSpacing:".12em",textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:7}}>
              <div style={{flex:1,height:1,background:RC[r]+"33"}}/>{r}<div style={{flex:1,height:1,background:RC[r]+"33"}}/>
            </div>
            {list.map(t=>{const ok=t.condition(stats);return(
              <div key={t.id} onClick={()=>setSelTrophy(t)} style={{background:"#0D0D14",borderRadius:11,padding:"11px 13px",display:"flex",alignItems:"center",gap:11,marginBottom:6,border:`1px solid ${ok?RC[t.rarity]+"33":"#1A1A24"}`,opacity:ok?1:.45,cursor:"pointer"}}>
                <div style={{width:44,height:44,borderRadius:10,background:ok?RC[t.rarity]+"20":"#0A0A0F",border:`2px solid ${ok?RC[t.rarity]+"55":"#2A2A3A"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,filter:ok?"none":"grayscale(1)"}}>{ok?t.icon:"🔒"}</div>
                <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13}}>{t.name}</div><div style={{color:"#555",fontSize:11,marginTop:1,fontFamily:"'Barlow',sans-serif"}}>{t.desc}</div></div>
                {ok&&<div style={{color:RC[t.rarity],fontSize:14}}>✓</div>}
              </div>
            );})}
          </div>
        );
      })}

      {/* Trophy modal — CENTERED */}
      {selTrophy&&(
        <div className="modal-center" onClick={()=>setSelTrophy(null)}>
          <div style={{background:"#13131A",borderRadius:20,padding:26,textAlign:"center",border:`2px solid ${RC[selTrophy.rarity]}55`,maxWidth:300,width:"calc(100% - 48px)",animation:"scaleIn .3s cubic-bezier(.34,1.56,.64,1)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:56,marginBottom:8}}>{selTrophy.icon}</div>
            <div style={{color:RC[selTrophy.rarity],fontSize:9,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>{selTrophy.rarity} · {selTrophy.cat}</div>
            <div style={{fontSize:18,fontWeight:900,marginBottom:5}}>{selTrophy.name}</div>
            <div style={{color:"#888",fontSize:13,marginBottom:12,fontFamily:"'Barlow',sans-serif"}}>{selTrophy.desc}</div>
            {selTrophy.condition(stats)?(
              <div style={{background:"#22C55E18",border:"1px solid #22C55E44",borderRadius:8,padding:"8px 12px",marginBottom:14}}>
                <div style={{color:"#22C55E",fontWeight:800,fontSize:13}}>✓ DÉBLOQUÉ</div>
                {user.trophyDates?.[selTrophy.id]&&<div style={{color:"#555",fontSize:11,marginTop:3}}>{new Date(user.trophyDates[selTrophy.id]).toLocaleDateString("fr",{day:"numeric",month:"long",year:"numeric"})}</div>}
              </div>
            ):(
              <div style={{background:"#1A1A24",border:"1px solid #2A2A3A",borderRadius:8,padding:"8px 12px",marginBottom:14}}>
                <div style={{color:"#555",fontWeight:800,fontSize:13}}>🔒 VERROUILLÉ</div>
              </div>
            )}
            <button onClick={()=>setSelTrophy(null)} style={{background:"#FF3D3D",border:"none",color:"#FFF",padding:"9px 22px",borderRadius:9,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ══════════════════════ WEEKLY CHALLENGES ══
const ALL_CHALLENGES = [
  {id:"wc_sess3",  icon:"🏋️", title:"Machine de guerre",    desc:"Complète 3 séances cette semaine",   type:"sessions",    target:3, xp:150},
  {id:"wc_sess5",  icon:"🔥", title:"Semaine de feu",        desc:"Complète 5 séances cette semaine",   type:"sessions",    target:5, xp:300},
  {id:"wc_early",  icon:"🌅", title:"Lève-tôt",              desc:"1 séance avant 7h cette semaine",    type:"early",       target:1, xp:100},
  {id:"wc_night",  icon:"🌙", title:"Noctambule",            desc:"1 séance après 22h cette semaine",   type:"night",       target:1, xp:100},
  {id:"wc_pr",     icon:"💪", title:"Nouveau record",        desc:"Bats 1 PR cette semaine",            type:"prs",         target:1, xp:200},
  {id:"wc_post2",  icon:"📸", title:"Créateur de contenu",   desc:"Publie 2 posts cette semaine",       type:"posts",       target:2, xp:100},
  {id:"wc_streak", icon:"⚡", title:"Régularité",            desc:"4 jours de séances consécutifs",     type:"streak_week", target:4, xp:250},
];
function getWeekKey(){ const d=new Date(); const jan1=new Date(d.getFullYear(),0,1); return `w${d.getFullYear()}_${Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7)}`; }
function getWeekStart(){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-(d.getDay()===0?6:d.getDay()-1)); return d.getTime(); }
function getWeekChallenges(){ const k=getWeekKey(); const seed=k.split('').reduce((a,c)=>a+c.charCodeAt(0),0); const shuffled=[...ALL_CHALLENGES].sort((a,b)=>(seed*13+a.id.charCodeAt(0))%7-(seed*13+b.id.charCodeAt(0))%7); return shuffled.slice(0,5); }

// ══════════════════════ RANKED ══
function RankedTab({appState,updateState,rank,nextRank,rankPct,stats,giveXP}){
  const {country="France"}=appState;
  const [showCountry,setShowCountry]=useState(false);
  const [showRankPath,setShowRankPath]=useState(false);
  const [lbExpanded,setLbExpanded]=useState(false);

  // Weekly challenges
  const weekChallenges=getWeekChallenges();
  const weekKey=getWeekKey();
  const weekStart=getWeekStart();
  const [weekData,setWeekData]=useState(()=>{ try{return JSON.parse(localStorage.getItem('gymbro_weekly')||'{}');}catch{return {};} });
  const saveWeekData=(d)=>{ const next={...weekData,...d}; setWeekData(next); try{localStorage.setItem('gymbro_weekly',JSON.stringify(next));}catch{} };
  const completedIds=weekData[weekKey+'_done']||[];
  const markDone=(id,xpAmount)=>{
    if(completedIds.includes(id))return;
    saveWeekData({[weekKey+'_done']:[...completedIds,id]});
    // XP uniquement au clic RÉCLAMER
    if(typeof giveXP==="function") giveXP(xpAmount,"Défi hebdo accompli ! 🎯","⚡");
    else updateState(s=>({stats:{...s.stats,points:(s.stats.points||0)+xpAmount}}));
  };

  // 1 séance par jour pour les défis hebdo
  const weekSessionDays=new Set((appState.sessionHistory||[]).filter(h=>h.date>=weekStart).map(h=>new Date(h.date).toDateString()));
  const weekSessions=weekSessionDays.size;
  const weekEarly=(appState.sessionHistory||[]).filter(h=>h.date>=weekStart&&new Date(h.date).getHours()<7).length;
  const weekNight=(appState.sessionHistory||[]).filter(h=>h.date>=weekStart&&new Date(h.date).getHours()>=22).length;
  const weekPosts=(appState.posts||[]).filter(p=>p.userId==="me"&&p.ts>=weekStart).length;
  // Count PRs this week: from session history entries that have prCount, OR from recent sessions
  const weekPRs=Math.max(
    (appState.sessionHistory||[]).filter(h=>h.date>=weekStart&&(h.prCount||0)>0).reduce((sum,h)=>sum+(h.prCount||0),0),
    // Fallback: count sessions this week that had at least one exercise beating prev max
    (appState.sessionHistory||[]).filter(h=>h.date>=weekStart).reduce((sum,h)=>{
      if(h.prCount&&h.prCount>0)return sum+h.prCount;
      // Check exercises in session vs history before it
      let found=0;
      (h.exercises||[]).forEach(ex=>{
        if(!ex.sets?.length)return;
        const allPrev=(appState.exercises||{})[ex.name]||[];
        const prevEntries=allPrev.filter(e2=>e2.date<h.date);
        if(!prevEntries.length)return;
        const prevMax=prevEntries.flatMap(e2=>e2.sets.map(s=>s.weight||0)).reduce((a,b)=>Math.max(a,b),0);
        const curMax=ex.sets.map(s=>s.weight||0).reduce((a,b)=>Math.max(a,b),0);
        if(curMax>prevMax)found++;
      });
      return sum+found;
    },0)
  );
  function getChallengeProgress(ch){
    switch(ch.type){
      case 'sessions':    return weekSessions;
      case 'early':       return weekEarly;
      case 'night':       return weekNight;
      case 'posts':       return weekPosts;
      case 'prs':         return weekPRs;
      case 'streak_week': return Math.min(weekSessions,ch.target);
      default: return 0;
    }
  }

  // Leaderboard
  const [allUsers,setAllUsers]=useState([]);
  useEffect(()=>{
    const load=async()=>{
      try{
        const {supabase:sb}=await import('./supabase.js');
        const {data}=await sb.from('profiles').select('id,pseudo,points,sexe,avatar_url,country').order('points',{ascending:false}).limit(100);
        if(data)setAllUsers(data);
      }catch(e){console.error('loadUsers:',e);}
    };
    load(); const t=setInterval(load,30000); return()=>clearInterval(t);
  },[]);

  const myCountry=country||"France";
  const lb=[
    {u:appState.user.pseudo||"toi",pts:stats.points,r:rank,avatarUrl:appState.user.avatar||"",av:appState.user.sexe==="femme"?"👩":"👨",me:true,id:"me"},
    ...allUsers.filter(u=>u.pseudo!==appState.user.pseudo).filter(u=>{
      if(myCountry==="Monde")return true;
      return !u.country||u.country===myCountry;
    }).map(u=>{const r2=getRank(u.points||0);return{u:u.pseudo||"?",pts:u.points||0,r:r2,avatarUrl:u.avatar_url||"",av:u.sexe==="femme"?"👩":"👨",me:false,id:u.id};})
  ].sort((a,b)=>b.pts-a.pts);

  const topLb   = lb.slice(0,5);
  const restLb  = lb.slice(5);
  const myPos   = lb.findIndex(e=>e.me);

  return(
    <div style={{paddingBottom:8}}>
      {/* ── RANK CARD ── */}
      <div style={{padding:"14px 14px 0"}}>
        <div onClick={()=>setShowRankPath(true)} style={{background:`linear-gradient(135deg,${rank.color}18 0%,#0D0D1400 60%)`,border:`1px solid ${rank.color}44`,borderRadius:16,padding:16,marginBottom:14,cursor:"pointer"}} className="glow">
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
            <RankBadge tier={rank.tier} size={52} showLabel label={rank.name}/>
            <div>
              <div style={{fontSize:22,fontWeight:900,color:"#F0F0F0"}}>@{appState.user.pseudo}</div>
              <div style={{color:rank.color,fontWeight:800,fontSize:14,marginTop:2}}>{stats.points.toLocaleString()} XP</div>
            </div>
          </div>
          {nextRank&&<div><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:4}}><span style={{color:"#444"}}>{rank.name}</span><span style={{color:nextRank.color,fontWeight:700}}>{nextRank.name} — {(nextRank.min-stats.points).toLocaleString()} XP</span></div><div style={{height:4,background:"#1A1A2444",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${rankPct}%`,background:`linear-gradient(90deg,${rank.color},${nextRank.color})`,borderRadius:3}}/></div></div>}
          <div style={{color:"#444",fontSize:10,marginTop:6,fontFamily:"'Barlow',sans-serif"}}>Touche pour voir tous les rangs →</div>
        </div>
      </div>

      {/* ── WEEKLY CHALLENGES ── */}
      <div style={{padding:"0 14px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:900}}>⚡ DÉFIS DE LA SEMAINE</div>
          <div style={{background:"#1A1A24",borderRadius:8,padding:"3px 9px",fontSize:11,fontWeight:700,color:"#888"}}>{completedIds.length}/5</div>
        </div>
        {weekChallenges.map(ch=>{
          const done=completedIds.includes(ch.id);
          const progress=getChallengeProgress(ch);
          const pct=Math.min((progress/ch.target)*100,100);
          const canClaim=progress>=ch.target&&!done;
          return(
            <div key={ch.id} style={{background:done?"#0D1A0D":canClaim?"#1A1A0A":"#0D0D14",border:`1px solid ${done?"#22C55E44":canClaim?"#FBBF2444":"#1A1A24"}`,borderRadius:12,padding:"12px 14px",marginBottom:7,transition:"all .2s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:done?"#22C55E22":canClaim?"#FBBF2422":"#1A1A24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{done?"✅":ch.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:13,color:done?"#22C55E":canClaim?"#FBBF24":"#F0F0F0"}}>{ch.title}</div>
                  <div style={{color:"#555",fontSize:11,fontFamily:"'Barlow',sans-serif",marginTop:1}}>{ch.desc}</div>
                  {!done&&<div style={{marginTop:5}}><div style={{height:3,background:"#1A1A24",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:pct+"%",background:canClaim?"#FBBF24":"#FF3D3D",borderRadius:2,transition:"width .5s"}}/></div><div style={{fontSize:9,color:"#444",marginTop:2}}>{progress}/{ch.target}</div></div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:800,color:done?"#22C55E":canClaim?"#FBBF24":"#444"}}>+{ch.xp}</div>
                  {canClaim&&<button onClick={()=>markDone(ch.id,ch.xp)} style={{marginTop:4,background:"linear-gradient(135deg,#FBBF24,#F59E0B)",border:"none",color:"#000",borderRadius:7,padding:"5px 9px",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"inherit",display:"block"}}>RÉCLAMER</button>}
                  {done&&<div style={{fontSize:10,color:"#22C55E",fontWeight:700,marginTop:2}}>✓</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── CLASSEMENT — nouveau design ── */}
      <div style={{padding:"0 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:900}}>🏆 CLASSEMENT</div>
          <button onClick={()=>setShowCountry(true)} style={{background:"#1A1A24",border:"1px solid #2A2A3A",color:"#CCC",padding:"4px 9px",borderRadius:7,fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            🌍 {country}
          </button>
        </div>

        {/* Top 3 podium */}
        {topLb.length>=3&&(
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:6,marginBottom:16,padding:"0 4px"}}>
            {/* 2nd */}
            <PodiumCard entry={topLb[1]} pos={2} appState={appState} onOpenProfile={appState._openProfile}/>
            {/* 1st */}
            <PodiumCard entry={topLb[0]} pos={1} appState={appState} onOpenProfile={appState._openProfile}/>
            {/* 3rd */}
            <PodiumCard entry={topLb[2]} pos={3} appState={appState} onOpenProfile={appState._openProfile}/>
          </div>
        )}

        {/* Positions 4-5 */}
        {topLb.slice(3).map((e,i)=>(
          <LeaderboardRow key={e.id} entry={e} pos={i+4} appState={appState} onOpenProfile={appState._openProfile}/>
        ))}

        {/* My position if not in top 5 */}
        {myPos>4&&(
          <>
            <div style={{textAlign:"center",color:"#333",fontSize:11,padding:"6px 0"}}>• • •</div>
            <LeaderboardRow entry={lb[myPos]} pos={myPos+1} appState={appState} highlight onOpenProfile={appState._openProfile}/>
          </>
        )}

        {/* Voir plus */}
        {restLb.length>0&&(
          <>
            {lbExpanded&&restLb.map((e,i)=>(
              <LeaderboardRow key={e.id} entry={e} pos={i+6} appState={appState}/>
            ))}
            <button onClick={()=>setLbExpanded(!lbExpanded)} style={{width:"100%",padding:"10px",background:"#0D0D14",border:"1px solid #1A1A24",color:"#888",borderRadius:10,fontFamily:"'Barlow Condensed',sans-serif",fontSize:12,fontWeight:800,cursor:"pointer",marginTop:6,letterSpacing:".04em"}}>
              {lbExpanded?"RÉDUIRE ▲":`VOIR PLUS (${restLb.length}) ▼`}
            </button>
          </>
        )}
      </div>

      {/* ── COUNTRY PICKER ── */}
      {showCountry&&(
        <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={()=>setShowCountry(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div style={{padding:"0 14px 20px"}}>
              <div style={{fontSize:16,fontWeight:900,marginBottom:12}}>Choisir le classement</div>
              {COUNTRIES.map(co=>(
                <button key={co} onClick={()=>{updateState({country:co,stats:{...stats,changedCountry:true}});setShowCountry(false);}} style={{width:"100%",padding:"11px 13px",background:country===co?"#FF3D3D22":"#0D0D14",border:`1px solid ${country===co?"#FF3D3D44":"#1A1A24"}`,borderRadius:9,color:"#F0F0F0",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"left",marginBottom:5,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>{{"France":"🇫🇷","Monde":"🌍","Allemagne":"🇩🇪","Espagne":"🇪🇸","Italie":"🇮🇹","Royaume-Uni":"🇬🇧","États-Unis":"🇺🇸","Belgique":"🇧🇪","Suisse":"🇨🇭","Canada":"🇨🇦"}[co]||"🌍"} {co}</span>
                  {country===co&&<span style={{color:"#FF3D3D"}}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RANK PATH OVERLAY — nouvelle version style jeux vidéo ── */}
      {showRankPath&&(
        <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={()=>setShowRankPath(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
            <div className="modal-handle" style={{flexShrink:0}}/>
            <div className="sa" style={{flex:1,padding:"0 16px 24px",minHeight:0}}>
              <div style={{fontSize:20,fontWeight:900,marginBottom:4}}>Progression des rangs</div>
              <div style={{fontSize:12,color:"#555",fontFamily:"'Barlow',sans-serif",marginBottom:20}}>Ton chemin vers l'Élite</div>

              {/* Rank tiers grouped */}
              {[
                {tier:"silver",  label:"ARGENT",   color:"#94A3B8", ranks:RANKS.filter(r=>r.tier==="silver")},
                {tier:"gold",    label:"OR",        color:"#FBBF24", ranks:RANKS.filter(r=>r.tier==="gold")},
                {tier:"platinum",label:"PLATINE",  color:"#67E8F9", ranks:RANKS.filter(r=>r.tier==="platinum")},
                {tier:"diamond", label:"DIAMANT",  color:"#A78BFA", ranks:RANKS.filter(r=>r.tier==="diamond")},
                {tier:"emerald", label:"ÉMERAUDE", color:"#34D399", ranks:RANKS.filter(r=>r.tier==="emerald")},
                {tier:"elite",   label:"ÉLITE",    color:"#FF4D4D", ranks:RANKS.filter(r=>r.tier==="elite")},
              ].filter(g=>g.ranks.length>0).map(({tier,label,color,ranks})=>{
                const isCurTier=rank.tier===tier;
                const isPastTier=ranks.every(r=>stats.points>r.min);
                return(
                  <div key={tier} style={{marginBottom:14,background:isCurTier?color+"0A":"#0D0D14",border:`1px solid ${isCurTier?color+"44":"#1A1A24"}`,borderRadius:14,overflow:"hidden"}}>
                    {/* Tier header */}
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:isCurTier?color+"18":"transparent",borderBottom:`1px solid ${isCurTier?color+"33":"#1A1A24"}`}}>
                      <RankBadge tier={tier} size={28}/>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:900,fontSize:14,color:isCurTier?color:"#888",letterSpacing:".06em"}}>{label}</div>
                        <div style={{fontSize:10,color:"#444",fontFamily:"'Barlow',sans-serif"}}>{ranks[0].min.toLocaleString()} — {(ranks[ranks.length-1].min).toLocaleString()}+ XP</div>
                      </div>
                      {isPastTier&&!isCurTier&&<div style={{color:"#22C55E",fontSize:18}}>✓</div>}
                      {isCurTier&&<div style={{background:color+"22",color,fontSize:9,fontWeight:900,padding:"3px 7px",borderRadius:5,letterSpacing:".06em"}}>TU ES ICI</div>}
                    </div>
                    {/* Sub-ranks */}
                    <div style={{padding:"8px 12px 10px",display:"flex",gap:6}}>
                      {ranks.map((r,i)=>{
                        const isCur=r.name===rank.name;
                        const isPassed=stats.points>=r.min&&!isCur;
                        const nextR=RANKS[RANKS.indexOf(r)+1];
                        const prog=isCur&&nextR?Math.min(((stats.points-r.min)/(nextR.min-r.min))*100,100):isPassed?100:0;
                        return(
                          <div key={r.name} style={{flex:1,textAlign:"center"}}>
                            {/* Progress ring simulation */}
                            <div style={{width:"100%",aspectRatio:"1",borderRadius:"50%",background:isCur?color+"22":isPassed?color+"15":"#1A1A24",border:`${isCur?3:2}px solid ${isCur?color:isPassed?color+"66":"#2A2A3A"}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 5px",boxShadow:isCur?`0 0 12px ${color}66`:"none",transition:"all .3s",position:"relative",overflow:"hidden"}}>
                              {isCur&&prog>0&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:prog+"%",background:color+"22",transition:"height .5s"}}/>}
                              <span style={{fontSize:isCur?13:11,fontWeight:900,color:isCur?color:isPassed?color+"AA":"#333",position:"relative",zIndex:1}}>
                                {isPassed?"✓":isCur?"★":r.name.includes("I")&&!r.name.includes("II")&&!r.name.includes("III")?"I":r.name.includes("III")?"III":"II"}
                              </span>
                            </div>
                            <div style={{fontSize:9,color:isCur?color:isPassed?"#888":"#333",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{r.name.split(" ")[1]}</div>
                            <div style={{fontSize:8,color:"#333",fontFamily:"'Barlow',sans-serif"}}>{(r.min/1000).toFixed(0)}k</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Podium Card (top 3) ──
function PodiumCard({entry, pos, appState, onOpenProfile}){
  const heights={1:90,2:70,3:60};
  const h=heights[pos]||60;
  const colors={1:"#FFD700",2:"#94A3B8",3:"#CD7F32"};
  const col=colors[pos];
  const isMe=entry.me;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",maxWidth:120}}>
      {/* Avatar */}
      <div style={{position:"relative",marginBottom:6}} onClick={()=>!entry.me&&onOpenProfile&&onOpenProfile({userId:entry.id,pseudo:entry.u,avatarVal:entry.avatarUrl||"",avatarFallback:entry.av,rankName:entry.r.name,rankColor:entry.r.color,rankTier:entry.r.tier,points:entry.pts})} style2={{cursor:!entry.me?"pointer":"default"}}>
        <div style={{width:pos===1?52:44,height:pos===1?52:44,borderRadius:"50%",border:`3px solid ${col}`,overflow:"hidden",background:"#1A1A24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:pos===1?22:18,boxShadow:`0 0 ${pos===1?16:10}px ${col}55`,cursor:!entry.me?"pointer":"default"}}>
          {entry.avatarUrl&&(entry.avatarUrl.startsWith("http")||entry.avatarUrl.startsWith("data:"))
            ?<img src={entry.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
            :<span>{entry.av}</span>}
        </div>
        <div style={{position:"absolute",top:-6,left:"50%",transform:"translateX(-50%)",background:col,color:"#000",fontWeight:900,fontSize:9,borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {pos}
        </div>
      </div>
      {/* Name */}
      <div style={{fontSize:10,fontWeight:800,color:isMe?"#FF3D3D":"#F0F0F0",marginBottom:3,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"center"}}>@{entry.u}</div>
      <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:6}}>
        <RankBadge tier={entry.r.tier} size={12}/>
        <span style={{fontSize:9,color:entry.r.color,fontWeight:700}}>{entry.r.name}</span>
      </div>
      {/* Podium block */}
      <div style={{width:"100%",height:h,background:`linear-gradient(180deg,${col}33,${col}18)`,border:`1px solid ${col}66`,borderRadius:"8px 8px 0 0",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2}}>
        <div style={{fontSize:pos===1?15:12,fontWeight:900,color:col}}>{entry.pts.toLocaleString()}</div>
        <div style={{fontSize:8,color:col+"AA",fontWeight:700}}>XP</div>
      </div>
    </div>
  );
}

// ── Leaderboard Row (pos 4+) ──
function LeaderboardRow({entry, pos, appState, highlight, onOpenProfile}){
  return(
    <div onClick={()=>!entry.me&&onOpenProfile&&onOpenProfile({userId:entry.id,pseudo:entry.u,avatarVal:entry.avatarUrl||"",avatarFallback:entry.av,rankName:entry.r.name,rankColor:entry.r.color,rankTier:entry.r.tier,points:entry.pts})} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:highlight||entry.me?"#FF3D3D0A":"#0D0D14",borderRadius:10,marginBottom:5,border:highlight||entry.me?"1px solid #FF3D3D33":"1px solid transparent",cursor:!entry.me?"pointer":"default"}}>
      <div style={{width:24,fontWeight:900,fontSize:12,textAlign:"center",color:"#444",flexShrink:0}}>#{pos}</div>
      <div style={{width:32,height:32,borderRadius:"50%",background:"#1A1A24",border:`2px solid ${entry.r.color}44`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
        {entry.avatarUrl&&(entry.avatarUrl.startsWith("http")||entry.avatarUrl.startsWith("data:"))
          ?<img src={entry.avatarUrl} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
          :<span>{entry.av}</span>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:13,color:"#F0F0F0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>@{entry.u}{entry.me&&<span style={{color:"#FF3D3D",fontSize:9,marginLeft:4}}>(toi)</span>}</div>
        <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
          <RankBadge tier={entry.r.tier} size={13}/>
          <span style={{fontSize:10,color:entry.r.color,fontWeight:700}}>{entry.r.name}</span>
        </div>
      </div>
      <div style={{fontWeight:800,color:entry.r.color,fontSize:13}}>{entry.pts.toLocaleString()}</div>
    </div>
  );
}


// ══════════════════════ POST VIEW MODAL ══
function PostViewModal({post,onClose,toggleLike,addComment,myPseudo,myAvatarVal,av,onDelete,zIndex}){
  const [commentText,setCommentText]=useState("");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const rank=getRank(post.points||0);
  const isOwnPost=post.userId==="me";
  const submitComment=()=>{
    if(!commentText.trim())return;
    addComment(post.id,commentText.trim());
    setCommentText("");
  };
  return(
    <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={onClose} style={{alignItems:"flex-start",zIndex:zIndex||400}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0F0F18",width:"100%",maxWidth:430,maxHeight:"96vh",overflow:"auto",borderRadius:"20px 20px 0 0",animation:"slideUp .3s ease",paddingBottom:24}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid #1A1A24"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Avatar val={post.avatarVal||""} fallback={post.avatarFallback||"👤"} size={34} border={(post.rankColor||"#444")+"77"}/>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#F0F0F0"}}>@{post.pseudo}</div>
              <span className="rb" style={{background:(post.rankColor||"#444")+"22",color:post.rankColor||"#888",fontSize:9}}>{post.rankIcon} {post.rankName}</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {isOwnPost&&onDelete&&(
              !confirmDelete
                ?<button onClick={()=>setConfirmDelete(true)} style={{background:"none",border:"none",color:"#666",fontSize:18,cursor:"pointer",lineHeight:1}}>🗑</button>
                :<div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{onDelete(post.id);onClose();}} style={{background:"#FF3D3D",border:"none",color:"#FFF",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Supprimer</button>
                  <button onClick={()=>setConfirmDelete(false)} style={{background:"#2A2A3A",border:"none",color:"#AAA",borderRadius:7,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
                </div>
            )}
            <button onClick={onClose} style={{background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer",lineHeight:1}}>✕</button>
          </div>
        </div>

        {/* Media */}
        {post.mediaUrl&&(
          <div style={{background:"#0A0A0F",maxHeight:400,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
            {post.isVideo
              ?<video src={post.mediaUrl} controls style={{width:"100%",maxHeight:400,objectFit:"contain",display:"block"}}/>
              :<img src={post.mediaUrl} alt="" style={{width:"100%",maxHeight:400,objectFit:"contain",display:"block"}}/>}
          </div>
        )}

        {/* Actions */}
        <div style={{padding:"12px 16px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
            <button onClick={()=>toggleLike(post.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:post.liked?"#FF3D3D":"#666",fontSize:14,fontWeight:700,fontFamily:"inherit"}}>
              <span style={{fontSize:18}}>{post.liked?"❤️":"🤍"}</span>{post.likes.length}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:5,color:"#666",fontSize:14,fontWeight:700}}>
              <span style={{fontSize:18}}>💬</span>{(post.commentsList||[]).length}
            </div>
          </div>

          {/* Caption */}
          {post.caption&&<p style={{margin:"0 0 10px",fontSize:13,color:"#CCC",lineHeight:1.5,fontFamily:"'Barlow',sans-serif",wordBreak:"break-word"}}>
            <span style={{fontWeight:700,color:"#F0F0F0"}}>@{post.pseudo} </span>{post.caption}
            {post.tags?.length>0&&<span style={{color:"#FF3D3D"}}>{" "}{post.tags.map(t=>"#"+t).join(" ")}</span>}
          </p>}
          <div style={{color:"#444",fontSize:11,marginBottom:12}}>{timeSince(post.ts)}</div>

          {/* Comments */}
          {(post.commentsList||[]).length>0&&<div style={{marginBottom:12}}>
            {(post.commentsList||[]).map(cm=>(
              <div key={cm.id} style={{display:"flex",gap:9,marginBottom:9}}>
                <Avatar val={cm.avatarVal||""} fallback={cm.avatarFallback||"👤"} size={28} border="#2A2A3A"/>
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontWeight:700,fontSize:12,color:"#E0E0E0"}}>@{cm.pseudo} </span>
                  <span style={{fontSize:13,color:"#CCC",fontFamily:"'Barlow',sans-serif",lineHeight:1.4,wordBreak:"break-word"}}>{cm.text}</span>
                </div>
              </div>
            ))}
          </div>}

          {/* Add comment */}
          <div style={{display:"flex",gap:8,paddingTop:8,borderTop:"1px solid #1A1A24"}}>
            <Avatar val={myAvatarVal||""} fallback={av||"👤"} size={28} border="#2A2A3A"/>
            <textarea className="inp" placeholder="Ajouter un commentaire..." value={commentText}
              onChange={e=>setCommentText(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submitComment();}}}
              rows={2} style={{flex:1,fontSize:13,padding:"8px 11px",resize:"none",lineHeight:1.4,fontFamily:"'Barlow',sans-serif",minHeight:38,maxHeight:80}}/>
            <button onClick={submitComment} disabled={!commentText.trim()}
              style={{background:"#FF3D3D",border:"none",color:"#FFF",borderRadius:10,padding:"0 13px",cursor:"pointer",fontWeight:800,fontSize:15,alignSelf:"flex-end",height:38,flexShrink:0}}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ══════════════════════ PROFILE ══
function ProfileTab({appState,updateState,rank,imc,av,onEdit,onLogout,posts,checkTrophies,deletePost,onOpenPost,overrides}){
  const {user,stats,following=[]}=appState;
  // Sessions: sessionHistory.length is always up to date (local), stats.sessions may lag (Supabase)
  const sessionCount=Math.max(stats.sessions||0,(appState.sessionHistory||[]).length);
  const referrals=appState.referrals||{code:"",list:[],count:0};
  const soloChallenge=appState.soloChallenge||null;
  const [profTab,setProfTab]=useState("posts");
  const [showPinModal,setShowPinModal]=useState(false);
  const [selPinnedTrophy,setSelPinnedTrophy]=useState(null);
  const [viewPost,setViewPost]=useState(null);
  const [showSoloModal,setShowSoloModal]=useState(false);
  const [showReferralModal,setShowReferralModal]=useState(false);
  const unlocked=TROPHIES.filter(t=>t.condition(stats));
  const pinned=(user.pinnedTrophies||[]).map(id=>TROPHIES.find(t=>t.id===id)).filter(Boolean);
  const myPosts=posts.filter(p=>p.userId==="me");
  const mediaPosts=myPosts.filter(p=>p.mediaUrl);
  const textPosts=myPosts.filter(p=>!p.mediaUrl&&p.caption);
  const togglePin=id=>{const cur=user.pinnedTrophies||[];if(cur.includes(id))updateState({user:{...user,pinnedTrophies:cur.filter(x=>x!==id)}});else if(cur.length<3)updateState({user:{...user,pinnedTrophies:[...cur,id]}});};
  return(
    <div style={{padding:"14px 14px 0"}}>
      {/* Avatar + buttons */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
        <div style={{cursor:"pointer"}} onClick={onEdit}>
          <Avatar val={user.avatar||""} fallback={av} size={70} border={rank.color}/>
        </div>
        <div style={{display:"flex",gap:6,marginTop:2}}>
          <button onClick={onEdit} className="btn-g" style={{padding:"7px 11px",fontSize:11}}>✏️ Modifier</button>
          <button onClick={onLogout} style={{background:"#1A0A0A",border:"1px solid #FF3D3D33",color:"#FF6060",padding:"7px 10px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Déco.</button>
        </div>
      </div>
      <div style={{marginBottom:4}}>
        <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>@{user.pseudo}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
          <RankBadge tier={rank.tier} size={26} showLabel label={rank.name}/>
          <span style={{fontSize:14,fontWeight:800,color:rank.color}}>{stats.points.toLocaleString()} XP</span>
        </div>
      </div>
      {user.bio&&<div style={{color:"#888",fontSize:12,fontFamily:"'Barlow',sans-serif",marginBottom:6,lineHeight:1.4,marginTop:5}}>{user.bio}</div>}
      <div style={{color:"#555",fontSize:11,fontFamily:"'Barlow',sans-serif",marginBottom:12,marginTop:4}}>{user.age} ans · {user.sexe} · {user.poids}kg · {user.taille}cm{imc?` · IMC ${imc}`:""}</div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:12}}>
        {[{l:"Posts",v:myPosts.length},{l:"Abonnés",v:stats.followers||0},{l:"Abonnements",v:(appState.following||[]).length}].map((s,i)=>(
          <div key={i} style={{background:"#0D0D14",borderRadius:9,padding:"9px 6px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900}}>{s.v}</div><div style={{color:"#888",fontSize:10,fontWeight:600}}>{s.l}</div></div>
        ))}
      </div>

      {/* ── Défi solo + Parrainage cards ── */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {/* Défi solo */}
        <div onClick={()=>setShowSoloModal(true)} style={{flex:1,background:soloChallenge?"#1A0A00":"#0D0D14",border:`1px solid ${soloChallenge?"#FF3D3D44":"#1A1A24"}`,borderRadius:12,padding:"11px 12px",cursor:"pointer"}}>
          <div style={{fontSize:16,marginBottom:3}}>🎯</div>
          <div style={{fontSize:12,fontWeight:900,color:soloChallenge?"#FF6B6B":"#888"}}>Défi solo</div>
          {soloChallenge
            ?<>
              <div style={{fontSize:10,color:"#555",fontFamily:"'Barlow',sans-serif",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{soloChallenge.title}</div>
              <div style={{height:3,background:"#1A1A24",borderRadius:2,overflow:"hidden",marginTop:6}}>
                <div style={{height:"100%",width:`${Math.min((soloChallenge.current/soloChallenge.target)*100,100)}%`,background:"#FF3D3D",borderRadius:2}}/>
              </div>
              <div style={{fontSize:9,color:"#444",marginTop:3}}>{soloChallenge.current}/{soloChallenge.target}</div>
            </>
            :<div style={{fontSize:10,color:"#444",marginTop:2,fontFamily:"'Barlow',sans-serif"}}>Lance un défi →</div>
          }
        </div>

        {/* Parrainage */}
        <div onClick={()=>setShowReferralModal(true)} style={{flex:1,background:"#0D0D14",border:`1px solid ${referrals.count>=5?"#22C55E44":referrals.count>0?"#FBBF2433":"#1A1A24"}`,borderRadius:12,padding:"11px 12px",cursor:"pointer"}}>
          <div style={{fontSize:16,marginBottom:3}}>🎁</div>
          <div style={{fontSize:12,fontWeight:900,color:referrals.count>=5?"#22C55E":referrals.count>0?"#FBBF24":"#888"}}>Parrainage</div>
          <div style={{fontSize:11,fontWeight:800,color:"#555",marginTop:2}}>{referrals.count}/5</div>
          <div style={{height:3,background:"#1A1A24",borderRadius:2,overflow:"hidden",marginTop:6}}>
            <div style={{height:"100%",width:`${Math.min((referrals.count/5)*100,100)}%`,background:referrals.count>=5?"#22C55E":"#FBBF24",borderRadius:2}}/>
          </div>
          <div style={{fontSize:9,color:"#444",marginTop:3}}>
            {referrals.count>=5?"Premium actif 🎉":`Code: ${referrals.code||"..."}`}
          </div>
        </div>
      </div>

      {/* Pinned trophies */}
      <div style={{marginBottom:12}}>
        <div style={{marginBottom:7}}>
          <div style={{fontSize:12,fontWeight:800,letterSpacing:".04em",color:"#888"}}>TROPHÉES ÉPINGLÉS <span style={{color:"#444",fontWeight:400,fontSize:10}}>(clique pour modifier)</span></div>
        </div>
        <div style={{display:"flex",gap:7}}>
          {Array.from({length:3},(_,i)=>{const t=pinned[i];return(
            <div key={i} onClick={t?()=>setSelPinnedTrophy(t):()=>setShowPinModal(true)} style={{flex:1,height:52,background:t?RC[t.rarity]+"15":"#0D0D14",border:`1px solid ${t?RC[t.rarity]+"44":"#1A1A24"}`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1,cursor:"pointer"}}>
              {t?<><span style={{fontSize:20}}>{t.icon}</span><span style={{fontSize:8,color:RC[t.rarity],fontWeight:700,textAlign:"center",padding:"0 4px"}}>{t.name}</span></>:<span style={{fontSize:20,color:"#333"}}>＋</span>}
            </div>
          );})}
        </div>
      </div>

      {/* Profile stats card */}
      <div className="card" style={{padding:13,marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:12,marginBottom:9,letterSpacing:".04em"}}>💪 MON PROFIL</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
          {[{l:"Poids",v:`${user.poids} kg`},{l:"Taille",v:`${user.taille} cm`},{l:"Âge",v:`${user.age} ans`},{l:"IMC",v:imc||"—"},{l:"Séances",v:`${sessionCount} 🏋️`},{l:"PRs",v:`${stats.prs} 💪`}].map((s,i)=>(
            <div key={i} style={{background:"#13131A",borderRadius:7,padding:"8px 9px"}}><div style={{color:"#444",fontSize:9,marginBottom:1}}>{s.l}</div><div style={{fontWeight:800,fontSize:13}}>{s.v}</div></div>
          ))}
        </div>
      </div>

      {/* Premium */}
      <div style={{background:"linear-gradient(135deg,#FFD70015,#FF8C000C)",border:"1px solid #FFD70030",borderRadius:11,padding:13,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:22}}>⭐</span>
          <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13}}><span className="pm-b">GYMBRO PREMIUM</span></div><div style={{color:"#666",fontSize:10,marginTop:1}}>Analytics, programmes IA, badge exclusif…</div></div>
          <button style={{background:"linear-gradient(135deg,#FFD700,#FF8C00)",border:"none",color:"#000",padding:"6px 10px",borderRadius:7,fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>4.99€/mois</button>
        </div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid #1E1E28",marginBottom:12}}>
        {["posts","stats"].map(t=><button key={t} className={`tab-b ${profTab===t?"on":""}`} onClick={()=>setProfTab(t)} style={{textTransform:"uppercase"}}>{t}</button>)}
      </div>

      {profTab==="posts"&&(
        <div style={{paddingBottom:16}}>
          {/* Media posts grid */}
          {mediaPosts.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:3,marginBottom:mediaPosts.length>0&&textPosts.length>0?14:0}}>
              {mediaPosts.map(p=>(
                <div key={p.id} onClick={()=>onOpenPost?onOpenPost(p):setViewPost(p)} style={{aspectRatio:"1",borderRadius:4,overflow:"hidden",background:"#13131A",cursor:"pointer",position:"relative"}}>
                  {p.isVideo?<video src={p.mediaUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<img src={p.mediaUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                  {p.isVideo&&<div style={{position:"absolute",top:4,right:4,fontSize:10,color:"#FFF",background:"rgba(0,0,0,.5)",borderRadius:3,padding:"1px 4px"}}>▶</div>}
                </div>
              ))}
            </div>
          )}
          {/* Text posts separately */}
          {textPosts.length>0&&(
            <>
              {mediaPosts.length>0&&<div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:8,letterSpacing:".04em"}}>POSTS TEXTE</div>}
              {textPosts.map(p=>(
                <div key={p.id} style={{background:"#0D0D14",borderRadius:10,padding:"10px 12px",marginBottom:7,border:"1px solid #1A1A24",position:"relative"}}>
                  <p style={{margin:0,fontSize:13,color:"#CCC",lineHeight:1.4,fontFamily:"'Barlow',sans-serif",paddingRight:28}}>{p.caption}</p>
                  {p.tags?.length>0&&<div style={{color:"#FF3D3D",fontSize:11,marginTop:5}}>{p.tags.map(t=>`#${t}`).join(" ")}</div>}
                  <div style={{color:"#444",fontSize:10,marginTop:5}}>{timeSince(p.ts)} · {p.likes.length} ❤️ · {(p.commentsList||[]).length} 💬</div>
                  {deletePost&&<button onClick={()=>{if(window.confirm("Supprimer ce post ?")){{updateState(s=>({posts:s.posts.filter(q=>q.id!==p.id)}));deletePost(p.id);}}} } style={{position:"absolute",top:8,right:8,background:"none",border:"none",color:"#555",fontSize:14,cursor:"pointer",lineHeight:1}}>🗑</button>}
                </div>
              ))}
            </>
          )}
          {myPosts.length===0&&<div style={{textAlign:"center",padding:"26px 0",color:"#444",fontSize:12}}>Aucun post encore.</div>}
        </div>
      )}

      {profTab==="stats"&&(
        <div style={{paddingBottom:16}}>
          {[
            {l:"Séances totales",v:sessionCount,max:100,c:"#FF3D3D"},
            {l:"Streak actuel",v:stats.streak,max:30,u:"jours",c:"#22C55E"},
            {l:"Posts publiés",v:stats.posts,max:50,c:"#3B82F6"}
          ].map((s,i)=>(
            <div key={i} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{fontWeight:600,color:"#E0E0E0"}}>{s.l}</span>
                <span style={{color:s.c,fontWeight:800}}>{s.v}{s.u?" "+s.u:""}</span>
              </div>
              <div style={{height:4,background:"#1A1A24",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min((s.v/s.max)*100,100)}%`,background:s.c,borderRadius:3}}/>
              </div>
            </div>
          ))}
          {/* PR Records section */}
          {Object.keys(appState.exercises||{}).some(n=>["Développé couché","Squat","Soulevé de terre","Développé militaire","Rowing barre","Hip thrust","Presse","Tractions"].includes(n))&&(
            <div style={{marginTop:14}}>
              <div style={{fontSize:12,fontWeight:800,color:"#FBBF24",marginBottom:8,letterSpacing:".06em"}}>🏆 MES PRs</div>
              {["Développé couché","Squat","Soulevé de terre","Développé militaire","Rowing barre","Hip thrust","Presse","Tractions"].map(name=>{
                const history=(appState.exercises||{})[name];
                if(!history||history.length===0)return null;
                const pr=history.flatMap(h=>h.sets.map(s=>Number(s.weight)||0)).reduce((a,b)=>Math.max(a,b),0);
                if(pr===0)return null;
                return(
                  <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",background:"#0D0D14",borderRadius:8,marginBottom:5,border:"1px solid #1A1A24"}}>
                    <span style={{fontSize:12,color:"#E0E0E0",fontWeight:600}}>{name}</span>
                    <span style={{fontSize:14,fontWeight:900,color:"#FBBF24"}}>{pr} kg</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pin modal — centered card */}
      {showPinModal&&(
        <div className="modal-center" onClick={()=>setShowPinModal(false)} style={{zIndex:500,alignItems:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#13131A",borderRadius:20,width:"calc(100% - 32px)",maxWidth:390,maxHeight:"72vh",display:"flex",flexDirection:"column",border:"1px solid #2A2A3A",boxShadow:"0 8px 40px #000000CC",animation:"scaleIn .25s cubic-bezier(.34,1.56,.64,1)"}}>
            <div style={{padding:"18px 18px 12px",borderBottom:"1px solid #1E1E28",flexShrink:0,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:17,fontWeight:900}}>Trophées épinglés</div>
                <div style={{color:"#666",fontSize:11,marginTop:3,fontFamily:"'Barlow',sans-serif"}}>{(user.pinnedTrophies||[]).length}/3 sélectionnés</div>
              </div>
              <button onClick={()=>setShowPinModal(false)} style={{background:"#1A1A24",border:"1px solid #2A2A3A",color:"#888",borderRadius:9,padding:"7px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Fermer</button>
            </div>
            <div style={{overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"10px 14px 16px",flex:1}}>
              {unlocked.length===0
                ?<div style={{color:"#444",textAlign:"center",padding:"32px 0",fontSize:13}}>Débloque d'abord des trophées !</div>
                :unlocked.map(t=>{const p=(user.pinnedTrophies||[]).includes(t.id);return(
                  <div key={t.id} onClick={()=>togglePin(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 10px",background:p?RC[t.rarity]+"15":"#0D0D14",borderRadius:11,marginBottom:7,border:`1.5px solid ${p?RC[t.rarity]+"55":"#1A1A24"}`,cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:40,height:40,borderRadius:10,background:RC[t.rarity]+"20",border:`1px solid ${RC[t.rarity]}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{t.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:800,fontSize:13,color:"#F0F0F0"}}>{t.name}</div>
                      <div style={{color:"#555",fontSize:11,marginTop:1}}>{t.desc}</div>
                    </div>
                    <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${p?RC[t.rarity]:"#333"}`,background:p?RC[t.rarity]:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,color:"#FFF",fontWeight:700}}>{p?"✓":""}</div>
                  </div>
                )}
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post viewer modal */}


      {/* Pinned trophy detail — CENTERED with remove option */}
      {selPinnedTrophy&&(
        <div className="modal-center" onClick={()=>setSelPinnedTrophy(null)}>
          <div style={{background:"#13131A",borderRadius:20,padding:24,textAlign:"center",border:`2px solid ${RC[selPinnedTrophy.rarity]}55`,maxWidth:300,width:"calc(100% - 48px)",animation:"scaleIn .3s cubic-bezier(.34,1.56,.64,1)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:52,marginBottom:8}}>{selPinnedTrophy.icon}</div>
            <div style={{color:RC[selPinnedTrophy.rarity],fontSize:9,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>{selPinnedTrophy.rarity}</div>
            <div style={{fontSize:18,fontWeight:900,marginBottom:5}}>{selPinnedTrophy.name}</div>
            <div style={{color:"#888",fontSize:13,marginBottom:12,fontFamily:"'Barlow',sans-serif"}}>{selPinnedTrophy.desc}</div>
            <div style={{background:"#22C55E18",border:"1px solid #22C55E44",borderRadius:8,padding:"8px 12px",marginBottom:16}}>
              <div style={{color:"#22C55E",fontWeight:800,fontSize:13}}>✓ DÉBLOQUÉ</div>
              {user.trophyDates?.[selPinnedTrophy.id]&&<div style={{color:"#555",fontSize:11,marginTop:3}}>{new Date(user.trophyDates[selPinnedTrophy.id]).toLocaleDateString("fr",{day:"numeric",month:"long",year:"numeric"})}</div>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{togglePin(selPinnedTrophy.id);setSelPinnedTrophy(null);}} style={{flex:1,background:"#2A1A1A",border:"1px solid #FF3D3D44",color:"#FF6060",padding:"10px 0",borderRadius:9,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>🗑 Retirer</button>
              <button onClick={()=>setSelPinnedTrophy(null)} style={{flex:1,background:"#1A1A24",border:"1px solid #2A2A3A",color:"#AAA",padding:"10px 0",borderRadius:9,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── REFERRAL MODAL ── */}
      {showReferralModal&&(
        <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={()=>setShowReferralModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{display:"flex",flexDirection:"column",maxHeight:"85vh"}}>
            <div className="modal-handle" style={{flexShrink:0}}/>
            <div className="sa" style={{flex:1,padding:"0 16px 24px"}}>
              <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>Parrainage 🎁</div>
              <div style={{fontSize:13,color:"#555",fontFamily:"'Barlow',sans-serif",marginBottom:20,lineHeight:1.5}}>Partage ton code. Quand 5 filleuls complètent leur 1ère séance → tu gagnes 1 mois Premium gratuit.</div>

              {/* Code block */}
              <div style={{background:"#13131A",border:"1px solid #2A2A3A",borderRadius:14,padding:"16px",marginBottom:20,textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:800,color:"#555",letterSpacing:".1em",marginBottom:6,textTransform:"uppercase"}}>Ton code</div>
                <div style={{fontSize:36,fontWeight:900,letterSpacing:".2em",color:"#F0F0F0"}}>{referrals.code||"..."}</div>
                <button onClick={()=>navigator.clipboard?.writeText(referrals.code||"").catch(()=>{})}
                  style={{marginTop:10,background:"#FF3D3D18",border:"1px solid #FF3D3D44",color:"#FF6B6B",borderRadius:9,padding:"8px 20px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:".04em"}}>
                  📋 COPIER
                </button>
              </div>

              {/* Progress */}
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:700}}>Filleuls validés</span>
                  <span style={{fontSize:18,fontWeight:900,color:referrals.count>=5?"#22C55E":"#FBBF24"}}>{referrals.count}/5</span>
                </div>
                <div style={{height:8,background:"#1A1A24",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min((referrals.count/5)*100,100)}%`,background:referrals.count>=5?"#22C55E":"linear-gradient(90deg,#FF3D3D,#FBBF24)",borderRadius:4,transition:"width .6s"}}/>
                </div>
                {referrals.count>=5
                  ?<div style={{color:"#22C55E",fontSize:12,marginTop:5,fontWeight:700}}>🎉 Premium activé !</div>
                  :<div style={{color:"#444",fontSize:11,marginTop:5,fontFamily:"'Barlow',sans-serif"}}>Encore {5-referrals.count} filleul{5-referrals.count>1?"s":""} pour débloquer 1 mois Premium</div>
                }
              </div>

              {/* List */}
              {referrals.list?.length>0&&(
                <div>
                  <div style={{fontSize:11,fontWeight:800,color:"#555",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Filleuls</div>
                  {referrals.list.map(r=>(
                    <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1A1A24"}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:"#1A1A24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👤</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:13}}>@{r.pseudo}</div>
                        <div style={{fontSize:11,color:"#444",marginTop:1}}>{new Date(r.createdAt).toLocaleDateString("fr")}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:6,background:r.status==="validated"?"#22C55E18":"#1A1A24",color:r.status==="validated"?"#22C55E":"#555",border:`1px solid ${r.status==="validated"?"#22C55E33":"#2A2A3A"}`}}>
                        {r.status==="validated"?"✓ Validé":"En attente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {(!referrals.list||referrals.list.length===0)&&(
                <div style={{textAlign:"center",padding:"24px 0",color:"#333"}}>
                  <div style={{fontSize:32,marginBottom:8}}>👥</div>
                  <div style={{fontSize:13,fontFamily:"'Barlow',sans-serif"}}>Partage ton code pour inviter des amis</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SOLO CHALLENGE MODAL ── */}
      {showSoloModal&&(
        <SoloChallengeModal
          current={soloChallenge}
          appState={appState}
          onClose={()=>setShowSoloModal(false)}
          onCreate={async(data)=>{
            try{ await overrides?.createSoloChallenge?.(data); setShowSoloModal(false); }
            catch(e){ alert(e.message||"Erreur"); }
          }}
          onDelete={async()=>{await overrides?.deleteSoloChallenge?.(soloChallenge?.id);setShowSoloModal(false);}}
        />
      )}
    </div>
  );
}

// ══════════════════════ SOLO CHALLENGE MODAL ══
const SOLO_PRESETS = [
  {id:"pr_bench",   icon:"🏋️",title:"PR Développé couché",  desc:"Atteins un nouveau max au bench",   type:"pr",  exercise:"Développé couché",   unit:"kg"},
  {id:"pr_squat",   icon:"🦵",title:"PR Squat",              desc:"Atteins un nouveau max au squat",   type:"pr",  exercise:"Squat",               unit:"kg"},
  {id:"pr_dead",    icon:"💀",title:"PR Soulevé de terre",   desc:"Atteins un nouveau max au deadlift",type:"pr",  exercise:"Soulevé de terre",    unit:"kg"},
  {id:"pr_ohp",     icon:"🔝",title:"PR Développé militaire",desc:"Atteins un nouveau max au OHP",    type:"pr",  exercise:"Développé militaire", unit:"kg"},
  {id:"sessions",   icon:"🔥",title:"Séances régulières",    desc:"Complète X séances en Y jours",    type:"sessions",exercise:null,             unit:"séances"},
  {id:"volume",     icon:"📊",title:"Volume total",          desc:"Soulève X kg au total sur la période",type:"volume",exercise:null,            unit:"kg"},
];
const SOLO_XP = 150; // XP fixe pour tout défi solo
const SOLO_DURATIONS = [{d:7,l:"7 jours"},{d:14,l:"14 jours"},{d:30,l:"30 jours"}];

function SoloChallengeModal({current, onClose, onCreate, onDelete, appState}){
  const [preset,setPreset]=useState(null);
  const [duration,setDuration]=useState(SOLO_DURATIONS[1]); // default 14j
  const [target,setTarget]=useState("");
  const [loading,setLoading]=useState(false);

  const launch=async()=>{
    if(!preset||!target)return;
    setLoading(true);
    try{ await onCreate({type:preset.type,exercise:preset.exercise,title:preset.title,target:Number(target),durationDays:duration.d}); }
    catch(e){ console.error(e); }
    setLoading(false);
  };

  const timeLeft=(endDateStr)=>{
    const ms=new Date(endDateStr).getTime()-Date.now();
    if(ms<=0)return"Terminé";
    const d=Math.floor(ms/86400000);
    const h=Math.floor((ms%86400000)/3600000);
    return d>0?`${d}j ${h}h`:`${h}h`;
  };

  return(
    <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{display:"flex",flexDirection:"column",maxHeight:"90vh"}}>
        <div className="modal-handle" style={{flexShrink:0}}/>
        <div className="sa" style={{flex:1,padding:"0 16px",minHeight:0}}>
          <div style={{fontSize:22,fontWeight:900,marginBottom:4}}>🎯 Défi solo</div>
          {(()=>{
            const now=new Date();
            const dayOfWeek=now.getDay(); // 0=sun, 1=mon
            const daysUntilMonday=dayOfWeek===0?1:(8-dayOfWeek)%7||7;
            const nextMonday=new Date(now); nextMonday.setDate(now.getDate()+daysUntilMonday); nextMonday.setHours(0,0,0,0);
            const msLeft=nextMonday-now;
            const dLeft=Math.floor(msLeft/86400000); const hLeft=Math.floor((msLeft%86400000)/3600000);
            return <div style={{fontSize:13,color:"#555",fontFamily:"'Barlow',sans-serif",marginBottom:16,lineHeight:1.5}}>
              1 défi perso par semaine · <span style={{color:"#FBBF24",fontWeight:700}}>+{SOLO_XP} XP</span> si objectif atteint
              {!current&&<div style={{marginTop:4,fontSize:11,color:"#444"}}>🔄 Renouvellement dans {dLeft}j {hLeft}h</div>}
            </div>;
          })()}

          {/* Défi en cours */}
          {current&&(
            <div style={{background:"#1A0800",border:"1px solid #FF3D3D44",borderRadius:14,padding:"14px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontWeight:900,fontSize:15,marginBottom:2}}>{current.title}</div>
                  <div style={{fontSize:11,color:"#555",fontFamily:"'Barlow',sans-serif"}}>⏱ {timeLeft(current.endDate)} · +{current.xpReward||150} XP si objectif atteint</div>
                </div>
                <button onClick={onDelete} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:14}}>✕</button>
              </div>
              <div style={{marginTop:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:"#888",fontFamily:"'Barlow',sans-serif"}}>Progression</span>
                  <span style={{fontSize:14,fontWeight:900,color:"#FF6B6B"}}>{current.current} / {current.target} {current.type==="pr"||current.type==="volume"?"kg":current.type==="sessions"?"séances":"j"}</span>
                </div>
                <div style={{height:6,background:"#1A1A24",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min((current.current/current.target)*100,100)}%`,background:"linear-gradient(90deg,#FF3D3D,#FBBF24)",borderRadius:3,transition:"width .5s"}}/>
                </div>
                <div style={{fontSize:10,color:"#444",marginTop:4}}>{Math.round((current.current/current.target)*100)}% accompli</div>
              </div>
            </div>
          )}

          {!current&&<>
            {/* Preset selection */}
            <div style={{fontSize:11,fontWeight:800,color:"#555",letterSpacing:".08em",textTransform:"uppercase",marginBottom:8}}>Type de défi</div>
            {SOLO_PRESETS.map(p=>(
              <div key={p.id} onClick={()=>setPreset(preset?.id===p.id?null:p)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:preset?.id===p.id?"#FF3D3D14":"#0D0D14",border:`1.5px solid ${preset?.id===p.id?"#FF3D3D":"#1A1A24"}`,borderRadius:10,marginBottom:6,cursor:"pointer",transition:"all .15s"}}>
                <div style={{width:34,height:34,borderRadius:8,background:"#1A1A24",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{p.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:13,color:preset?.id===p.id?"#FF6B6B":"#F0F0F0"}}>{p.title}</div>
                  <div style={{fontSize:11,color:"#444",fontFamily:"'Barlow',sans-serif"}}>{p.desc}</div>
                </div>
                {preset?.id===p.id&&<span style={{color:"#FF3D3D",fontSize:15}}>✓</span>}
              </div>
            ))}

            {preset&&<>
              {/* Target */}
              <div style={{marginTop:14,marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:800,color:"#555",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Objectif ({preset.unit})</div>
                <input className="inp" type="number"
                  placeholder={preset.type==="pr"?"ex: 100":preset.type==="sessions"?"ex: 10":"ex: 5000"}
                  value={target} onChange={e=>setTarget(e.target.value)}
                  style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,textAlign:"center"}}/>
                {preset.type==="pr"&&target&&(()=>{
                  // Get current PR for this exercise
                  const exHistory=(appState?.exercises||{})[preset.exercise]||[];
                  const currentPR=exHistory.flatMap(h=>h.sets.map(s=>s.weight||0)).reduce((a,b)=>Math.max(a,b),0);
                  const minTarget=currentPR+5;
                  const isValid=Number(target)>=minTarget;
                  return <div style={{fontSize:11,marginTop:5,fontFamily:"'Barlow',sans-serif",color:isValid?"#22C55E":"#FF6060"}}>
                    {currentPR>0?`Ton PR actuel : ${currentPR}kg — minimum ${minTarget}kg requis`:`Aucun PR enregistré — fixe un objectif réaliste`}
                    {!isValid&&target&&<span style={{fontWeight:700}}> ⚠️</span>}
                  </div>;
                })()}
              </div>

              {/* Duration */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#555",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Durée</div>
                <div style={{display:"flex",gap:6}}>
                  {SOLO_DURATIONS.map(d=>(
                    <button key={d.d} onClick={()=>setDuration(d)}
                      style={{flex:1,padding:"9px 4px",background:duration.d===d.d?"#FF3D3D22":"#0D0D14",border:`1.5px solid ${duration.d===d.d?"#FF3D3D":"#1A1A24"}`,color:duration.d===d.d?"#FF6B6B":"#888",borderRadius:9,fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:800,cursor:"pointer",textAlign:"center"}}>
                      <div>{d.l}</div>
                      <div style={{fontSize:9,color:duration.d===d.d?"#FF3D3D44":"#333",marginTop:2}}>+{d.xp} XP</div>
                    </button>
                  ))}
                </div>
              </div>
            </>}
            <div style={{height:8}}/>
          </>}
        </div>

        {!current&&<div style={{padding:"12px 16px",paddingBottom:"max(16px,env(safe-area-inset-bottom,16px))",borderTop:"1px solid #1A1A24",flexShrink:0,background:"#0F0F18"}}>
          {(()=>{
            const exHistory=(preset?.type==="pr"&&(appState?.exercises||{})[preset?.exercise])||[];
            const currentPR=Array.isArray(exHistory)?exHistory.flatMap(h=>h.sets.map(s=>s.weight||0)).reduce((a,b)=>Math.max(a,b),0):0;
            const minTarget=currentPR>0?currentPR+5:1;
            const prInvalid=preset?.type==="pr"&&target&&Number(target)<minTarget;
            const canLaunch=preset&&target&&!loading&&!prInvalid;
            return <button onClick={canLaunch?launch:undefined} disabled={!canLaunch}
              style={{width:"100%",padding:"14px",background:canLaunch?"linear-gradient(135deg,#FF3D3D,#CC2020)":"#1A1A24",border:"none",color:canLaunch?"#FFF":"#444",borderRadius:12,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:900,cursor:canLaunch?"pointer":"not-allowed",letterSpacing:".06em",transition:"all .2s"}}>
              {loading?"Lancement...":prInvalid?`⚠️ Min. ${minTarget}kg requis`:canLaunch?`🎯 LANCER — ${SOLO_XP} XP`:"Choisis un défi et un objectif"}
            </button>;
          })()}
        </div>}
        {current&&<div style={{padding:"12px 16px",paddingBottom:"max(16px,env(safe-area-inset-bottom,16px))",flexShrink:0}}>
          <button onClick={onClose} style={{width:"100%",padding:"12px",background:"#1A1A24",border:"none",color:"#888",borderRadius:12,fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>Fermer</button>
        </div>}
      </div>
    </div>
  );
}

// ══════════════════════ EDIT PROFILE ══
function EditProfileModal({user,onClose,onSave}){
  const [pseudo,setPseudo]=useState(user.pseudo||"");
  const [bio,setBio]=useState(user.bio||"");
  const [poids,setPoids]=useState(String(user.poids||""));
  const [taille,setTaille]=useState(String(user.taille||""));
  const [avatarData,setAvatarData]=useState(user.avatar||"");
  const [preview,setPreview]=useState(user.avatar||"");
  const fileRef=useRef();
  const av=user.sexe==="femme"?"👩":user.sexe==="autre"?"🧑":"👨";
  const handleFile=e=>{const f=e.target.files[0];if(!f)return;const reader=new FileReader();reader.onload=ev=>{const d=ev.target.result;setPreview(d);setAvatarData(d);};reader.readAsDataURL(f);};
  const save=()=>{onSave({pseudo,bio,poids:Number(poids)||user.poids,taille:Number(taille)||user.taille,avatar:avatarData});onClose();};
  const lbl=txt=><div style={{fontSize:10,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:".09em",marginBottom:4,fontFamily:"'Barlow Condensed',sans-serif"}}>{txt}</div>;
  return(
    <div className="modal-bg" onTouchMove={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()} onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle"/>
        <div style={{padding:"0 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontSize:18,fontWeight:900}}>Modifier le profil</div>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#666",fontSize:19,cursor:"pointer"}}>✕</button>
          </div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>
            <div onClick={()=>fileRef.current.click()} style={{width:76,height:76,borderRadius:"50%",background:"#1A1A24",border:"3px solid #FF3D3D44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,cursor:"pointer",overflow:"hidden",position:"relative"}}>
              {preview&&(preview.startsWith("data:")||preview.startsWith("blob:")||preview.startsWith("http"))?<img src={preview} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:<span>{av}</span>}
              <div style={{position:"absolute",inset:0,background:"#00000077",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📷</div>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFile}/>
          <div style={{display:"flex",flexDirection:"column",gap:11,marginBottom:18}}>
            <div>{lbl("Pseudo")}<input className="inp" value={pseudo} onChange={e=>setPseudo(e.target.value)}/></div>
            <div>{lbl("Bio")}<textarea className="inp" value={bio} onChange={e=>setBio(e.target.value)} rows={3} placeholder="Tes objectifs, ton gym..." style={{resize:"none",fontFamily:"'Barlow',sans-serif",lineHeight:1.5}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <div>{lbl("Poids (kg)")}<input className="inp" type="number" value={poids} onChange={e=>setPoids(e.target.value)}/></div>
              <div>{lbl("Taille (cm)")}<input className="inp" type="number" value={taille} onChange={e=>setTaille(e.target.value)}/></div>
            </div>
          </div>
          <button className="btn-r" onClick={save}>ENREGISTRER</button>
        </div>
      </div>
    </div>
  );
}
