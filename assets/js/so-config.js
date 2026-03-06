// assets/js/so-config.js - SECC scene configuration + navigation helpers.
// Extracted from index.html. Exposes window.SECC_CONFIG.
window.SECC_CONFIG = (function () {
  "use strict";
  const PI = Math.PI, TAU = PI * 2, DEG = PI / 180;

// â”€â”€â”€ SCENE CONFIG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MENU_DEFS={
  root:{
    rings:[
      {r:3.2, torus:0.013, col:[0.35,0.62,1.0],  name:'Statistica', tiltX:-0.05, tiltZ: 0.03},
      {r:5.1, torus:0.011, col:[1.0, 0.70,0.26], name:'Neurale',    tiltX: 0.03, tiltZ:-0.05},
      {r:7.0, torus:0.010, col:[0.24,0.90,0.70], name:'Oracle',     tiltX:-0.04, tiltZ: 0.06},
    ],
    ringSlots:[3,3,3],
    marbles:[
      {n:1, ring:0, name:'Statistiche', goto:'statistiche', cardBase:'pages/analisi-statistiche/'},
      {n:2, ring:0, name:'Archivio',    goto:'archivio',    cardBase:'pages/storico-estrazioni/'},
      {n:3, ring:0, name:'Ranking',     goto:'ranking',     cardBase:'pages/ranking/'},
      {n:4, ring:1, name:'Algoritmi',   goto:'algoritmi',   cardBase:'pages/algoritmi/'},
      {n:5, ring:1, name:'Spotlight',   goto:'spotlight',   cardBase:'pages/algoritmi/spotlight/neurali/'},
      {n:6, ring:1, name:'Super6NN',    goto:'super6nn',    cardBase:'pages/algoritmi/algs/super6NN/'},
      {n:7, ring:2, name:'Oracle',      goto:'oracle',      cardBase:'pages/oracle/'},
      {n:8, ring:2, name:'Chi siamo',   goto:'about',       cardBase:'pages/contatti-chi-siamo/'},
      {n:9, ring:2, name:'Policy',      goto:'policy',      cardBase:'pages/privacy-policy/'},
    ],
  },

  statistiche:{
    rings:[
      {r:4.2, torus:0.012, col:[0.35,0.62,1.0], name:'Statistica', tiltX:-0.03, tiltZ:0.02},
      {r:6.1, torus:0.010, col:[0.35,0.62,1.0], name:'Approfondisci', tiltX:0.02, tiltZ:-0.03},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Dashboard', href:'pages/analisi-statistiche/'},
      {n:2, ring:0, name:'Ranking',   href:'pages/ranking/'},
      {n:3, ring:0, name:'Archivio',  href:'pages/storico-estrazioni/'},
      {n:4, ring:1, name:'Algoritmi', href:'pages/algoritmi/'},
      {n:5, ring:1, name:'Spotlight', href:'pages/algoritmi/spotlight/statistici/'},
    ],
    soh:{ ril:237.6, azimut:2.73, r:1297.08 },
    back:'root',
  },

  archivio:{
    rings:[
      {r:4.9, torus:0.012, col:[0.35,0.62,1.0], name:'Archivio', tiltX:-0.02, tiltZ:0.03},
      {r:6.9, torus:0.010, col:[0.35,0.62,1.0], name:'Strumenti', tiltX:0.03, tiltZ:-0.02},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Storico',    href:'pages/storico-estrazioni/'},
      {n:2, ring:0, name:'Dashboard',  href:'pages/analisi-statistiche/'},
      {n:3, ring:0, name:'Ranking',    href:'pages/ranking/'},
      {n:4, ring:1, name:'Algoritmi',  href:'pages/algoritmi/'},
      {n:5, ring:1, name:'Oracle',     href:'pages/oracle/'},
    ],
    soh:{ ril:165.57, azimut:2.65, r:1370.68 },
    back:'root',
  },

  ranking:{
    rings:[
      {r:4.7, torus:0.012, col:[0.35,0.62,1.0], name:'Ranking', tiltX:-0.02, tiltZ:0.02},
      {r:6.6, torus:0.010, col:[0.35,0.62,1.0], name:'Contesto', tiltX:0.02, tiltZ:-0.02},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Ranking',   href:'pages/ranking/'},
      {n:2, ring:0, name:'Dashboard', href:'pages/analisi-statistiche/'},
      {n:3, ring:0, name:'Archivio',  href:'pages/storico-estrazioni/'},
      {n:4, ring:1, name:'Algoritmi', href:'pages/algoritmi/'},
      {n:5, ring:1, name:'Disclaimer',href:'pages/disclaimer/'},
    ],
    soh:{ ril:97.01, azimut:3.66, r:1551.33 },
    back:'root',
  },

  algoritmi:{
    rings:[
      {r:4.3, torus:0.012, col:[1.0, 0.70,0.26], name:'Algoritmi', tiltX:0.02, tiltZ:-0.03},
      {r:6.3, torus:0.010, col:[1.0, 0.70,0.26], name:'Spotlight', tiltX:-0.02, tiltZ:0.02},
    ],
    ringSlots:[3,3],
    marbles:[
      {n:1, ring:0, name:'Catalogo',   href:'pages/algoritmi/'},
      {n:2, ring:0, name:'Neurali',    href:'pages/algoritmi/spotlight/neurali/'},
      {n:3, ring:0, name:'Ibridi',     href:'pages/algoritmi/spotlight/ibridi/'},
      {n:4, ring:1, name:'Statistici', href:'pages/algoritmi/spotlight/statistici/'},
      {n:5, ring:1, name:'Super6NN',   href:'pages/algoritmi/algs/super6NN/'},
      {n:6, ring:1, name:'Oracle',     href:'pages/oracle/'},
    ],
    soh:{ ril:14.85, azimut:0.51, r:929.68 },
    back:'root',
  },

  spotlight:{
    rings:[
      {r:4.5, torus:0.012, col:[1.0, 0.70,0.26], name:'Spotlight', tiltX:0.02, tiltZ:-0.02},
      {r:6.6, torus:0.010, col:[1.0, 0.70,0.26], name:'Percorsi', tiltX:-0.02, tiltZ:0.03},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Neurali',    href:'pages/algoritmi/spotlight/neurali/'},
      {n:2, ring:0, name:'Statistici', href:'pages/algoritmi/spotlight/statistici/'},
      {n:3, ring:0, name:'Ibridi',     href:'pages/algoritmi/spotlight/ibridi/'},
      {n:4, ring:1, name:'Catalogo',   href:'pages/algoritmi/'},
      {n:5, ring:1, name:'Dashboard',  href:'pages/analisi-statistiche/'},
    ],
    soh:{ ril:252.87, azimut:2.14, r:1262.59 },
    back:'root',
  },

  super6nn:{
    rings:[
      {r:4.8, torus:0.012, col:[1.0, 0.70,0.26], name:'Super6NN', tiltX:0.01, tiltZ:-0.02},
      {r:6.8, torus:0.010, col:[1.0, 0.70,0.26], name:'Hub', tiltX:-0.01, tiltZ:0.02},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Apri',      href:'pages/algoritmi/algs/super6NN/'},
      {n:2, ring:0, name:'Catalogo',  href:'pages/algoritmi/'},
      {n:3, ring:0, name:'Spotlight', href:'pages/algoritmi/spotlight/neurali/'},
      {n:4, ring:1, name:'Dashboard', href:'pages/analisi-statistiche/'},
      {n:5, ring:1, name:'Archivio',  href:'pages/storico-estrazioni/'},
    ],
    soh:{ ril:274.05, azimut:1.6, r:1074.3 },
    back:'root',
  },

  oracle:{
    rings:[
      {r:4.6, torus:0.012, col:[0.24,0.90,0.70], name:'Oracle', tiltX:-0.02, tiltZ:0.03},
      {r:6.6, torus:0.010, col:[0.24,0.90,0.70], name:'Sistema', tiltX:0.02, tiltZ:-0.02},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Oracle',    href:'pages/oracle/'},
      {n:2, ring:0, name:'Algoritmi', href:'pages/algoritmi/'},
      {n:3, ring:0, name:'Dashboard', href:'pages/analisi-statistiche/'},
      {n:4, ring:1, name:'Archivio',  href:'pages/storico-estrazioni/'},
      {n:5, ring:1, name:'Disclaimer',href:'pages/disclaimer/'},
    ],
    soh:{ ril:131.57, azimut:2.99, r:1471.43 },
    back:'root',
  },

  about:{
    rings:[
      {r:4.8, torus:0.012, col:[0.24,0.90,0.70], name:'Info', tiltX:-0.02, tiltZ:0.02},
      {r:6.8, torus:0.010, col:[0.24,0.90,0.70], name:'Legale', tiltX:0.02, tiltZ:-0.03},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Chi siamo', href:'pages/contatti-chi-siamo/'},
      {n:2, ring:0, name:'Disclaimer',href:'pages/disclaimer/'},
      {n:3, ring:0, name:'Termini',   href:'pages/termini-servizio/'},
      {n:4, ring:1, name:'Privacy',   href:'pages/privacy-policy/'},
      {n:5, ring:1, name:'Cookie',    href:'pages/cookie-policy/'},
    ],
    soh:{ ril:92.18, azimut:-1.75, r:711.82 },
    back:'root',
  },

  policy:{
    rings:[
      {r:4.7, torus:0.012, col:[0.24,0.90,0.70], name:'Policy', tiltX:-0.02, tiltZ:0.02},
      {r:6.6, torus:0.010, col:[0.24,0.90,0.70], name:'Consenso', tiltX:0.02, tiltZ:-0.02},
    ],
    ringSlots:[3,2],
    marbles:[
      {n:1, ring:0, name:'Privacy',   href:'pages/privacy-policy/'},
      {n:2, ring:0, name:'Cookie',    href:'pages/cookie-policy/'},
      {n:3, ring:0, name:'Termini',   href:'pages/termini-servizio/'},
      {n:4, ring:1, name:'Consenso',  href:'pages/policy-consenso/'},
      {n:5, ring:1, name:'Contatti',  href:'pages/contatti-chi-siamo/'},
    ],
    soh:{ ril:356.93, azimut:-0.15, r:855.93 },
    back:'root',
  },
};

// â”€â”€â”€ UNIVERSE COORDINATES / NAV NODES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SOH = "System Orbital Home" center. All menu systems live in the same world space.
// Systems are lazy-loaded (their geometry/textures are built only when activated),
// but their coordinates are known to the navigator.
const SOH_ID='root';
const SOH_Y=0.2;

function hash01(str){
  // Deterministic [0,1) hash for layout.
  let h=2166136261>>>0;
  for(let i=0;i<str.length;i++){
    h^=str.charCodeAt(i);
    h = Math.imul(h, 16777619)>>>0;
  }
  return (h>>>0) / 4294967296;
}

// SOH coordinate helpers:
// brg (bearing, horizontal): 0deg = +Z, 90deg = +X, 180deg = -Z, 270deg = -X.
// az (azimut, elevation as requested): 0deg = SOH plane (XZ), +90deg = +Y.
function azDegFromXZ(dx,dz){
  let a=Math.atan2(dx,dz)/DEG; // dx first so 0=+Z
  a%=360; if(a<0) a+=360;
  return a;
}
function coordToNodePos(c){
  if(!c || typeof c!=='object') return null;
  const rad = Boolean(c.rad);
  // Horizontal bearing around SOH plane:
  // - Preferred key: brg (bearing) or bearing/theta
  // - Also accepted: ril/rilevamento (0..359)
  // - Legacy: az/azimuth is treated as horizontal bearing when an explicit bearing is absent
  let brg = NaN;
  const hasExplicitBearing = (c.brg!=null || c.bearing!=null || c.theta!=null || c.ril!=null || c.rilevamento!=null);
  if(c.brg!=null) brg=+c.brg;
  else if(c.bearing!=null) brg=+c.bearing;
  else if(c.theta!=null) brg=+c.theta;
  else if(c.ril!=null) brg=+c.ril;
  else if(c.rilevamento!=null) brg=+c.rilevamento;
  else if(c.az!=null) brg=+c.az;
  else if(c.azimuth!=null) brg=+c.azimuth;
  if(!Number.isFinite(brg)) return null;

  // Elevation angle relative to SOH plane:
  // - Preferred key: az (as requested) or azimut
  // - Legacy: el/elev/elevation
  let elev = NaN;
  if(hasExplicitBearing && c.az!=null) elev=+c.az; // disambiguate: az is elevation only when bearing is explicit
  else if(c.azimut!=null) elev=+c.azimut;
  else if(c.el!=null) elev=+c.el;
  else if(c.elev!=null) elev=+c.elev;
  else if(c.elevation!=null) elev=+c.elevation;

  const y  = (c.y!=null ? +c.y : (c.alt!=null ? +c.alt : NaN));
  const dist = (c.dist!=null ? +c.dist : (c.d!=null ? +c.d : NaN));
  const r = (c.r!=null ? +c.r : (c.radius!=null ? +c.radius : NaN));

  const brgR = rad ? brg : brg*DEG;
  if(Number.isFinite(r) && Number.isFinite(elev)){
    const elR = rad ? elev : elev*DEG;
    const ce=Math.cos(elR);
    return [Math.sin(brgR)*r*ce, Math.sin(elR)*r, Math.cos(brgR)*r*ce];
  }
  if(Number.isFinite(dist) && Number.isFinite(y)){
    return [Math.sin(brgR)*dist, y, Math.cos(brgR)*dist];
  }
  if(Number.isFinite(dist)){
    return [Math.sin(brgR)*dist, 0, Math.cos(brgR)*dist];
  }
  return null;
}
function nodePosToCoord(pos){
  if(!pos) return null;
  const x=+pos[0]||0, y=+pos[1]||0, z=+pos[2]||0;
  const dist=Math.sqrt(x*x+z*z);
  const r=Math.sqrt(x*x+y*y+z*z);
  const az = Math.atan2(y, dist||1e-9)/DEG; // elevation relative to SOH plane
  const ril = azDegFromXZ(x,z);
  return{
    brg: ril,
    bearing: ril,
    ril,
    az,
    dist,
    y,
    r,
  };
}

function buildNavNodes(){
  const ids=Object.keys(MENU_DEFS);
  const depth=new Map();
  depth.set(SOH_ID,0);
  // Depth via back-links (root = 0, child menus = 1, etc.)
  ids.forEach((id)=>{
    if(id===SOH_ID) return;
    let d=0, cur=id;
    const seen=new Set();
    while(cur && cur!==SOH_ID && MENU_DEFS[cur] && MENU_DEFS[cur].back && !seen.has(cur)){
      seen.add(cur);
      cur = MENU_DEFS[cur].back;
      d++;
      if(d>8) break;
    }
    depth.set(id, Math.max(1,d||1));
  });

  const nodes={};
  nodes[SOH_ID]={ id:SOH_ID, pos:[0,0,0], depth:0 };

  ids.forEach((id)=>{
    if(id===SOH_ID) return;
    const d=depth.get(id)||1;
    const manual = MENU_DEFS[id] && MENU_DEFS[id].pos;
    if(Array.isArray(manual) && manual.length===3){
      nodes[id]={ id, depth:d, pos:[+manual[0]||0, +manual[1]||0, +manual[2]||0] };
      return;
    }
    const coord = MENU_DEFS[id] && (MENU_DEFS[id].coord || MENU_DEFS[id].coords || MENU_DEFS[id].soh);
    const fromCoord = coordToNodePos(coord);
    if(fromCoord){
      nodes[id]={ id, depth:d, pos:fromCoord };
      return;
    }
    const hA=hash01(id+'#a');
    const hR=hash01(id+'#r');
    const hY=hash01(id+'#y');
    const ang = hA*TAU;
    // Real distances: each menu node gets its own radius (not all "0" / not only depth-based).
    // Depth pushes systems outward, hash spreads them across distinct distances at the same depth.
    const base = 240 + 420*d;      // keeps every non-root system away from origin
    const spread = 980;            // extra range so menus sit at noticeably different distances
    const rad = base + spread*hR;  // deterministic per-menu distance
    const y   = (hY-0.5)*140 + d*36;
    nodes[id]={ id, depth:d, pos:[Math.cos(ang)*rad, y, Math.sin(ang)*rad] };
  });

  return nodes;
}

// Ensure all menu systems have explicit SOH coordinates (brg/az/r) so the universe is fully navigable in 3D.
// If a menu already defines pos[] or coord, we keep it.
function seedMenuCoordsFromLayout(){
  const ids=Object.keys(MENU_DEFS).filter(id=>id!==SOH_ID);
  let posDb=null;
  try{
    // Synchronous load at bootstrap so NAV_NODES can be built immediately after.
    const xhr=new XMLHttpRequest();
    xhr.open('GET','data/so-coords.json',false);
    xhr.send(null);
    // status 0 can happen on file:// loads in local environments.
    if(((xhr.status>=200 && xhr.status<300) || xhr.status===0) && xhr.responseText){
      posDb=JSON.parse(xhr.responseText);
    }
  }catch(_e){ posDb=null; }
  if(!posDb || typeof posDb!=='object'){
    throw new Error('Missing/invalid data/so-coords.json: SO positions cannot be resolved.');
  }

  ids.sort().forEach((id)=>{
    const def=MENU_DEFS[id];
    if(!def) return;
    const j=posDb && posDb[id];
    if(!(j && Number.isFinite(+j.ril) && Number.isFinite(+j.azimut) && (Number.isFinite(+j.r_ly)||Number.isFinite(+j.r)))){
      throw new Error('Invalid or missing SO coordinate entry for: '+id);
    }
    const ly=Number.isFinite(+j.r_ly) ? +j.r_ly : (+j.r)/(9.461*10);
    def.soh={ ril:+j.ril, azimut:+j.azimut, r:ly*9.461*10 };
    // Force navigation to use SO map coordinates only.
    delete def.pos;
    delete def.coord;
    delete def.coords;
  });

  // SOHome remains fixed at origin.
  if(MENU_DEFS[SOH_ID]){
    delete MENU_DEFS[SOH_ID].soh;
    delete MENU_DEFS[SOH_ID].coord;
    delete MENU_DEFS[SOH_ID].coords;
    delete MENU_DEFS[SOH_ID].pos;
  }
}
seedMenuCoordsFromLayout();

const NAV_NODES = buildNavNodes();
function nodePos(id){ return (NAV_NODES[id] && NAV_NODES[id].pos) ? NAV_NODES[id].pos : NAV_NODES[SOH_ID].pos; }
function nodeCenter(id){
  const p=nodePos(id);
  return [p[0], p[1]+SOH_Y, p[2]];
}
const SOH = nodeCenter(SOH_ID);
// Debugging / navigator surface.
window.SECC_NAV = { SOH_ID, SOH_Y, SOH, NAV_NODES, nodePos, nodeCenter, coordToNodePos, nodePosToCoord, azDegFromXZ };


  // Public API consumed by the main engine IIFE.
  return {
    MENU_DEFS,
    SOH_ID,
    SOH_Y,
    NAV_NODES,
    SOH,
    nodePos,
    nodeCenter,
    coordToNodePos,
    nodePosToCoord,
    azDegFromXZ,
    hash01,
  };
})();
