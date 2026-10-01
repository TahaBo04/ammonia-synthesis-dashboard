import assert from 'node:assert/strict';
import {defaults,thermo,equilibrium,quotient,rate,simulate,optimize,mixtureH,PRODUCTION,MW,csv,validate} from './model.mjs';
const near=(actual,expected,rel=1e-7)=>assert.ok(Math.abs(actual-expected)<=rel*Math.max(1,Math.abs(expected)),`${actual} != ${expected}`);
assert.ok(thermo(298.15).dh < -91 && thermo(298.15).dh > -93);
assert.ok(thermo(700).K < thermo(600).K);
assert.ok(equilibrium(700,200)>equilibrium(700,100));
assert.ok(equilibrium(600,150)>equilibrium(700,150));
const xe=equilibrium(700,150);near(quotient(xe,150),thermo(700).K,1e-10);assert.ok(Math.abs(rate(700,150,xe))<1e-8);
const grid=optimize();assert.equal(grid.winners.length,6);assert.ok(grid.count>1000);
for(const r of grid.winners){
 near(r.fNH3*MW*defaults.hours/1000,PRODUCTION);near(r.freshN+r.recycleN,r.reactN);near(r.freshN-r.purgeN,r.fNH3/2);
 near(r.recycleRatio,(1-r.X)/r.X);near(r.globalX,1);near(r.tac,r.annualCapital+r.annualMaintenance+r.annualCat+r.annualEnergy+r.annualFeed);near(r.annualFeed,0);
 near(r.netMW,r.freshMW+r.recycleMW+r.coolingMW-r.grossMW);near(r.mass,r.beds.reduce((s,b)=>s+b.mass,0));
 for(const b of r.beds){assert.ok(b.Xout>b.Xin);assert.ok(b.Tout>b.Tin);assert.ok(b.Tout<=defaults.limitT+.02);assert.ok(b.Xout<equilibrium(b.Tout+273.15,b.Pin));near(mixtureH(b.Xin,b.Tin+273.15),mixtureH(b.Xout,b.Tout+273.15),.00004);}
}
const r=grid.best,refined=simulate(r,defaults,true,.00025);assert.ok(Math.abs(refined.cost/r.cost-1)<.015);assert.ok(Math.abs(refined.X-r.X)<.002);
const purge=simulate(r,{...defaults,purge:.03});near(purge.freshN+purge.recycleN,purge.reactN);near(purge.freshN-purge.purgeN,purge.fNH3/2);assert.ok(purge.globalX<1);
const priced=simulate(r,{...defaults,purge:.03,n2Cost:1000,h2Cost:5000});assert.ok(priced.annualN2Feed>0);assert.ok(priced.annualH2Feed>0);near(priced.annualFeed,priced.annualN2Feed+priced.annualH2Feed);assert.ok(priced.tac>purge.tac);
const fewerHours=simulate(r,{...defaults,hours:6000});near(fewerHours.fNH3/r.fNH3,defaults.hours/6000);
const inactive=simulate(r,{...defaults,activity:.5});assert.ok(inactive.mass>r.mass*1.9);
assert.ok(validate({...defaults,pMin:270,pMax:250}).length);assert.ok(validate({...defaults,hours:0}).length);
assert.ok(csv([{x:'énergie; avec "guillemets"',y:1.25}]).includes('"énergie; avec ""guillemets"""'));
console.log(JSON.stringify({status:'passed',coverage:['NIST reference enthalpy','equilibrium pressure/temperature trends','rate at equilibrium','fixed annual production','fresh/recycle/purge balance','adiabatic enthalpy conservation','temperature/equilibrium constraints','energy and cost reconciliation','optional N₂/H₂ feed pricing','integration refinement','catalyst activity sensitivity','input validation','CSV escaping'],configurations:grid.count,best:{N:r.N,P:r.P,X:r.X,cost:r.cost},refinement:{deltaX:refined.X-r.X,costRelative:refined.cost/r.cost-1}},null,2));
