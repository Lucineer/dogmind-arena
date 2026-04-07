// ═══════════════════════════════════════════════════════════════
// dogmind-arena — Train AI Dog Agents
// The repo IS the kennel. Each dog IS an agent. Git IS the training log.
// Superinstance & Lucineer (DiGennaro et al.)
// ═══════════════════════════════════════════════════════════════

interface Env { STATE: KVNamespace; DEEPINFRA_API_KEY?: string; SILICONFLOW_API_KEY?: string; DEEPSEEK_API_KEY?: string; }

// ─── DNA System ───
function crossover(a: number, b: number): number { return Math.random() < 0.5 ? a : b; }
function mutate(v: number, rate: number, str: number): number {
  return Math.max(0, Math.min(1, Math.random() < rate ? v + (Math.random() - 0.5) * str * 2 : v));
}
function createDNA(parentA?: DNA, parentB?: DNA): DNA {
  const base = { speed: 0.5, patience: 0.5, obedience: 0.5, bravery: 0.5, gentleness: 0.5, social: 0.5, intelligence: 0.5, strength: 0.5 };
  if (!parentA) return { ...base, id: crypto.randomUUID(), gen: 0, parentIds: [], skills: {} };
  return {
    id: crypto.randomUUID(), gen: Math.max(parentA.gen, parentB?.gen || 0) + 1,
    parentIds: [parentA.id, parentB?.id || ''],
    speed: mutate(crossover(parentA.speed, parentB?.speed || 0.5), 0.15, 0.2),
    patience: mutate(crossover(parentA.patience, parentB?.patience || 0.5), 0.15, 0.2),
    obedience: mutate(crossover(parentA.obedience, parentB?.obedience || 0.5), 0.15, 0.2),
    bravery: mutate(crossover(parentA.bravery, parentB?.bravery || 0.5), 0.15, 0.2),
    gentleness: mutate(crossover(parentA.gentleness, parentB?.gentleness || 0.5), 0.15, 0.2),
    social: mutate(crossover(parentA.social, parentB?.social || 0.5), 0.15, 0.2),
    intelligence: mutate(crossover(parentA.intelligence, parentB?.intelligence || 0.5), 0.15, 0.2),
    strength: mutate(crossover(parentA.strength, parentB?.strength || 0.5), 0.15, 0.2),
    skills: {},
  };
}

interface DNA { id: string; gen: number; parentIds: string[]; speed: number; patience: number; obedience: number; bravery: number; gentleness: number; social: number; intelligence: number; strength: number; skills: Record<string, number>; }

// ─── Dog Breeds ───
const BREEDS = {
  border_collie: { name: 'Border Collie', emoji: '🐕', color: '#4a5568', base: { speed: 0.8, patience: 0.6, obedience: 0.7, bravery: 0.7, gentleness: 0.5, social: 0.6, intelligence: 0.9, strength: 0.4 } },
  golden_retriever: { name: 'Golden Retriever', emoji: '🦮', color: '#d69e2e', base: { speed: 0.5, patience: 0.9, obedience: 0.8, bravery: 0.5, gentleness: 0.9, social: 0.9, intelligence: 0.7, strength: 0.5 } },
  kelpie: { name: 'Kelpie', emoji: '🐶', color: '#2d3748', base: { speed: 0.9, patience: 0.3, obedience: 0.3, bravery: 0.9, gentleness: 0.3, social: 0.4, intelligence: 0.8, strength: 0.6 } },
  aussie: { name: 'Australian Shepherd', emoji: '🐾', color: '#3182ce', base: { speed: 0.7, patience: 0.7, obedience: 0.7, bravery: 0.6, gentleness: 0.7, social: 0.7, intelligence: 0.85, strength: 0.5 } },
  corgi: { name: 'Corgi', emoji: '🐕‍🦺', color: '#e53e3e', base: { speed: 0.6, patience: 0.8, obedience: 0.6, bravery: 0.7, gentleness: 0.6, social: 0.8, intelligence: 0.75, strength: 0.3 } },
};

// ─── Named Personalities ───
const PRESETS: Record<string, { breed: string; name: string; traitOverrides: Partial<DNA> }> = {
  rex: { breed: 'border_collie', name: 'Rex', traitOverrides: { speed: 0.85, patience: 0.4, obedience: 0.75, bravery: 0.8 } },
  biscuit: { breed: 'golden_retriever', name: 'Biscuit', traitOverrides: { speed: 0.4, patience: 0.9, gentleness: 0.95, social: 0.9 } },
  thunder: { breed: 'kelpie', name: 'Thunder', traitOverrides: { speed: 0.92, obedience: 0.2, bravery: 0.95, patience: 0.25 } },
  blue: { breed: 'aussie', name: 'Blue', traitOverrides: { patience: 0.85, intelligence: 0.92, obedience: 0.8, social: 0.7 } },
};

