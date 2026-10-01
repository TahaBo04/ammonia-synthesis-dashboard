// Screening model. Thermodynamics: NIST Shomate; kinetics and costs are explicit assumptions.
export const VERSION = 'NH3-screening-1.1';
export const MW = 17.03052;
export const PRODUCTION = 100000;
// Operating point retained by the report revision of 27 September 2026.
// Its historical economic ranking was calculated at 8000 h/year; simulate it
// with the current assumptions to recalculate flows, duties, catalyst and costs.
export const REPORT_REFERENCE = Object.freeze({
 N:3, P:122.5, Tin:395, slope:10, cut:0.25,
 temps:Object.freeze([395,385,375]), cuts:Object.freeze([0.25,0.25,0.30])
});
export const defaults = {
 hours:8256, pMin:80, pMax:250, tMin:350, tMax:450, limitT:550, maxBeds:6,
 r0:0.03, ea:100, activity:1, purge:0, dpBed:1, dpCool:0.5, dpLoop:3,
 feedP:20, compT:35, compEta:0.75, recovery:0.65, electricEta:0.25,
 electricity:900, n2Cost:0, h2Cost:0, refrigeration:35, circulationCooling:0.4,
 reactorCost:40000000, extraBed:6500000, exchangerCost:2000000,
 compressorCost:10000000, catCost:100, catLife:5, density:2200,
 discount:0.08, life:20, maintenance:0.025, maxExposure:150,
 manualP:150, manualT:400, manualN:3, manualSlope:15, manualCut:0.55, probeX:0.18, resultMode:2, selectedN:0
};
export const spec = [
 ['hours','Heures de fonctionnement','h/an',4000,8760,1,'Exploitation'],
 ['pMin','Pression minimale','bar',40,290,10,'Domaine exploré'],['pMax','Pression maximale','bar',60,300,10,'Domaine exploré'],
 ['tMin','Entrée : température minimale','°C',300,480,5,'Domaine exploré'],['tMax','Entrée : température maximale','°C',320,500,5,'Domaine exploré'],
 ['limitT','Plafond thermique des lits','°C',480,650,5,'Domaine exploré'],['maxBeds','Nombre maximal de lits','lits',1,6,1,'Domaine exploré'],
 ['maxExposure','Catalyseur / débit N₂ : plafond par lit','kg·h/kmol',10,300,10,'Domaine exploré'],
 ['r0','Vitesse de référence à 700 K, 150 bar','kmol N₂/(kg·h)',0.005,0.1,0.005,'Cinétique de substitution'],
 ['ea','Énergie d’activation','kJ/mol',40,180,5,'Cinétique de substitution'],['activity','Activité relative','—',0.2,2,0.1,'Cinétique de substitution'],
 ['purge','Purge des gaz après séparation','fraction',0,0.08,0.005,'Boucle'],['dpBed','Perte de pression par lit','bar',0.1,5,0.1,'Boucle'],
 ['dpCool','Perte par échangeur inter-lit','bar',0,3,0.1,'Boucle'],['dpLoop','Autres pertes de boucle','bar',0.5,10,0.5,'Boucle'],
 ['feedP','Pression des gaz frais','bar',1,40,1,'Boucle'],['compT','Température de compression','°C',25,60,1,'Boucle'],
 ['compEta','Rendement isotherme équivalent','fraction',0.4,0.9,0.01,'Boucle'],
 ['recovery','Fraction de chaleur chimique valorisée','fraction',0,0.85,0.05,'Énergie'],['electricEta','Rendement chaleur → électricité','fraction',0,0.4,0.01,'Énergie'],
 ['refrigeration','Réfrigération spécifique NH₃','kWh/t',0,200,5,'Énergie'],['circulationCooling','Auxiliaires de refroidissement du gaz','kWh/kmol circulé',0,2,0.05,'Énergie'],
 ['electricity','Électricité, achat et crédit','MAD/MWh',200,2500,50,'Économie'],['n2Cost','Coût N₂ frais (optionnel)','MAD/t',0,5000,100,'Économie'],['h2Cost','Coût H₂ frais (optionnel)','MAD/t',0,10000,100,'Économie'],['reactorCost','Réacteur de référence à 20 m³, 150 bar','MAD',10000000,150000000,5000000,'Économie'],
 ['extraBed','Internes par lit additionnel','MAD',1000000,30000000,500000,'Économie'],['exchangerCost','Échangeur de référence à 1 MW','MAD',500000,10000000,500000,'Économie'],
 ['compressorCost','Compression de référence à 1 MW','MAD',2000000,50000000,1000000,'Économie'],['catCost','Catalyseur','MAD/kg',20,800,10,'Économie'],
 ['catLife','Durée de vie du catalyseur','ans',1,10,1,'Économie'],['density','Densité apparente du catalyseur','kg/m³',1000,3000,100,'Économie'],
 ['discount','Taux d’actualisation','fraction/an',0,0.2,0.01,'Économie'],['life','Durée économique','ans',5,40,1,'Économie'],['maintenance','Maintenance annuelle / CAPEX','fraction/an',0,0.1,0.005,'Économie']
];
const NLOW=[28.98641,1.853978,-9.647459,16.63537,0.000117,-8.671914,226.4168];
const NHIGH=[19.50583,19.88705,-8.598535,1.369784,0.527601,-4.935202,212.3900];
const HYD=[33.066178,-11.363417,11.432816,-2.772874,-0.158558,-9.980797,172.707974];
const AMM=[19.99563,49.77119,-15.37599,1.921168,0.189174,-53.30667,203.8591];
export function species(T,c){const t=T/1000,[A,B,C,D,E,F,G]=c; return {h:A*t+B*t*t/2+C*t**3/3+D*t**4/4-E/t+F,cp:A+B*t+C*t*t+D*t**3+E/(t*t),s:A*Math.log(t)+B*t+C*t*t/2+D*t**3/3-E/(2*t*t)+G};}
export function thermo(T){const n=species(T,T<500?NLOW:NHIGH),h=species(T,HYD),a=species(T,AMM); const dh=2*a.h-n.h-3*h.h,ds=2*a.s-n.s-3*h.s;return {n,h,a,dh,ds,K:Math.exp(-(dh*1000-T*ds)/(8.314462618*T))};}
// Cached integer-K thermodynamics, linear interpolation for the many grid evaluations.
const table=Array.from({length:702},(_,i)=>thermo(298+i));
function fast(T){const z=Math.max(0,Math.min(700,T-298)),i=Math.floor(z),f=z-i,a=table[i],b=table[i+1];const mix=(key)=>a[key]+f*(b[key]-a[key]);return {dh:mix('dh'),K:Math.exp(Math.log(a.K)+f*Math.log(b.K/a.K)),cpN:a.n.cp+f*(b.n.cp-a.n.cp),cpH:a.h.cp+f*(b.h.cp-a.h.cp),cpA:a.a.cp+f*(b.a.cp-a.a.cp)};}
export function quotient(x,P){const total=4-2*x,n=(1-x)/total,h=3*n,a=2*x/total;return a*a/(n*h**3*P*P);}
export function rate(T,P,x,a=defaults){const th=fast(T),factor=Math.sqrt((1-x)/(4-2*x)*P/37.5)*(3*(1-x)/(4-2*x)*P/112.5)**1.5;return a.r0*a.activity*Math.exp(-a.ea*1000/8.314462618*(1/T-1/700))*factor*(1-quotient(x,P)/th.K);}
export function equilibrium(T,P){let lo=0,hi=0.99999;const K=fast(T).K;for(let i=0;i<45;i++){const mid=(lo+hi)/2;if(quotient(mid,P)>K)hi=mid;else lo=mid;}return (lo+hi)/2;}
export function bestTemperature(x,P,a){let best={T:a.tMin,r:-Infinity};for(let T=300;T<=a.limitT;T+=2){const r=rate(T+273.15,P,x,a);if(r>best.r)best={T,r};}return best;}
export function mixtureH(x,T){const th=thermo(T);return (1-x)*th.n.h+3*(1-x)*th.h.h+2*x*th.a.h;}
export function validate(a){const errors=[];for(const [k,label,,min,max] of spec)if(!Number.isFinite(a[k])||a[k]<min||a[k]>max)errors.push(`${label} : valeur hors limites (${min}–${max}).`);if(a.pMin>=a.pMax)errors.push('La pression minimale doit être inférieure à la maximale.');if(a.tMin>=a.tMax)errors.push('La température minimale doit être inférieure à la maximale.');if(a.tMax>=a.limitT)errors.push('Le plafond thermique doit dépasser la température d’entrée maximale.');if(a.pMin<=a.feedP)errors.push('La pression de synthèse doit dépasser celle des gaz frais.');return errors;}
export function simulate(config,a=defaults,detail=false,dx=0.0025){
 let x=0,u=0; const beds=[],points=[];let interHeat=0;const {P,Tin,N,slope,cut}=config;
 for(let i=0;i<N;i++){
  const pi=P-i*(a.dpBed+a.dpCool),startX=x,startU=u;let T=(config.temps?.[i] ?? Math.max(a.tMin,Tin-i*slope))+273.15;
  const threshold=config.cuts?.[i] ?? cut;
  if(pi-a.dpBed-a.dpLoop<=0||T>=a.limitT+273.15||rate(T,pi,x,a)<=0)return null;
  if(i>0){const prev=beds[i-1];if(T>prev.Tout+273.15+0.01)return null;interHeat+=Math.max(0,mixtureH(x,prev.Tout+273.15)-mixtureH(x,T));}
  const initialT=T;let peak=0,peakX=x,peakT=T,reason='Approche équilibre';let ended=false;
  for(let j=0;j<Math.ceil(0.9/dx)+2;j++){
   const p=pi,r=rate(T,p,x,a),th=fast(T);
   if(r>peak){peak=r;peakX=x;peakT=T;}
   if(detail)points.push({lit:i+1,X:x,T:T-273.15,P:p,r,u,force:1-quotient(x,p)/th.K});
   if(x-startX>=0.005&&r<=threshold*peak){reason='Seuil de vitesse';ended=true;break;}
   if(r<=1e-9||x>=0.9){ended=true;break;}
   const cp=(1-x)*(th.cpN+3*th.cpH)+2*x*th.cpA,dtdx=-th.dh*1000/cp;
   let step=Math.min(dx,(a.limitT+273.15-T)/dtdx,0.9-x);
   if(step<1e-7){reason='Plafond thermique';ended=true;break;}
   // Midpoint energy integration and trapezoidal catalyst integral in conversion coordinates.
   const xm=x+step/2,tm=T+dtdx*step/2,mid=fast(tm),cpMid=(1-xm)*(mid.cpN+3*mid.cpH)+2*xm*mid.cpA;
   const nextT=T+step*(-mid.dh*1000/cpMid),nextR=rate(nextT,p,x+step,a);
   if(nextR<=0){reason='Approche équilibre';ended=true;break;}
   const du=step*0.5*(1/r+1/nextR);
   if(u-startU+du>a.maxExposure){reason='Plafond catalyseur';ended=true;break;}
   x+=step;T=nextT;u+=du;
  }
  if(x-startX<0.005||!ended)return null;
  // The entered bed pressure-drop assumption is applied in full between bed outlets and the next bed.
  beds.push({lit:i+1,Xin:startX,Xout:x,deltaX:x-startX,Tin:initialT-273.15,Tout:T-273.15,Pin:pi,Pout:pi-a.dpBed,u:u-startU,peakX,peakT:peakT-273.15,peakRate:peak,threshold,stop:reason});
 }
 const fNH3=PRODUCTION*1000/(MW*a.hours),extent=fNH3/2,reactN=extent/x;
 const residualN=reactN*(1-x),purgeN=a.purge*residualN,recycleN=(1-a.purge)*residualN,freshN=extent+purgeN;
 const recycleRatio=recycleN/freshN,globalX=extent/freshN,mass=u*reactN,volume=mass/a.density;
 const dp=N*a.dpBed+(N-1)*a.dpCool+a.dpLoop;
 if(P<=dp)return null;
 const compressor=(flow,ratio)=>flow*8.314462618*(a.compT+273.15)*Math.log(ratio)/(a.compEta*3600000);
 const freshMW=compressor(4*freshN,P/a.feedP),recycleMW=compressor(4*recycleN,P/(P-dp));
 const rxnMW=extent*(-thermo(298.15).dh)/3600,recoveredMW=rxnMW*a.recovery,grossMW=recoveredMW*a.electricEta;
 const coolingMW=PRODUCTION/a.hours*a.refrigeration/1000+4*reactN*a.circulationCooling/1000;
 const netMW=freshMW+recycleMW+coolingMW-grossMW;
 let capExch=0,qInterMW=0;
 for(let i=0;i<beds.length-1;i++){const b=beds[i],q=reactN*(mixtureH(b.Xout,b.Tout+273.15)-mixtureH(b.Xout,beds[i+1].Tin+273.15))/3600;b.coolMW=q;qInterMW+=q;capExch+=a.exchangerCost*Math.max(0,q)**0.65;}
 beds[beds.length-1].coolMW=0;
 const capReactor=a.reactorCost*(Math.max(volume,0.1)/20)**0.6*(P/150)**1.2+(N-1)*a.extraBed;
 const capComp=a.compressorCost*(Math.max(0.01,freshMW+recycleMW))**0.7;
 const capex=capReactor+capExch+capComp+mass*a.catCost;
 const crf=a.discount===0?1/a.life:a.discount*(1+a.discount)**a.life/((1+a.discount)**a.life-1);
 const annualCapital=capex*crf,annualMaintenance=capex*a.maintenance,annualCat=mass*a.catCost/a.catLife,annualEnergy=netMW*a.hours*a.electricity;
 const annualN2Feed=freshN*28.0134/1000*a.n2Cost*a.hours,annualH2Feed=3*freshN*2.01588/1000*a.h2Cost*a.hours,annualFeed=annualN2Feed+annualH2Feed;
 const tac=annualCapital+annualMaintenance+annualCat+annualEnergy+annualFeed;
 beds.forEach(b=>{b.mass=b.u*reactN;});
 return {...config,hours:a.hours,X:x,u,mass,volume,reactN,freshN,recycleN,purgeN,recycleRatio,globalX,fNH3,freshMW,recycleMW,rxnMW,recoveredMW,grossMW,coolingMW,netMW,qInterMW,dp,capex,tac,cost:tac/PRODUCTION,annualCapital,annualMaintenance,annualCat,annualEnergy,annualN2Feed,annualH2Feed,annualFeed,beds,points};
}
export const linspace=(lo,hi,n)=>Array.from({length:n},(_,i)=>lo+(hi-lo)*i/(n-1));
export function optimize(a=defaults){
 const errors=validate(a);if(errors.length)return {errors,rows:[],best:null,count:0};
 const rows=[],winners=[];let tried=0;
 for(let N=1;N<=a.maxBeds;N++)for(const P of linspace(a.pMin,a.pMax,7))for(const Tin of linspace(a.tMin,a.tMax,5))for(const slope of (N===1?[0]:[0,15,30]))for(const cut of [0.2,0.4,0.6,0.8,0.95]){
  tried++;const out=simulate({N,P,Tin,slope,cut},a);if(out){rows.push(out);if(!winners[N-1]||out.cost<winners[N-1].cost)winners[N-1]=out;}
 }
 // Two-pass coordinate search: temperatures and stop thresholds become independent per bed.
 const seeds=winners.filter(Boolean);
 const referenceInDomain=REPORT_REFERENCE.N<=a.maxBeds&&REPORT_REFERENCE.P>=a.pMin&&REPORT_REFERENCE.P<=a.pMax&&REPORT_REFERENCE.temps.every(T=>T>=a.tMin&&T<=a.tMax&&T<a.limitT);
 const reference=referenceInDomain?simulate(REPORT_REFERENCE,a,false,0.0005):null;
 if(reference)seeds.push(reference);
 const refined=seeds.map(seed=>{
  let best=simulate({...seed,temps:seed.temps??seed.beds.map(b=>b.Tin),cuts:seed.cuts??seed.beds.map(()=>seed.cut)},a,false,0.0005);
  if(!best)return null;
  for(const scale of [1,0.5]){
   for(const d of [-1,1]){const P=best.P+d*(a.pMax-a.pMin)/12*scale;if(P>=a.pMin&&P<=a.pMax){const r=simulate({...best,P},a,false,0.0005);if(r&&r.cost<best.cost)best=r;}}
   for(let i=0;i<best.N;i++)for(const d of [-1,1]){
    const temps=[...best.temps];temps[i]+=d*10*scale;
    if(temps[i]>=a.tMin&&temps[i]<=a.tMax){const r=simulate({...best,temps},a,false,0.0005);if(r&&r.cost<best.cost)best=r;}
    const cuts=[...best.cuts];cuts[i]=Math.max(0.1,Math.min(0.98,cuts[i]+d*0.1*scale));
    const r=simulate({...best,cuts},a,false,0.0005);if(r&&r.cost<best.cost)best=r;
   }
  }
  return simulate(best,a,true,0.0005);
 }).filter(Boolean);
 // Retain the better result for each bed count, including the feasible report
 // seed. A new search must not discard an already known cheaper candidate.
 const byBeds=new Map();
 for(const candidate of refined)if(!byBeds.has(candidate.N)||candidate.cost<byBeds.get(candidate.N).cost)byBeds.set(candidate.N,candidate);
 const finalists=[...byBeds.values()];
 finalists.sort((a,b)=>a.N-b.N);const best=finalists.reduce((a,b)=>!a||b.cost<a.cost?b:a,null);
 return {errors:[],rows,best,winners:finalists,tried,count:rows.length,referenceSeedUsed:!!reference};
}
export function materialBalance(r){
 const hours=r.hours;
 if(!Number.isFinite(hours)||hours<=0)throw new Error('La durée annuelle de marche doit accompagner les résultats du bilan.');
 const flow=(kmol_h,molarMass)=>({kmol_h,t_h:kmol_h*molarMass/1000,t_an:kmol_h*molarMass/1000*hours});
 const mixture=n=>({N2:flow(n,28.0134),H2:flow(3*n,2.01588)});
 return {hours,production:flow(r.fNH3,MW),fresh:mixture(r.freshN),reactor:mixture(r.reactN),recycle:mixture(r.recycleN),purge:mixture(r.purgeN),recycleFraction:r.recycleN/r.reactN};
}
export function fields(r){const b=materialBalance(r);return {modele:VERSION,classification:'simulation non calibrée; coûts hypothétiques et partiels',production_t_an:PRODUCTION,heures_marche_an:r.hours,lits:r.N,pression_bar:r.P,T_entrees_C:r.beds.map(b=>b.Tin).join(' / '),seuils_vitesse:r.beds.map(b=>b.threshold).join(' / '),conversion_passage:r.X,conversion_globale:r.globalX,catalyseur_kg:r.mass,recycle_sur_frais:r.recycleRatio,fraction_recycle_entree:b.recycleFraction,N2_frais_kmol_h:r.freshN,H2_frais_kmol_h:3*r.freshN,N2_recycle_kmol_h:r.recycleN,N2_purge_kmol_h:r.purgeN,N2_frais_t_an:b.fresh.N2.t_an,H2_frais_t_an:b.fresh.H2.t_an,N2_reacteur_t_an:b.reactor.N2.t_an,H2_reacteur_t_an:b.reactor.H2.t_an,N2_recycle_t_an:b.recycle.N2.t_an,H2_recycle_t_an:b.recycle.H2.t_an,N2_purge_t_an:b.purge.N2.t_an,H2_purge_t_an:b.purge.H2.t_an,compression_frais_MW:r.freshMW,compression_recycle_MW:r.recycleMW,energie_chimique_MW:r.rxnMW,intercooling_MW:r.qInterMW,electricite_brute_MW:r.grossMW,electricite_nette_achetee_MW:r.netMW,CAPEX_MAD:r.capex,TAC_MAD_an:r.tac,cout_gaz_frais_MAD_an:r.annualFeed,TAC_MAD_an_hors_feed:r.tac-r.annualFeed,cout_partiel_MAD_t:r.cost};}
export function csv(rows){if(!rows.length)return '';const keys=Object.keys(rows[0]);const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';return '\uFEFF'+[keys.map(escape).join(';'),...rows.map(r=>keys.map(k=>escape(r[k])).join(';'))].join('\r\n');}
