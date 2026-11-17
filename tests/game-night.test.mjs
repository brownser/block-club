import test from 'node:test';
import assert from 'node:assert/strict';
import {VERSION,TILES,newGame,step,actingPlayerId,currentHumanDecision,normalizeGameSnapshot,encodePortableSave,decodePortableSave} from '../engine.mjs';

test('1.1 supports 2–4 human seats and optional AI while preserving default solo rules',()=>{
 const legacy=newGame();assert.equal(legacy.version,VERSION);assert.equal(legacy.players.length,3);
 assert.deepEqual(legacy.players.map(p=>p.bot),[false,true,true]);
 const duo=newGame({humanNames:['Alex','Blair'],bots:0});assert.equal(duo.players.length,2);
 assert.deepEqual(duo.players.map(p=>p.name),['Alex','Blair']);assert.ok(duo.players.every(p=>!p.bot));
 const four=newGame({humanNames:['One','Two','Three'],bots:1});assert.deepEqual(four.players.map(p=>p.bot),[false,false,false,true]);
 const all=newGame({humanNames:['A','B','C','D'],bots:0});assert.equal(all.players.length,4);assert.ok(all.players.every(p=>p.cash===1500));
 assert.throws(()=>newGame({humanNames:['Only'],bots:0}),RangeError);
});

test('human turns and auction participants use their real acting seat',()=>{
 let g=newGame({humanNames:['Alpha','Beta'],bots:0});
 g=step(g,{type:'roll',dice:[1,2]});assert.equal(g.phase,'offer');
 g=step(g,{type:'decline'});assert.equal(g.phase,'auction');assert.equal(actingPlayerId(g),0);
 g=step(g,{type:'auction',pid:0,kind:'bid',amount:50});
 assert.equal(g.auction.turn,1);assert.equal(actingPlayerId(g),1);assert.equal(currentHumanDecision(g),true);
 g=step(g,{type:'auction',pid:1,kind:'pass'});assert.equal(g.phase,'end');
 g=step(g,{type:'end'});assert.equal(actingPlayerId(g),1);assert.equal(g.current,1);
});

test('human trade is pending until the other human explicitly accepts; action must have receiver id',()=>{
 let g=newGame({humanNames:['Alpha','Beta'],bots:0});g.assets[1].owner=0;g.assets[3].owner=1;
 g=step(g,{type:'trade',other:1,giveTile:1,takeTile:3,giveCash:500,takeCash:0});
 assert.equal(g.phase,'tradeOffer');assert.equal(g.tradeReturnPhase,'roll');
 assert.equal(actingPlayerId(g),1);assert.equal(g.assets[1].owner,0);
 const refused=step(g,{type:'tradeAccept',pid:0});assert.equal(refused.phase,'tradeOffer');
 g=step(g,{type:'tradeAccept',pid:1});assert.equal(g.phase,'roll');assert.equal(g.tradeOffer,null);
 assert.equal(g.assets[1].owner,1);assert.equal(g.assets[3].owner,0);
 assert.equal(g.players[0].cash,1000);assert.equal(g.players[1].cash,2000);
 assert.equal(g.notice.kind,'trade');
});

test('declined human trade preserves balances and ownership',()=>{
 let g=newGame({humanNames:['Alpha','Beta'],bots:0});g.assets[1].owner=0;g.assets[3].owner=1;g.phase='end';
 g=step(g,{type:'trade',other:1,giveTile:1,takeTile:3,giveCash:100,takeCash:0});
 assert.equal(g.phase,'tradeOffer');g=step(g,{type:'tradeDecline',pid:1});
 assert.equal(g.phase,'end');assert.equal(g.assets[1].owner,0);assert.equal(g.assets[3].owner,1);
 assert.equal(g.players[0].cash,1500);assert.equal(g.players[1].cash,1500);
});

test('round limits 6, 12, 20 and 30 preserve quick win rule',()=>{
 for(const max of [6,12,20,30]){
  let g=newGame({humanNames:['One','Two'],bots:0,mode:'quick',roundLimit:max});
  g.round=max;g.current=1;g.phase='end';g.players[0].cash=2500;
  g=step(g,{type:'end'});assert.equal(g.round,max+1);assert.equal(g.phase,'finished');assert.equal(g.winner,0);
 }
 const invalid=newGame({humanNames:['A','B'],bots:0,roundLimit:999});assert.equal(invalid.roundLimit,12);
});

test('portable saves round-trip with same v1 schema and preserve 1.0.1 unextended games',()=>{
 let game=newGame({name:'Legacy',bots:2,mode:'quick'});
 delete game.tradeOffer;delete game.tradeReturnPhase;
 const normalized=normalizeGameSnapshot(game);assert.ok(normalized);assert.equal(normalized.version,VERSION);
 assert.equal(normalized.tradeOffer,null);assert.equal(normalized.roundLimit,12);
 const exported=encodePortableSave(game,{motion:false,sound:false});
 const imported=decodePortableSave(exported);assert.deepEqual(imported.game,normalized);
 assert.deepEqual(imported.settings,{motion:false,sound:false});
});

test('bad portable saves are safely rejected without modifying an active game',()=>{
 const game=newGame();const safe=encodePortableSave(game);
 assert.equal(decodePortableSave('{ nope'),null);
 assert.equal(decodePortableSave(JSON.stringify({format:'wrong',saveVersion:1,game})),null);
 const wrong=JSON.parse(safe);wrong.game.assets[0].owner=999;
 assert.equal(decodePortableSave(wrong),null);
 const wrongPhase=JSON.parse(safe);wrongPhase.game.phase='auction';wrongPhase.game.auction=null;
 assert.equal(decodePortableSave(wrongPhase),null);
 const badXss=JSON.parse(safe);badXss.game.players[0].name='x'.repeat(500);
 assert.equal(decodePortableSave(badXss),null);
 assert.ok(normalizeGameSnapshot(game));
});