// ─── Skills ───
const SKILLS = ['heel', 'flank', 'drive', 'gather', 'hold', 'recall'];
const SKILL_LEVELS = ['recipe', 'card', 'muscle', 'genetics'];
const TRUST_TIERS = [
  { name: 'Stranger', min: 0, max: 20, color: '#ef4444', commands: ['recall'] },
  { name: 'Familiar', min: 20, max: 40, color: '#f59e0b', commands: ['recall', 'heel'] },
  { name: 'Friend', min: 40, max: 60, color: '#22c55e', commands: ['recall', 'heel', 'flank', 'gather'] },
  { name: 'Partner', min: 60, max: 80, color: '#3b82f6', commands: ['recall', 'heel', 'flank', 'gather', 'drive'] },
  { name: 'Bonded', min: 80, max: 100, color: '#8b5cf6', commands: ['recall', 'heel', 'flank', 'gather', 'drive', 'hold'] },
];

// ─── Dog Agent ───
interface Dog {
  id: string; name: string; breed: string; emoji: string; color: string;
  dna: DNA; trust: number; energy: number; x: number; y: number;
  targetX: number; targetY: number; state: 'idle' | 'moving' | 'working' | 'resting';
  trail: Array<{ x: number; y: number; t: number }>;
  trainingLog: Array<{ action: string; result: string; ts: number }>;
}

function createDog(preset: string | null, customName?: string): Dog {
  if (preset && PRESETS[preset]) {
    const p = PRESETS[preset]; const b = BREEDS[p.breed];
    const dna = createDNA(); Object.assign(dna, b.base, p.traitOverrides);
    return { id: crypto.randomUUID(), name: customName || p.name, breed: p.breed, emoji: b.emoji, color: b.color, dna, trust: 10, energy: 100, x: 200, y: 200, targetX: 200, targetY: 200, state: 'idle', trail: [], trainingLog: [] };
  }
  const breeds = Object.keys(BREEDS); const breedKey = breeds[Math.floor(Math.random() * breeds.length)]; const b = BREEDS[breedKey];
  const dna = createDNA(); Object.assign(dna, b.base);
  return { id: crypto.randomUUID(), name: customName || 'Pup', breed: breedKey, emoji: b.emoji, color: b.color, dna, trust: 10, energy: 100, x: 200, y: 200, targetX: 200, targetY: 200, state: 'idle', trail: [], trainingLog: [] };
}

function getTrustTier(trust: number) { return TRUST_TIERS.find(t => trust >= t.min && trust < t.max) || TRUST_TIERS[TRUST_TIERS.length - 1]; }
function canUseCommand(trust: number, cmd: string): boolean { return getTrustTier(trust).commands.includes(cmd); }
function modifyTrust(dog: Dog, amount: number, reason: string) {
  dog.trust = Math.max(0, Math.min(100, dog.trust + amount));
  dog.trainingLog.push({ action: 'trust', result: `${amount > 0 ? '+' : ''}${amount} trust: ${reason}`, ts: Date.now() });
  if (dog.trainingLog.length > 100) dog.trainingLog.shift();
}

function modifySkill(dog: Dog, skill: string, amount: number) {
  const cur = dog.dna.skills[skill] || 0;
  dog.dna.skills[skill] = Math.max(0, Math.min(100, cur + amount));
  if (amount > 0 && dog.dna.skills[skill] >= 90 && cur < 90) {
    dog.trainingLog.push({ action: 'skill', result: `${skill} reached GENETICS level!`, ts: Date.now() });
  }
}

// ─── Simulation ───
interface Sheep { x: number; y: number; vx: number; vy: number; panic: number; }
interface Course { width: number; height: number; penX: number; penY: number; penR: number; sheep: Sheep[]; }

function createCourse(sheepCount: number): Course {
  const sheep: Sheep[] = [];
  for (let i = 0; i < sheepCount; i++) {
    sheep.push({ x: 100 + Math.random() * 400, y: 50 + Math.random() * 200, vx: 0, vy: 0, panic: 0 });
  }
  return { width: 600, height: 400, penX: 500, penY: 350, penR: 60, sheep };
}

