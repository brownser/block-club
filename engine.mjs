// BLOCK CLUB — original property-trading game engine
// Pure state transitions. No DOM or network access. Versioned for durable local saves.
export const VERSION = 1;
const prop = (name, group, price, rent, houseCost) => ({name,type:'property',group,price,rent,houseCost});
const rail = (name) => ({name,type:'rail',price:200});
const card = (name,kind) => ({name,type:'card',kind});
const special = (name,type,amount=0) => ({name,type,amount});
export const GROUPS = [
  {name:'Old Quarter',color:'#907058'},
  {name:'Waterside',color:'#72bdd6'},
  {name:'The Arts',color:'#d98fa8'},
  {name:'Market District',color:'#e3a36c'},
  {name:'Red Brick',color:'#dc756e'},
  {name:'Golden Mile',color:'#d1b45f'},
  {name:'Garden District',color:'#73a88f'},
  {name:'The Heights',color:'#697eab'},
];
export const TILES = [
  special('Start','go'),
  prop('Foundry Lane',0,60,[2,10,30,90,160,250],50),
  card('City Fund','community'),
  prop('Cobbler Row',0,60,[4,20,60,180,320,450],50),
  special('City Tax','tax',200),
  rail('North Line'),
  prop('Seabrook Lane',1,100,[6,30,90,270,400,550],50),
  card('Wild Card','chance'),
  prop('Bluewater Walk',1,100,[6,30,90,270,400,550],50),
  prop('Pier Point',1,120,[8,40,100,300,450,600],50),
  special('Just Visiting','jail'),
  prop('Gallery Street',2,140,[10,50,150,450,625,750],100),
  {name:'Power Station',type:'utility',price:150},
  prop('Rose Arcade',2,140,[10,50,150,450,625,750],100),
  prop('Design Row',2,160,[12,60,180,500,700,900],100),
  rail('East Line'),
  prop('Market Square',3,180,[14,70,200,550,750,950],100),
  card('City Fund','community'),
  prop('Copper Street',3,180,[14,70,200,550,750,950],100),
  prop('Old Town',3,200,[16,80,220,600,800,1000],100),
  special('Free Parking','parking'),
  prop('Lakehouse Way',4,220,[18,90,250,700,875,1050],150),
  card('Wild Card','chance'),
  prop('Brick Avenue',4,220,[18,90,250,700,875,1050],150),
  prop('Beacon Road',4,240,[20,100,300,750,925,1100],150),
  rail('South Line'),
  prop('Highland Drive',5,260,[22,110,330,800,975,1150],150),
  prop('Sunbeam Plaza',5,260,[22,110,330,800,975,1150],150),
  {name:'Water Works',type:'utility',price:150},
  prop('Grand Promenade',5,280,[24,120,360,850,1025,1200],150),
  special('Go to Jail','gotojail'),
  prop('Evergreen Place',6,300,[26,130,390,900,1100,1275],200),
  prop('Botanic Way',6,300,[26,130,390,900,1100,1275],200),
  card('City Fund','community'),
  prop('Garden Estate',6,320,[28,150,450,1000,1200,1400],200),
  rail('West Line'),
  card('Wild Card','chance'),
  prop('Summit View',7,350,[35,175,500,1100,1300,1500],200),
  special('Luxury Tax','tax',100),
  prop('Crown Heights',7,400,[50,200,600,1400,1700,2000],200)
];
const FORTUNE = [
  {title:'First-class connection',detail:'Advance to Start. Collect $200.',type:'move',to:0},
  {title:'The city is calling',detail:'Advance to Crown Heights.',type:'move',to:39},
  {title:'Design destination',detail:'Visit Design Row. Pass Start if you cross it.',type:'move',to:14},
  {title:'Express route',detail:'Advance to the next transit line. Pay double rent if owned.',type:'nearestRail'},
  {title:'Green energy',detail:'Advance to the nearest utility. Pay 10× dice total if owned.',type:'nearestUtility'},
  {title:'Unexpected dividend',detail:'Collect $100 from the bank.',type:'collect',amount:100},
  {title:'Your investments pay off',detail:'Collect $50 from the bank.',type:'collect',amount:50},
  {title:'City service charge',detail:'Pay $15.',type:'pay',amount:15},
  {title:'Renovation season',detail:'Pay $25 per house and $100 per hotel.',type:'repairs',house:25,hotel:100},
  {title:'You won a design award',detail:'Collect $150.',type:'collect',amount:150},
  {title:'Take a detour',detail:'Move back three spaces.',type:'back',amount:3},
  {title:'A night in',detail:'Go directly to Jail. Do not pass Start.',type:'jail'},
  {title:'Get out of Jail',detail:'Keep this card until you need it.',type:'free'},
  {title:'Tourist season',detail:'Collect $50 from every other player.',type:'collectEach',amount:50},
  {title:'Northern connection',detail:'Advance to North Line.',type:'move',to:5},
  {title:'Garden appointment',detail:'Advance to Evergreen Place.',type:'move',to:31},
];
const COMMUNITY = [
  {title:'Your journey begins',detail:'Advance to Start. Collect $200.',type:'move',to:0},
  {title:'Community grant',detail:'Collect $200.',type:'collect',amount:200},
  {title:'The city gives back',detail:'Collect $100.',type:'collect',amount:100},
  {title:'Local design competition',detail:'Collect $50.',type:'collect',amount:50},
  {title:'Insurance payment',detail:'Pay $50.',type:'pay',amount:50},
  {title:'Medical bill',detail:'Pay $100.',type:'pay',amount:100},
  {title:'Property maintenance',detail:'Pay $40 per house and $115 per hotel.',type:'repairs',house:40,hotel:115},
  {title:'Bank correction',detail:'Collect $20.',type:'collect',amount:20},
  {title:'Get out of Jail',detail:'Keep this card until you need it.',type:'free'},
  {title:'Community service',detail:'Go directly to Jail.',type:'jail'},
  {title:'Birthday bonus',detail:'Collect $10 from each opponent.',type:'collectEach',amount:10},
  {title:'Architectural prize',detail:'Collect $100.',type:'collect',amount:100},
  {title:'Repair assessment',detail:'Pay $50.',type:'pay',amount:50},
  {title:'Investment matures',detail:'Collect $100.',type:'collect',amount:100},
  {title:'Holiday fund',detail:'Collect $25.',type:'collect',amount:25},
  {title:'Tax rebate',detail:'Collect $75.',type:'collect',amount:75},
];
export const TOKENS = ['◆','●','✦','⬟'];
export const COLORS = ['#1c6656','#d87561','#647bc0','#b18a44'];
const clone = o => JSON.parse(JSON.stringify(o));
const randomShuffle = values => {const v=[...values];for(let i=v.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[v[i],v[j]]=[v[j],v[i]];}return v};
export const isOwnable = t => t && ['property','rail','utility'].includes(t.type);
export const groupTiles = g => TILES.map((t,i) => t.group===g && t.type==='property'?i:-1).filter(x=>x>=0);
export function ownsGroup(s,pid,g){return groupTiles(g).every(i=>s.assets[i].owner===pid)}
export function assetsOf(s,pid){return TILES.map((t,i)=>s.assets[i].owner===pid?i:-1).filter(x=>x>=0)}
export function netWorth(s,pid){let total=s.players[pid].cash;for(const i of assetsOf(s,pid)){const a=s.assets[i],t=TILES[i];total+=(a.mortgaged?Math.floor(t.price/2):t.price)+(a.level||0)*(t.houseCost||0)/2;}return Math.max(0,Math.round(total))}
export function rentAt(s,index,dice=7,override=1){const t=TILES[index],a=s.assets[index];if(!isOwnable(t)||a.owner==null||a.mortgaged)return 0;
 if(t.type==='rail'){const n=assetsOf(s,a.owner).filter(i=>TILES[i].type==='rail').length;return (25*2**(n-1))*override;}
 if(t.type==='utility'){const n=assetsOf(s,a.owner).filter(i=>TILES[i].type==='utility').length;return dice*(override===10?10:n===2?10:4);}
 return a.level>0?t.rent[a.level]:t.rent[0]*(ownsGroup(s,a.owner,t.group)?2:1);
}
function addLog(s,msg){s.log.unshift({msg,at:s.round});s.log=s.log.slice(0,55)}
function checkWinner(s){const active=s.players.filter(p=>!p.bankrupt);if(active.length<=1){s.phase='finished';s.winner=active[0]?.id??null;s.notice={title:active.length?'A new city champion':'Game over',detail:active.length?`${active[0].name} owns the city.`:'No players remain.',kind:'win'};return true;}
 if(s.mode==='quick' && s.round>s.roundLimit){s.phase='finished';s.winner=[...active].sort((a,b)=>netWorth(s,b.id)-netWorth(s,a.id))[0].id;s.notice={title:'Final bell',detail:`${s.players[s.winner].name} wins on net worth!`,kind:'win'};return true;}
 return false;
}
export function newGame({name='You',bots=2,mode='quick',humanNames=null,roundLimit=12}={}){
 const rawNames=Array.isArray(humanNames)&&humanNames.length?humanNames.slice(0,4):[name];
 const count=Math.min(4,Math.max(1,rawNames.length));
 const botCount=Math.min(4-count,Math.max(0,Number.isInteger(bots)?bots:2));
 if(count+botCount<2)throw new RangeError('Two to four players are required');
 const humans=rawNames.slice(0,count).map((n,i)=>({id:i,name:(String(n??'').trim().slice(0,16)||`Player ${i+1}`),bot:false}));
 const opponents=['Marlow','Sage','Arden'].slice(0,botCount).map((n,i)=>({id:count+i,name:n,bot:true}));
 const players=[...humans,...opponents].map(p=>({...p,cash:1500,position:0,jailed:false,jailTurns:0,freeCards:0,doubles:0,bankrupt:false}));
 return {version:VERSION,players,assets:TILES.map(()=>({owner:null,level:0,mortgaged:false})),mode:mode==='classic'?'classic':'quick',roundLimit:[6,12,20,30].includes(roundLimit)?roundLimit:12,round:1,current:0,phase:'roll',dice:[1,1],diceTotal:0,rollExtra:false,landed:null,notice:null,debt:null,auction:null,deckFortune:randomShuffle([...FORTUNE.keys()]),deckCommunity:randomShuffle([...COMMUNITY.keys()]),drawFortune:0,drawCommunity:0,log:[{msg:'The city is open for business.',at:1}],winner:null,aiBuiltThisTurn:false,lastAction:'start',turnCount:0,tradeOffer:null,tradeReturnPhase:null};
}
function finishLanding(s){if(s.phase==='finished'||s.phase==='debt')return;s.phase=s.rollExtra?'roll':'end';}
function pay(s,pid,amount,creditor=null,reason='payment'){amount=Math.max(0,Math.floor(amount));const p=s.players[pid];if(amount===0)return true;if(p.cash>=amount){p.cash-=amount;if(creditor!==null && !s.players[creditor].bankrupt)s.players[creditor].cash+=amount;addLog(s,`${p.name} paid $${amount.toLocaleString()}${creditor!==null?' to '+s.players[creditor].name:''} · ${reason}`);return true;}
 s.debt={pid,amount,creditor,reason,afterMove:null};s.phase='debt';addLog(s,`${p.name} needs $${amount.toLocaleString()} for ${reason}.`);return false;
}
function sendToJail(s,pid){const p=s.players[pid];p.position=10;p.jailed=true;p.jailTurns=0;p.doubles=0;s.rollExtra=false;s.phase='end';addLog(s,`${p.name} was sent to Jail.`);}
function moveTo(s,pid,index,collectGo=true){const p=s.players[pid],from=p.position;if(collectGo && index<=from && !(from===0&&index===0)){p.cash+=200;addLog(s,`${p.name} passed Start and collected $200.`)}p.position=index;s.landed=index;}
function drawCard(s,kind,depth){const p=s.players[s.current],isF=kind==='chance',deck=isF?FORTUNE:COMMUNITY,key=isF?'drawFortune':'drawCommunity',indices=isF?s.deckFortune:s.deckCommunity;const c=deck[indices[s[key]++%indices.length]];s.notice={title:c.title,detail:c.detail,kind:isF?'chance':'community'};addLog(s,`${p.name} drew “${c.title}.”`);
 switch(c.type){
 case 'collect':p.cash+=c.amount;finishLanding(s);break;
 case 'pay':if(pay(s,p.id,c.amount,null,c.title))finishLanding(s);break;
 case 'move':moveTo(s,p.id,c.to);land(s,depth+1);break;
 case 'back':p.position=(p.position+40-c.amount)%40;s.landed=p.position;land(s,depth+1);break;
 case 'jail':sendToJail(s,p.id);break;
 case 'free':p.freeCards++;finishLanding(s);break;
 case 'repairs':{let amount=0;for(const i of assetsOf(s,p.id)){const lvl=s.assets[i].level;if(lvl===5)amount+=c.hotel;else amount+=lvl*c.house;}if(pay(s,p.id,amount,null,c.title))finishLanding(s);break;}
 case 'collectEach':{for(const other of s.players){if(other.id===p.id||other.bankrupt)continue;const amt=Math.min(other.cash,c.amount);other.cash-=amt;p.cash+=amt;}finishLanding(s);break;}
 case 'nearestRail':{let i=(p.position+1)%40;while(TILES[i].type!=='rail')i=(i+1)%40;moveTo(s,p.id,i);land(s,depth+1,2);break;}
 case 'nearestUtility':{let i=(p.position+1)%40;while(TILES[i].type!=='utility')i=(i+1)%40;moveTo(s,p.id,i);land(s,depth+1,10);break;}
 default:finishLanding(s);
 }
}
function land(s,depth=0,rentOverride=1){if(depth>5){finishLanding(s);return;}const p=s.players[s.current],i=p.position,t=TILES[i],a=s.assets[i];s.landed=i;
 if(isOwnable(t)){
  if(a.owner===null){s.phase='offer';s.offer=i;addLog(s,`${p.name} landed on ${t.name}. Available for $${t.price}.`);return;}
  if(a.owner!==p.id && !s.players[a.owner].bankrupt){const rent=rentAt(s,i,s.diceTotal||7,rentOverride);if(rent && !pay(s,p.id,rent,a.owner,`${t.name} rent`))return;}
  finishLanding(s);return;
 }
 if(t.type==='tax'){if(pay(s,p.id,t.amount,null,t.name))finishLanding(s);return;}
 if(t.type==='gotojail'){sendToJail(s,p.id);return;}
 if(t.type==='card'){drawCard(s,t.kind,depth);return;}
 if(t.type==='go')addLog(s,`${p.name} stopped at Start.`);
 finishLanding(s);
}
function enterAuction(s,i){s.offer=null;const eligible=s.players.filter(p=>!p.bankrupt && p.cash>=10).map(p=>p.id);if(eligible.length===0){finishLanding(s);return;}
 s.auction={tile:i,bidders:eligible,passed:[],leader:null,bid:0,turn:eligible.indexOf(s.current)>=0?s.current:eligible[0],history:[]};s.phase='auction';addLog(s,`Auction opened for ${TILES[i].name}.`);
}
function nextBidder(s){const a=s.auction;if(!a)return;const eligible=a.bidders.filter(i=>!a.passed.includes(i));
 if(eligible.length===0 || (eligible.length===1 && a.leader===eligible[0])){finishAuction(s);return;}
 const ix=a.bidders.indexOf(a.turn);for(let n=1;n<=a.bidders.length;n++){const p=a.bidders[(ix+n)%a.bidders.length];if(!a.passed.includes(p) && p!==a.leader){a.turn=p;return;}}
 finishAuction(s);
}
function finishAuction(s){const a=s.auction;if(a?.leader!==null && a.bid>0){const p=s.players[a.leader];if(p.cash>=a.bid){p.cash-=a.bid;s.assets[a.tile].owner=a.leader;addLog(s,`${p.name} won ${TILES[a.tile].name} for $${a.bid}.`);}}s.auction=null;finishLanding(s);}
function auctionAction(s,action){const a=s.auction;if(!a||a.turn!==action.pid)return;const p=s.players[action.pid];if(action.kind==='pass'){a.passed.push(p.id);a.history.push(`${p.name} passed`);nextBidder(s);return;}
 const amount=Number(action.amount);if(!Number.isInteger(amount)||amount<a.bid+10||amount>p.cash||amount%10!==0)return;
 a.bid=amount;a.leader=p.id;a.history.push(`${p.name} bid $${amount}`);nextBidder(s);
}
export function canBuild(s,pid,i){const t=TILES[i],a=s.assets[i];if(!t||t.type!=='property'||a.owner!==pid||a.mortgaged||a.level>=5||!ownsGroup(s,pid,t.group))return false;const group=groupTiles(t.group);if(group.some(x=>s.assets[x].mortgaged))return false;const levels=group.map(x=>s.assets[x].level);return a.level===Math.min(...levels) && s.players[pid].cash>=t.houseCost;}
export function canSell(s,pid,i){const t=TILES[i],a=s.assets[i];if(t?.type!=='property'||a.owner!==pid||!a.level)return false;const levels=groupTiles(t.group).map(x=>s.assets[x].level);return a.level===Math.max(...levels);}
export function canMortgage(s,pid,i){const t=TILES[i],a=s.assets[i];if(!isOwnable(t)||a.owner!==pid||a.mortgaged||a.level>0)return false;return t.type!=='property'||groupTiles(t.group).every(x=>s.assets[x].level===0);}
export function canTrade(s,pid,i){const t=TILES[i],a=s.assets[i];if(!isOwnable(t)||a.owner!==pid)return false;return t.type!=='property'||groupTiles(t.group).every(x=>s.assets[x].level===0);}
function changeProperty(s,action){const i=Number(action.tile),p=s.players[action.pid],a=s.assets[i],t=TILES[i];if(!t||!p||a.owner!==p.id)return;
 if(action.kind==='build'&&canBuild(s,p.id,i)){p.cash-=t.houseCost;a.level++;addLog(s,`${p.name} built ${a.level===5?'a hotel':'a house'} on ${t.name}.`);}
 if(action.kind==='sell'&&canSell(s,p.id,i)){p.cash+=Math.floor(t.houseCost/2);a.level--;addLog(s,`${p.name} sold a building on ${t.name}.`);}
 if(action.kind==='mortgage'&&canMortgage(s,p.id,i)){a.mortgaged=true;p.cash+=Math.floor(t.price/2);addLog(s,`${p.name} mortgaged ${t.name}.`);}
 if(action.kind==='unmortgage'&&a.mortgaged){const amt=Math.ceil(t.price*0.55);if(p.cash>=amt){p.cash-=amt;a.mortgaged=false;addLog(s,`${p.name} redeemed ${t.name} for $${amt}.`);}}
}
function resolveDebt(s){const d=s.debt;if(!d)return false;const p=s.players[d.pid];if(p.cash<d.amount)return false;p.cash-=d.amount;if(d.creditor!==null && !s.players[d.creditor].bankrupt)s.players[d.creditor].cash+=d.amount;addLog(s,`${p.name} settled $${d.amount} for ${d.reason}.`);s.debt=null;s.phase='end';
 if(d.afterMove!==null){moveTo(s,p.id,(p.position+d.afterMove)%40);land(s);}
 else finishLanding(s);return true;
}
function bankrupt(s){const d=s.debt,p=s.players[d.pid];p.bankrupt=true;p.cash=0;p.jailed=false;for(const i of assetsOf(s,p.id)){s.assets[i].owner=d.creditor;s.assets[i].level=0;if(d.creditor===null)s.assets[i].mortgaged=false;}s.debt=null;s.auction=null;addLog(s,`${p.name} declared bankruptcy.`);if(!checkWinner(s)){s.phase='end';s.rollExtra=false;}}
function tradeValue(s,pid,i){if(i===null)return 0;const t=TILES[i];let val=t.price;if(t.type==='property'){const owned=groupTiles(t.group).filter(x=>s.assets[x].owner===pid).length;val*=owned===groupTiles(t.group).length-1?1.75:1.15;}return Math.round(val);}
function tradeTerms(s,from,other,giveTile,takeTile,giveCash,takeCash){
 const p=s.players[from],q=s.players[other];
 if(!p||!q||from===other||p.bankrupt||q.bankrupt||p.bot)return null;
 const gi=giveTile==null?null:Number(giveTile),ti=takeTile==null?null:Number(takeTile);
 const gc=Number(giveCash),tc=Number(takeCash);
 if(gi===null&&ti===null)return null;
 if(![gc,tc].every(x=>Number.isSafeInteger(x)&&x>=0))return null;
 if(gi!==null&&(!Number.isInteger(gi)||!canTrade(s,from,gi)))return null;
 if(ti!==null&&(!Number.isInteger(ti)||!canTrade(s,other,ti)))return null;
 if(p.cash<gc||q.cash<tc)return null;
 return {from,other,giveTile:gi,takeTile:ti,giveCash:gc,takeCash:tc};
}
function performTrade(s,t){const p=s.players[t.from],q=s.players[t.other];
 p.cash=p.cash-t.giveCash+t.takeCash;q.cash=q.cash-t.takeCash+t.giveCash;
 if(t.giveTile!==null)s.assets[t.giveTile].owner=q.id;
 if(t.takeTile!==null)s.assets[t.takeTile].owner=p.id;
 addLog(s,`${p.name} and ${q.name} completed a trade.`);
 s.notice={title:'Deal done',detail:`${q.name} accepted the trade.`,kind:'trade'};
}
function trade(s,action){
 const p=s.players[s.current],other=Number(action.other);
 const t=tradeTerms(s,p.id,other,action.giveTile,action.takeTile,action.giveCash??0,action.takeCash??0);
 if(!t)return;
 const q=s.players[other];
 if(!q.bot){s.tradeOffer=t;s.tradeReturnPhase=s.phase;s.phase='tradeOffer';addLog(s,`${p.name} offered ${q.name} a trade.`);return;}
 const offer=t.giveCash+tradeValue(s,q.id,t.giveTile)-t.takeCash-tradeValue(s,q.id,t.takeTile);
 const acceptance=offer>=(t.takeTile!==null&&TILES[t.takeTile].type==='property'&&ownsGroup(s,q.id,TILES[t.takeTile].group)?100:0) + (t.takeTile===null?0:Math.round(tradeValue(s,q.id,t.takeTile)*0.08));
 if(acceptance)performTrade(s,t);
 else{s.notice={title:'Offer declined',detail:`${q.name} wants a better deal.`,kind:'trade'};addLog(s,`${q.name} declined ${p.name}'s trade.`);}
}
function respondToTrade(s,action){
 const t=s.tradeOffer;if(!t||action.pid!==t.other||s.players[t.other].bot)return;
 const valid=tradeTerms(s,t.from,t.other,t.giveTile,t.takeTile,t.giveCash,t.takeCash);
 if(action.type==='tradeAccept'&&valid)performTrade(s,valid);
 else{addLog(s,`${s.players[t.other].name} declined the trade.`);s.notice={title:'Offer declined',detail:'No properties or cash changed hands.',kind:'trade'};}
 s.phase=['roll','end'].includes(s.tradeReturnPhase)?s.tradeReturnPhase:'end';s.tradeOffer=null;s.tradeReturnPhase=null;
}

