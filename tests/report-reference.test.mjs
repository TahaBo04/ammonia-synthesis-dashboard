import assert from 'node:assert/strict';
import test from 'node:test';
import {defaults,REPORT_REFERENCE,simulate,optimize,materialBalance,fields,PRODUCTION} from '../src/content/dashboard/model.mjs';

const near=(actual,expected,rel=1e-9)=>assert.ok(Math.abs(actual-expected)<=rel*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);
const reference=(overrides={})=>simulate(REPORT_REFERENCE,{...defaults,...overrides},true,0.0005);

test('8256-hour report reference preserves the three-bed operating point',()=>{
 assert.equal(defaults.hours,(365-21)*24);
 const r=reference();
 near(r.X,0.3225);near(r.P,122.5);near(r.mass,33321.60852307114);
 assert.deepEqual(r.beds.map(b=>b.Tin),[395,385,375]);
 assert.deepEqual(r.beds.map(b=>b.threshold),[0.25,0.25,0.30]);
 const b=materialBalance(r);
 near(b.production.t_h,100000/8256);near(b.production.t_an,PRODUCTION);
 near(b.fresh.N2.t_an,82244.69951592787);near(b.fresh.H2.t_an,17755.300484072126);
 near(b.reactor.N2.t_an,255022.32408039653);near(b.reactor.H2.t_an,55055.19529944846);
 near(b.recycle.N2.t_an,172777.62456446866);near(b.recycle.H2.t_an,37299.89481537633);
 near(b.recycleFraction,0.6775);
 for(const species of ['N2','H2'])near(b.fresh[species].t_an+b.recycle[species].t_an,b.reactor[species].t_an);
 const exported=fields(r);
 assert.equal(exported.heures_marche_an,8256);near(exported.N2_frais_t_an,b.fresh.N2.t_an);
});

test('a 3% separator purge increases fresh demand and closes the overall mass balance',()=>{
 const r=reference({purge:0.03}),b=materialBalance(r);
 near(b.fresh.N2.t_an,87428.02825286194);near(b.fresh.H2.t_an,18874.297328533416);
 near(b.purge.N2.t_an,5183.32873693406);near(b.purge.H2.t_an,1118.99684446129);
 near(r.globalX,0.9407131918617371);
 near(b.fresh.N2.t_an+b.fresh.H2.t_an,b.production.t_an+b.purge.N2.t_an+b.purge.H2.t_an);
 for(const species of ['N2','H2'])near(b.fresh[species].t_h+b.recycle[species].t_h,b.reactor[species].t_h);
});

test('availability scales powers and catalyst but preserves annual material and energy at fixed trajectory',()=>{
 const now=reference(),old=reference({hours:8000}),ratio=8000/8256;
 for(const key of ['fNH3','freshN','reactN','recycleN','mass','volume','freshMW','recycleMW','rxnMW','recoveredMW','grossMW','coolingMW','netMW','qInterMW'])near(now[key]/old[key],ratio);
 near(now.grossMW/(now.netMW+now.grossMW),0.3069001900637034);
 near(now.netMW*now.hours,old.netMW*old.hours);near(now.annualEnergy,old.annualEnergy);
 near(now.grossMW*now.hours,12165.548233162164);
 // The equipment sizing changes CAPEX; the historical 8000-hour cost is not a current result.
 assert.ok(now.capex<old.capex);assert.ok(now.cost<old.cost);
 near(now.cost,346.41690588412405);
});

test('optimization retains the feasible report incumbent and obeys the scenario domain',()=>{
 const r=reference(),search=optimize(defaults);
 assert.equal(search.referenceSeedUsed,true);
 assert.ok(search.best.cost<=r.cost+1e-8);
 assert.ok(search.winners.find(w=>w.N===3).cost<=r.cost+1e-8);
 const restricted={...defaults,pMin:130,maxBeds:3},outside=optimize(restricted);
 assert.equal(outside.referenceSeedUsed,false);
 for(const candidate of outside.winners)assert.ok(candidate.P>=130&&candidate.N<=3);
 const fewerBeds=optimize({...defaults,maxBeds:2});
 assert.equal(fewerBeds.referenceSeedUsed,false);
 assert.ok(fewerBeds.winners.every(candidate=>candidate.N<=2));
});