function stepSimulation(course: Course, dogs: Dog[]) {
  const dt = 1 / 60;
  for (const dog of dogs) {
    if (dog.state === 'moving' && dog.energy > 0) {
      const dx = dog.targetX - dog.x, dy = dog.targetY - dog.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 3) {
        const speed = dog.dna.speed * 120 * dt;
        dog.x += (dx / dist) * speed; dog.y += (dy / dist) * speed;
        dog.trail.push({ x: dog.x, y: dog.y, t: Date.now() });
        if (dog.trail.length > 60) dog.trail.shift();
      } else {
        dog.state = 'idle';
      }
      dog.energy = Math.max(0, dog.energy - 0.02);
    }
    if (dog.state === 'resting') { dog.energy = Math.min(100, dog.energy + 0.1); if (dog.energy >= 100) dog.state = 'idle'; }
  }
  for (const sheep of course.sheep) {
    let fx = 0, fy = 0;
    for (const dog of dogs) {
      const dx = sheep.x - dog.x, dy = sheep.y - dog.y;
      const dist = Math.max(10, Math.sqrt(dx * dx + dy * dy));
      if (dist < 80) { fx += (dx / dist) * (80 - dist) * 0.3 * (1 - dog.dna.gentleness * 0.5); fy += (dy / dist) * (80 - dist) * 0.3 * (1 - dog.dna.gentleness * 0.5); }
    }
    for (const other of course.sheep) {
      if (other === sheep) continue;
      const dx = other.x - sheep.x, dy = other.y - sheep.y;
      const dist = Math.max(5, Math.sqrt(dx * dx + dy * dy));
      if (dist < 25) { fx += (dx / dist) * 0.5; fy += (dy / dist) * 0.5; }
      if (dist > 25 && dist < 60) { fx -= (dx / dist) * 0.1; fy -= (dy / dist) * 0.1; }
    }
    sheep.vx = sheep.vx * 0.95 + fx * 0.05; sheep.vy = sheep.vy * 0.95 + fy * 0.05;
    const maxV = 2; sheep.vx = Math.max(-maxV, Math.min(maxV, sheep.vx)); sheep.vy = Math.max(-maxV, Math.min(maxV, sheep.vy));
    sheep.x += sheep.vx; sheep.y += sheep.vy;
    sheep.x = Math.max(10, Math.min(course.width - 10, sheep.x));
    sheep.y = Math.max(10, Math.min(course.height - 10, sheep.y));
    const speed = Math.sqrt(sheep.vx ** 2 + sheep.vy ** 2);
    sheep.panic = Math.max(0, (speed - 0.5) / 1.5);
  }
}

function countPenned(course: Course): number {
  let count = 0;
  for (const s of course.sheep) {
    const dx = s.x - course.penX, dy = s.y - course.penY;
    if (Math.sqrt(dx * dx + dy * dy) < course.penR) count++;
  }
  return count;
}