function nextTurn(s){const old=s.current;for(let n=1;n<=s.players.length;n++){const target=(old+n)%s.players.length;if(!s.players[target].bankrupt){s.current=target;if(target<=old)s.round++;break;}}
 s.rollExtra=false;s.landed=null;s.notice=null;s.dice=[1,1];s.diceTotal=0;s.aiBuiltThisTurn=false;s.offer=null;s.turnCount++;s.players[s.current].doubles=0;
 if(checkWinner(s))return;
 s.phase=s.players[s.current].jailed?'jail':'roll';addLog(s,`It's ${s.players[s.current].name}'s turn.`);
}
function takeRoll(s,a,b,fromJail=false){const p=s.players[s.current],sum=a+b;s.dice=[a,b];s.diceTotal=sum;s.rollExtra=!fromJail&&a===b;
 if(!fromJail){p.doubles=s.rollExtra?p.doubles+1:0;if(p.doubles>=3){sendToJail(s,p.id);return;}}
 const newPos=(p.position+sum)%40;moveTo(s,p.id,newPos);addLog(s,`${p.name} rolled ${a} + ${b} and landed on ${TILES[newPos].name}.`);land(s);
}
export function step(input,action){const s=clone(input);if(!s||s.version!==VERSION||s.phase==='finished')return s;const player=s.players[s.current];const cmd=action.type;
 if(cmd==='dismissNotice'){s.notice=null;return s;}
 if(cmd==='manage'&&['roll','jail','end','offer','debt'].includes(s.phase)&&action.pid===s.current){changeProperty(s,action);return s;}
 if(cmd==='trade'&&['roll','end'].includes(s.phase)){trade(s,action);return s;}
 if(s.phase==='tradeOffer'&&['tradeAccept','tradeDecline'].includes(cmd)){respondToTrade(s,action);return s;}
 if(cmd==='settleDebt'&&s.phase==='debt'){resolveDebt(s);return s;}
 if(cmd==='bankrupt'&&s.phase==='debt'&&s.debt.pid===action.pid){bankrupt(s);return s;}
 if(cmd==='roll'&&s.phase==='roll'){const d=Array.isArray(action.dice)?action.dice:[Math.ceil(Math.random()*6),Math.ceil(Math.random()*6)];if(d.some(x=>!Number.isInteger(x)||x<1||x>6))return s;takeRoll(s,d[0],d[1]);return s;}
 if(s.phase==='jail'){
  if(cmd==='jailPay' && player.cash>=50){player.cash-=50;player.jailed=false;player.jailTurns=0;s.phase='roll';addLog(s,`${player.name} paid $50 bail.`);return s;}
  if(cmd==='jailCard' && player.freeCards>0){player.freeCards--;player.jailed=false;player.jailTurns=0;s.phase='roll';addLog(s,`${player.name} used a Get Out of Jail card.`);return s;}
  if(cmd==='jailRoll'){const d=Array.isArray(action.dice)?action.dice:[Math.ceil(Math.random()*6),Math.ceil(Math.random()*6)];if(d.some(x=>!Number.isInteger(x)||x<1||x>6))return s;s.dice=d;s.diceTotal=d[0]+d[1];player.jailTurns++;
   if(d[0]===d[1]){player.jailed=false;player.jailTurns=0;takeRoll(s,d[0],d[1],true);}
   else if(player.jailTurns===3){player.jailed=false;player.jailTurns=0;if(pay(s,player.id,50,null,'mandatory bail')){takeRoll(s,d[0],d[1],true);}else{s.debt.afterMove=d[0]+d[1];}}
   else{s.phase='end';addLog(s,`${player.name} didn't roll doubles and stays in Jail.`);}return s;
  }
 }
 if(s.phase==='offer'){
  if(cmd==='buy'&&s.offer===action.tile){const i=s.offer,t=TILES[i];if(player.cash>=t.price){player.cash-=t.price;s.assets[i].owner=player.id;s.offer=null;addLog(s,`${player.name} purchased ${t.name} for $${t.price}.`);finishLanding(s);}return s;}
  if(cmd==='decline'){enterAuction(s,s.offer);return s;}
 }
 if(s.phase==='auction'&&cmd==='auction'){auctionAction(s,action);return s;}
 if(s.phase==='end'&&cmd==='end'){nextTurn(s);return s;}
 return s;
}
export function actingPlayerId(s){if(s.phase==='auction')return s.auction.turn;if(s.phase==='debt')return s.debt.pid;if(s.phase==='tradeOffer')return s.tradeOffer.other;return s.current;}
export function currentHumanDecision(s){return s.phase!=='finished'&&!s.players[actingPlayerId(s)].bot;}
export function aiMove(s){if(s.phase==='finished'||currentHumanDecision(s)||s.notice?.kind==='win')return null;const p=s.players[s.current];
 if(s.phase==='debt'){const d=s.debt;if(p.cash>=d.amount)return {type:'settleDebt'};const candidates=assetsOf(s,p.id);for(const i of candidates){if(canSell(s,p.id,i))return {type:'manage',pid:p.id,tile:i,kind:'sell'};}for(const i of candidates){if(canMortgage(s,p.id,i))return {type:'manage',pid:p.id,tile:i,kind:'mortgage'};}return {type:'bankrupt',pid:p.id};}
 if(s.phase==='auction'){const a=s.auction,bot=s.players[a.turn];if(!bot.bot)return null;const t=TILES[a.tile];const groupBoost=t.type==='property'&&groupTiles(t.group).filter(i=>s.assets[i].owner===bot.id).length===groupTiles(t.group).length-1?1.4:1;
 const max=Math.min(bot.cash-140,Math.round(t.price*(0.90*groupBoost)));const next=Math.max(10,Math.ceil((a.bid+10)/10)*10);return {type:'auction',pid:bot.id,kind:next<=max?'bid':'pass',amount:next};}
 if(s.phase==='offer'){const t=TILES[s.offer];const ownedCompletes=t.type==='property'&&groupTiles(t.group).filter(i=>s.assets[i].owner===p.id).length===groupTiles(t.group).length-1;return p.cash>=t.price+(ownedCompletes?75:230)?{type:'buy',tile:s.offer}:{type:'decline'};}
 if(s.phase==='jail'){return p.freeCards?{type:'jailCard'}:p.cash>380?{type:'jailPay'}:{type:'jailRoll'};}
 if(s.phase==='roll'){
  if(!s.aiBuiltThisTurn && p.cash>400){const candidate=assetsOf(s,p.id).filter(i=>canBuild(s,p.id,i)).sort((a,b)=>(TILES[a].houseCost-TILES[b].houseCost))[0];if(candidate!==undefined)return {type:'manage',pid:p.id,tile:candidate,kind:'build',markBuilt:true};}
  return {type:'roll'};
 }
 if(s.phase==='end')return {type:'end'};
 return null;
}
export function summary(s){return s.players.map(p=>({name:p.name,netWorth:netWorth(s,p.id),cash:p.cash,properties:assetsOf(s,p.id).length,bankrupt:p.bankrupt}));}