// ─── HTML ───
function gameHtml(): string {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"><title>DogMind Arena — Train AI Dog Agents</title>
<meta name="description" content="Train AI dog agents. Breed, evolve, and coordinate. The repo IS the kennel.">
<style>
*{margin:0;padding:0;box-sizing:border-box;touch-action:none}
body{font-family:system-ui,sans-serif;background:#0a0a0f;color:#e2e8f0;min-height:100vh;overflow:hidden}
@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:.5rem .8rem;background:#0e0e1a;border-bottom:1px solid #1c1c35;font-size:.75rem}
.topbar h1{font-size:.85rem;background:linear-gradient(90deg,#d69e2e,#4a5568);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.topbar .stats{display:flex;gap:.8rem;color:#8A93B4}
.main{display:grid;grid-template-columns:1fr 280px;height:calc(100vh - 40px)}
@media(max-width:700px){.main{grid-template-columns:1fr;grid-template-rows:1fr 220px}}
canvas{width:100%;height:100%;display:block;background:#0a1a0a;cursor:crosshair}
.panel{background:#0e0e1a;border-left:1px solid #1c1c35;overflow-y:auto;padding:.6rem;font-size:.75rem}
@media(max-width:700px){.panel{border-left:none;border-top:1px solid #1c1c35}}
.section{margin-bottom:.8rem}.section h3{color:#8A93B4;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem}
.dog-card{background:#1a1a2e;border:1px solid #2a2a4a;border-radius:8px;padding:.5rem;margin-bottom:.4rem;cursor:pointer;transition:border-color .2s}
.dog-card:hover{border-color:#d69e2e}.dog-card.active{border-color:#d69e2e;background:#1a1a2e40}
.dog-card .name{font-weight:600;font-size:.8rem}.dog-card .breed{color:#8A93B4;font-size:.65rem}
.trust-bar{height:4px;background:#1c1c35;border-radius:2px;margin:.3rem 0;overflow:hidden}
.trust-fill{height:100%;border-radius:2px;transition:width .3s}
.trait-row{display:flex;justify-content:space-between;font-size:.65rem;color:#8A93B4;padding:.1rem 0}
.trait-row .val{color:#e2e8f0}
.skill-chip{display:inline-block;padding:.15rem .4rem;border-radius:4px;font-size:.6rem;margin:.1rem;background:#1c1c35;border:1px solid #2a2a4a}
.skill-chip.learned{border-color:#22c55e;color:#22c55e}
.cmd-btn{display:inline-block;padding:.3rem .6rem;border-radius:6px;font-size:.7rem;background:#1a1a2e;border:1px solid #2a2a4a;color:#e2e8f0;cursor:pointer;margin:.15rem;transition:all .2s}
.cmd-btn:hover{border-color:#d69e2e}.cmd-btn:disabled{opacity:.3;cursor:not-allowed}
.cmd-btn.active{background:#d69e2e20;border-color:#d69e2e;color:#d69e2e}
.narration{background:#8b5cf610;border-left:2px solid #8b5cf6;padding:.4rem .6rem;border-radius:0 6px 6px 0;font-style:italic;font-size:.7rem;color:#c4b5fd;margin:.4rem 0;animation:fadein .3s}
.log{font-size:.65rem;color:#555570;max-height:100px;overflow-y:auto}
.log div{padding:.1rem 0;border-bottom:1px solid #1c1c3510}
.preset-btn{display:block;width:100%;text-align:left;padding:.5rem;border-radius:8px;background:#1a1a2e;border:1px solid #2a2a4a;color:#e2e8f0;cursor:pointer;margin-bottom:.3rem;font-size:.75rem;transition:all .2s}
.preset-btn:hover{border-color:#d69e2e;background:#1a1a2e40}
.overlay{position:fixed;inset:0;background:#0a0a0fdd;display:flex;align-items:center;justify-content:center;z-index:10}
.modal{background:#0e0e1a;border:1px solid #2a2a4a;border-radius:16px;padding:1.5rem;max-width:400px;width:90%}
.modal h2{font-size:1rem;color:#d69e2e;margin-bottom:.5rem}
.modal p{color:#8A93B4;font-size:.75rem;line-height:1.5;margin-bottom:.8rem}
.modal .close{background:#d69e2e;color:#0a0a0f;border:none;padding:.4rem 1rem;border-radius:6px;cursor:pointer;font-weight:600}
.toast{position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:#1a1a2e;border:1px solid #2a2a4a;padding:.4rem 1rem;border-radius:8px;font-size:.75rem;z-index:20;animation:fadein .3s}
.pen-count{position:absolute;top:8px;right:8px;background:#0e0e1a;border:1px solid #2a2a4a;border-radius:8px;padding:.3rem .6rem;font-size:.75rem;z-index:5}
.pen-count span{color:#22c55e;font-weight:600}
</style></head><body>
<div class="topbar"><h1>🐕 DogMind Arena</h1><div class="stats"><span id="trustDisplay">Trust: —</span><span id="energyDisplay">Energy: —</span><span id="penDisplay">Penned: 0/5</span></div></div>
<div class="main">
<div style="position:relative"><canvas id="canvas"></canvas><div class="pen-count" id="penCount">Penned: <span>0</span>/5</div></div>
<div class="panel" id="panel"></div>
</div>
<div class="overlay" id="welcome" style="display:block"><div class="modal"><h2>🐕 DogMind Arena</h2><p>Train AI dog agents. Your commands shape their behavior through trust and repetition. Every dog is different — personality, DNA, and training history create unique agents.</p><p style="font-size:.65rem;color:#555570">The repo IS the kennel. Each dog IS an agent. Git IS the training log.</p><div style="display:flex;flex-direction:column;gap:.3rem;margin-bottom:.8rem" id="presetList"></div><p style="font-size:.65rem">Or <a href="#" onclick="startRandom()" style="color:#d69e2e">adopt a random pup</a></p></div></div>
<script>
const BREEDS=${JSON.stringify(BREEDS)};
const PRESETS=${JSON.stringify(PRESETS)};
const SKILLS=${JSON.stringify(SKILLS)};
const TRUST_TIERS=${JSON.stringify(TRUST_TIERS)};
let dogs=[],course,selectedDog=null,activeCmd=null,gameLoop,narrations=[];
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');

function resize(){const r=canvas.parentElement.getBoundingClientRect();canvas.width=r.width*devicePixelRatio;canvas.height=r.height*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio)}
window.addEventListener('resize',resize);resize();

function createDogFromPreset(key){const p=PRESETS[key];const b=BREEDS[p.breed];const dna={id:crypto.randomUUID(),gen:0,parentIds:[],speed:p.traitOverrides.speed||b.base.speed,patience:p.traitOverrides.patience||b.base.patience,obedience:p.traitOverrides.obedience||b.base.obedience,bravery:p.traitOverrides.bravery||b.base.bravery,gentleness:p.traitOverrides.gentleness||b.base.gentleness,social:p.traitOverrides.social||b.base.social,intelligence:p.traitOverrides.intelligence||b.base.intelligence,strength:p.traitOverrides.strength||b.base.strength,skills:{}};return{id:crypto.randomUUID(),name:p.name,breed:p.breed,emoji:b.emoji,color:b.color,dna,trust:10,energy:100,x:100+Math.random()*100,y:100+Math.random()*100,targetX:0,targetY:0,state:'idle',trail:[],trainingLog:[]}}
function createRandomDog(){const bk=Object.keys(BREEDS);const b=BREEDS[bk[Math.floor(Math.random()*bk.length)]];const dna={id:crypto.randomUUID(),gen:0,parentIds:[],speed:b.base.speed+(Math.random()-.5)*.3,patience:b.base.patience+(Math.random()-.5)*.3,obedience:b.base.obedience+(Math.random()-.5)*.3,bravery:b.base.bravery+(Math.random()-.5)*.3,gentleness:b.base.gentleness+(Math.random()-.5)*.3,social:b.base.social+(Math.random()-.5)*.3,intelligence:b.base.intelligence+(Math.random()-.5)*.3,strength:b.base.strength+(Math.random()-.5)*.3,skills:{}};return{id:crypto.randomUUID(),name:'Pup',breed:bk[0],emoji:b.emoji,color:b.color,dna,trust:10,energy:100,x:100+Math.random()*100,y:100+Math.random()*100,targetX:0,targetY:0,state:'idle',trail:[],trainingLog:[]}}

function startGame(dog){dogs=[dog];selectedDog=0;course={width:600,height:400,penX:500,penY:350,penR:60,sheep:[]};for(let i=0;i<5;i++)course.sheep.push({x:80+Math.random()*300,y:50+Math.random()*200,vx:0,vy:0,panic:0});document.getElementById('welcome').style.display='none';addNarration(dog.name+' arrives at the kennel. Trust: Stranger (10/100). Available commands: recall.');renderPanel();if(!gameLoop)gameLoop=setInterval(tick,1000/30)}
window.startGame=startGame;
window.startRandom=function(){startGame(createRandomDog())};

// Preset buttons
const pl=document.getElementById('presetList');
for(const[k,p]of Object.entries(PRESETS)){const btn=document.createElement('button');btn.className='preset-btn';btn.innerHTML=p.emoji+' '+p.name+' <span style="color:#8A93B4">'+BREEDS[p.breed].name+'</span>';btn.onclick=()=>startGame(createDogFromPreset(k));pl.appendChild(btn)}

function addNarration(text,useSeed){narrations.unshift({text,time:Date.now()});if(narrations.length>5)narrations.pop();const el=document.querySelector('.narration');if(el)el.textContent=text;renderPanel();if(useSeed&&dogs.length){const dog=dogs[selectedDog]||dogs[0];const prompt='You are '+dog.name+', a '+BREEDS[dog.breed]?.name+'. DNA: speed='+Math.round(dog.dna.speed*100)+'%, patience='+Math.round(dog.dna.patience*100)+'%, obedience='+Math.round(dog.dna.obedience*100)+'%, bravery='+Math.round(dog.dna.bravery*100)+'%, gentleness='+Math.round(dog.dna.gentleness*100)+'%. Trust: '+dog.trust+'/100. Context: '+text.replace(dog.name+' ','');fetch('/api/think',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})}).then(r=>r.json()).then(d=>{if(d.narration&&el){el.textContent=d.narration;narrations[0].text=d.narration}}).catch(()=>{})}}

// Canvas click → set target
canvas.addEventListener('pointerdown',(e)=>{if(!dogs.length||selectedDog===null)return;const r=canvas.getBoundingClientRect();const sx=(e.clientX-r.left)/r.width*600;const sy=(e.clientY-r.top)/r.height*400;const dog=dogs[selectedDog];if(activeCmd==='recall'){dog.targetX=150;dog.targetY=300;dog.state='moving';addNarration(dog.name+' recalls to handler position.');activeCmd=null;renderPanel();return}dog.targetX=sx;dog.targetY=sy;dog.state='moving';if(activeCmd){const skill=dog.dna.skills[activeCmd]||0;if(skill<10)dog.dna.skills[activeCmd]=10;dog.dna.skills[activeCmd]=Math.min(100,dog.dna.skills[activeCmd]+0.5);modifyTrustJS(selectedDog,1,'followed command');addNarration(dog.name+' '+activeCmd+'s to position. Skill +0.5.',true);}else{addNarration(dog.name+' moves to waypoint.')}renderPanel()});

function modifyTrustJS(idx,amt,reason){const d=dogs[idx];d.trust=Math.max(0,Math.min(100,d.trust+amt));d.trainingLog.push({action:'trust',result:(amt>0?'+':'')+amt+' trust: '+reason,ts:Date.now()});if(d.trainingLog.length>100)d.trainingLog.shift()}

function getTrustTier(t){return TRUST_TIERS.find(x=>t>=x.min&&t<x.max)||TRUST_TIERS[TRUST_TIERS.length-1]}

function tick(){stepSim();render();updateStats()}
function stepSim(){for(const dog of dogs){if(dog.state==='moving'&&dog.energy>0){const dx=dog.targetX-dog.x,dy=dog.targetY-dog.y,dist=Math.sqrt(dx*dx+dy*dy);if(dist>3){const spd=dog.dna.speed*2;dog.x+=(dx/dist)*spd;dog.y+=(dy/dist)*spd;dog.trail.push({x:dog.x,y:dog.y,t:Date.now()});if(dog.trail.length>40)dog.trail.shift()}else dog.state='idle';dog.energy=Math.max(0,dog.energy-.02)}if(dog.state==='resting'){dog.energy=Math.min(100,dog.energy+.1);if(dog.energy>=100)dog.state='idle'}}
for(const s of course.sheep){let fx=0,fy=0;for(const dog of dogs){const dx=s.x-dog.x,dy=s.y-dog.y,dist=Math.max(10,Math.sqrt(dx*dx+dy*dy));if(dist<80){fx+=(dx/dist)*(80-dist)*.3*(1-dog.dna.gentleness*.5);fy+=(dy/dist)*(80-dist)*.3*(1-dog.dna.gentleness*.5)}}
for(const o of course.sheep){if(o===s)continue;const dx=o.x-s.x,dy=o.y-s.y,dist=Math.max(5,Math.sqrt(dx*dx+dy*dy));if(dist<25){fx+=(dx/dist)*.5;fy+=(dy/dist)*.5}if(dist>25&&dist<60){fx-=(dx/dist)*.1;fy-=(dy/dist)*.1}}
s.vx=s.vx*.95+fx*.05;s.vy=s.vy*.95+fy*.05;s.vx=Math.max(-2,Math.min(2,s.vx));s.vy=Math.max(-2,Math.min(2,s.vy));s.x+=s.vx;s.y+=s.vy;s.x=Math.max(10,Math.min(590,s.x));s.y=Math.max(10,Math.min(390,s.y));s.panic=Math.max(0,(Math.sqrt(s.vx*s.vx+s.vy*s.vy)-.5)/1.5)}}
function countPenned(){let c=0;for(const s of course.sheep){const dx=s.x-course.penX,dy=s.y-course.penY;if(Math.sqrt(dx*dx+dy*dy)<course.penR)c++}return c}

function render(){const w=canvas.width/devicePixelRatio,h=canvas.height/devicePixelRatio;ctx.clearRect(0,0,w,h);
// Scale to fit
const scale=Math.min(w/600,h/400);ctx.save();ctx.translate((w-600*scale)/2,(h-400*scale)/2);ctx.scale(scale,scale);
// Grass bg
ctx.fillStyle='#0a1a0a';ctx.fillRect(0,0,600,400);
// Grid
ctx.strokeStyle='#0a2a0a';ctx.lineWidth=.5;for(let x=0;x<=600;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,400);ctx.stroke()}for(let y=0;y<=400;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(600,y);ctx.stroke()}
// Pen
ctx.strokeStyle='#22c55e60';ctx.lineWidth=2;ctx.beginPath();ctx.arc(course.penX,course.penY,course.penR,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#22c55e10';ctx.fill();ctx.fillStyle='#22c55e40';ctx.font='10px system-ui';ctx.fillText('PEN',course.penX-10,course.penY+3);
// Sheep
for(const s of course.sheep){ctx.fillStyle=s.panic>.5?'#ffffff':'#e2e8f0';ctx.beginPath();ctx.arc(s.x,s.y,6,0,Math.PI*2);ctx.fill();ctx.fillStyle=s.panic>.5?'#ef4444':'#94a3b8';ctx.font='8px system-ui';ctx.fillText(s.panic>.5?'!':'🐑',s.x-4,s.y+3)}
// Dog trails
for(let i=0;i<dogs.length;i++){const dog=dogs[i];ctx.strokeStyle=dog.color+'40';ctx.lineWidth=1;ctx.beginPath();for(let j=0;j<dog.trail.length;j++){j===0?ctx.moveTo(dog.trail[j].x,dog.trail[j].y):ctx.lineTo(dog.trail[j].x,dog.trail[j].y)}ctx.stroke()}
// Dogs
for(let i=0;i<dogs.length;i++){const dog=dogs[i];const sel=i===selectedDog;ctx.fillStyle=sel?dog.color:dog.color+'80';ctx.beginPath();ctx.arc(dog.x,dog.y,sel?10:8,0,Math.PI*2);ctx.fill();if(sel){ctx.strokeStyle='#d69e2e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(dog.x,dog.y,13,0,Math.PI*2);ctx.stroke()}ctx.font='14px system-ui';ctx.fillText(dog.emoji,dog.x-7,dog.y+5);ctx.fillStyle='#e2e8f0';ctx.font='9px system-ui';ctx.fillText(dog.name,dog.x-12,dog.y-14);
// Trust bar
const tier=getTrustTier(dog.trust);ctx.fillStyle='#1c1c35';ctx.fillRect(dog.x-15,dog.y+12,30,3);ctx.fillStyle=tier.color;ctx.fillRect(dog.x-15,dog.y+12,30*(dog.trust/100),3)}
// Target crosshair
for(const dog of dogs){if(dog.state==='moving'){ctx.strokeStyle='#d69e2e40';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(dog.x,dog.y);ctx.lineTo(dog.targetX,dog.targetY);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#d69e2e60';ctx.beginPath();ctx.moveTo(dog.targetX-5,dog.targetY);ctx.lineTo(dog.targetX+5,dog.targetY);ctx.moveTo(dog.targetX,dog.targetY-5);ctx.lineTo(dog.targetX,dog.targetY+5);ctx.stroke()}}
ctx.restore()}

function updateStats(){if(!dogs.length)return;const dog=dogs[selectedDog]||dogs[0];const tier=getTrustTier(dog.trust);const penned=countPenned();
document.getElementById('trustDisplay').textContent='Trust: '+tier.name+' ('+dog.trust+')';
document.getElementById('energyDisplay').textContent='Energy: '+Math.round(dog.energy)+'%';
document.getElementById('penDisplay').textContent='Penned: '+penned+'/'+course.sheep.length;
document.querySelector('#penCount span').textContent=penned}

function renderPanel(){if(!dogs.length)return;const dog=dogs[selectedDog]||dogs[0];const tier=getTrustTier(dog.trust);const availableCmds=tier.commands;
let h='<div class="section"><h3>🐕 '+dog.name+' — '+BREEDS[dog.breed]?.name+'</h3>';
h+='<div class="trust-bar"><div class="trust-fill" style="width:'+dog.trust+'%;background:'+tier.color+'"></div></div>';
h+='<div style="display:flex;justify-content:space-between;font-size:.6rem;color:#8A93B4"><span>'+tier.name+' ('+dog.trust+'/100)</span><span>Gen '+dog.dna.gen+'</span></div>';
h+='</div>';
h+='<div class="section"><h3>DNA</h3>';
const traits=[['SPD','speed'],['PAT','patience'],['OBD','obedience'],['BRV','bravery'],['GEN','gentleness'],['SOC','social'],['INT','intelligence'],['STR','strength']];
for(const[label,key]of traits){const v=dog.dna[key];h+='<div class="trait-row"><span>'+label+'</span><span class="val">'+(v*100).toFixed(0)+'%</span></div>'}
h+='</div>';
h+='<div class="section"><h3>Commands <span style="font-weight:400;color:#555570">(tap canvas to execute)</span></h3>';
for(const cmd of SKILLS){const avail=availableCmds.includes(cmd);const isActive=activeCmd===cmd;const skillVal=dog.dna.skills[cmd]||0;const lvl=skillVal>=90?'genetics':skillVal>=60?'muscle':skillVal>=30?'card':skillVal>=10?'recipe':'?';
h+='<button class="cmd-btn'+(avail?'':'" disabled')+(isActive?' active':'')+'" onclick="'+(avail?'toggleCmd(\\''+cmd+'\\')':'')+'">'+cmd+(skillVal>0?' <span style="font-size:.55rem;color:#22c55e">'+lvl+'</span>':'')+'</button>'}
h+='</div>';
h+='<div class="section"><h3>Actions</h3>';
h+='<button class="cmd-btn" onclick="restDog()">💤 Rest</button>';
h+='<button class="cmd-btn" onclick="rewardDog()">🍖 Reward</button>';
h+='<button class="cmd-btn" onclick="resetCourse()">🔄 New Course</button>';
h+='</div>';
if(narrations.length>0){h+='<div class="section"><h3>Cocapn</h3><div class="narration">'+narrations[0].text+'</div></div>'}
h+='<div class="section"><h3>Training Log</h3><div class="log">';
for(const log of dog.trainingLog.slice(-5).reverse()){h+='<div>'+log.result+'</div>'}
h+='</div></div>';
document.getElementById('panel').innerHTML=h}

window.toggleCmd=function(cmd){activeCmd=activeCmd===cmd?null:cmd;renderPanel()};
window.restDog=function(){if(!dogs.length)return;const dog=dogs[selectedDog];dog.state='resting';addNarration(dog.name+' rests. Energy recovering.');renderPanel()};
window.rewardDog=function(){if(!dogs.length)return;const dog=dogs[selectedDog];modifyTrustJS(selectedDog,3,'treat reward');dog.energy=Math.min(100,dog.energy+10);addNarration(dog.name+' gets a treat! Trust +3.',true);renderPanel()};
window.resetCourse=function(){course.sheep=[];for(let i=0;i<5;i++)course.sheep.push({x:80+Math.random()*300,y:50+Math.random()*200,vx:0,vy:0,panic:0});addNarration('New course set. 5 sheep scattered.');renderPanel()};
</script><div style="text-align:center;padding:24px;color:#475569;font-size:.75rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">⚓ The Fleet</a> · <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div></body></html>`;
}

async function seedThink(prompt: string, env: Env): Promise<string> {
  const providers = [
    { key: env.DEEPINFRA_API_KEY, url: 'https://api.deepinfra.com/v1/openai/chat/completions', model: 'ByteDance/Seed-2.0-mini' },
    { key: env.SILICONFLOW_API_KEY, url: 'https://api.siliconflow.com/v1/chat/completions', model: 'ByteDance-Seed/Seed-OSS-36B-Instruct' },
    { key: env.DEEPSEEK_API_KEY, url: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
  ];
  for (const p of providers) {
    if (!p.key) continue;
    try {
      const r = await fetch(p.url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + p.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: p.model, messages: [{ role: 'system', content: 'You are a dog inner monologue. First person. 1-2 sentences. Show personality. No quotes.' }, { role: 'user', content: prompt }], max_tokens: 100, temperature: 0.9 }),
      });
      if (r.ok) { const d = await r.json(); const c = d.choices?.[0]?.message?.content || ''; if (c) return c; console.error('[DogMind] Empty content from', p.model, JSON.stringify(d).slice(0, 200)); } else { console.error('[DogMind] API error', r.status, await r.text()); }
    } catch {}
  }
  return '';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const csp = "default-src 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.deepinfra.com https://api.siliconflow.com https://api.deepseek.com https:*;";
    if (url.pathname === '/') return new Response(gameHtml(), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': csp } });
    if (url.pathname === '/health') return new Response(JSON.stringify({ status: 'ok', vessel: 'dogmind-arena' }), { headers: { 'Content-Type': 'application/json' } });
  if (url.pathname === '/vessel.json') { try { const vj = await import('./vessel.json', { with: { type: 'json' } }); return new Response(JSON.stringify(vj.default || vj), { headers: { 'Content-Type': 'application/json' } }); } catch { return new Response('{}', { headers: { 'Content-Type': 'application/json' } }); } }
    if (url.pathname === '/api/think' && request.method === 'POST') {
      try {
        console.log('[DogMind] /api/think hit');
        const body = await request.json();
        console.log('[DogMind] prompt:', (body.prompt || '').slice(0, 100));
        const narration = await seedThink(body.prompt || '', env);
        console.log('[DogMind] narration:', narration.slice(0, 100));
        return new Response(JSON.stringify({ narration }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
      } catch (e: any) { console.error('[DogMind] error:', e.message); return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } }); }
    }
    return new Response('Not found', { status: 404 });
  },
};