// Strict, non-executable save validation. Compatible with version-1 1.0.0/1.0.1 saves.
export function normalizeGameSnapshot(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||value.version!==VERSION)return null;
 let s;try{s=JSON.parse(JSON.stringify(value));}catch{return null;}
 const validInt=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 if(!Array.isArray(s.players)||s.players.length<2||s.players.length>4||!Array.isArray(s.assets)||s.assets.length!==40)return null;
 if(!validInt(s.current,0,s.players.length-1)||!validInt(s.round,1,1000000)||!['quick','classic'].includes(s.mode))return null;
 if(!['roll','jail','offer','auction','debt','end','finished','tradeOffer'].includes(s.phase))return null;
 if(!s.players.every((p,i)=>p&&p.id===i&&typeof p.name==='string'&&p.name.length<=64&&typeof p.bot==='boolean'&&Number.isSafeInteger(p.cash)&&p.cash>=0&&p.cash<=100000000&&validInt(p.position,0,39)&&typeof p.jailed==='boolean'&&typeof p.bankrupt==='boolean'&&validInt(p.jailTurns,0,1000)&&validInt(p.doubles,0,3)&&validInt(p.freeCards,0,100)))return null;
 if(!s.players.some(p=>!p.bot))return null;
 if(!s.assets.every(a=>a&&((a.owner===null)||validInt(a.owner,0,s.players.length-1))&&validInt(a.level,0,5)&&typeof a.mortgaged==='boolean'))return null;
 if(!Array.isArray(s.dice)||s.dice.length!==2||!s.dice.every(n=>validInt(n,1,6)))return null;
 if(!Array.isArray(s.log)||s.log.length>100||!s.log.every(x=>x&&typeof x.msg==='string'&&x.msg.length<1000&&validInt(x.at,1,1000000)))return null;
 if(!['null','object'].includes(typeof s.notice) || (s.notice!==null&&(!s.notice||typeof s.notice.title!=='string'||typeof s.notice.detail!=='string')))return null;
 if(s.phase==='offer'&&!validInt(s.offer,0,39))return null;
 if(s.phase==='auction'&&(!s.auction||!validInt(s.auction.turn,0,s.players.length-1)||!validInt(s.auction.tile,0,39)||!Array.isArray(s.auction.bidders)||!Array.isArray(s.auction.passed)||!Array.isArray(s.auction.history)))return null;
 if(s.phase==='debt'&&(!s.debt||!validInt(s.debt.pid,0,s.players.length-1)||!validInt(s.debt.amount,0,100000000)))return null;
 if(s.phase==='tradeOffer'&&(!s.tradeOffer||!validInt(s.tradeOffer.from,0,s.players.length-1)||s.tradeOffer.from!==s.current||!validInt(s.tradeOffer.other,0,s.players.length-1)||s.tradeOffer.other===s.current||s.players[s.tradeOffer.other].bot||!['roll','end'].includes(s.tradeReturnPhase)))return null;
 if(s.phase==='tradeOffer'&&!tradeTerms(s,s.tradeOffer.from,s.tradeOffer.other,s.tradeOffer.giveTile,s.tradeOffer.takeTile,s.tradeOffer.giveCash,s.tradeOffer.takeCash))return null;
 if(!Array.isArray(s.deckFortune)||s.deckFortune.length!==FORTUNE.length||!s.deckFortune.every(x=>validInt(x,0,FORTUNE.length-1)))return null;
 if(!Array.isArray(s.deckCommunity)||s.deckCommunity.length!==COMMUNITY.length||!s.deckCommunity.every(x=>validInt(x,0,COMMUNITY.length-1)))return null;
 if(!validInt(s.drawFortune,0,1000000)||!validInt(s.drawCommunity,0,1000000))return null;
 if(s.phase==='finished'&&s.winner!==null&&!validInt(s.winner,0,s.players.length-1))return null;
 s.roundLimit=[6,12,20,30].includes(s.roundLimit)?s.roundLimit:12;
 s.turnCount=validInt(s.turnCount,0,1000000)?s.turnCount:0;
 s.tradeOffer??=null;s.tradeReturnPhase??=null;
 return s;
}
export function encodePortableSave(game,settings={}){
 const clean=normalizeGameSnapshot(game);if(!clean)throw new TypeError('Invalid game state');
 return JSON.stringify({format:'blockclub-save',saveVersion:1,game:clean,settings:{sound:settings.sound!==false,motion:settings.motion!==false}});
}
export function decodePortableSave(input){
 let data;try{data=typeof input==='string'?JSON.parse(input):input;}catch{return null;}
 if(!data||data.format!=='blockclub-save'||data.saveVersion!==1)return null;
 const game=normalizeGameSnapshot(data.game);if(!game)return null;
 return {game,settings:{sound:data.settings?.sound!==false,motion:data.settings?.motion!==false}};
}
