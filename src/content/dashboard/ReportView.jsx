import React from 'react';
import {Section} from '../../data-app-public.jsx';
import flowsheet from '../assets/report-flowsheet.png';

const f=(n,d=2)=>n.toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const historical=[
 [1,19.65,24.88,50.60,415.71],[2,27.80,34.68,64.22,356.22],
 [3,32.25,34.39,74.17,348.24],[4,34.65,35.17,83.69,352.59],
 [5,36.95,32.77,92.60,361.60],[6,38.20,35.55,102.17,371.89],
];
export default function ReportView({r,a,Block,DataGrid}){
 const load=r.freshMW+r.recycleMW+r.coolingMW;
 return <>
  <div className="nh-callout"><b>Rapport de référence · 27 septembre 2026</b><p>Base retenue : 100 000 t NH₃/an, (365 − 21) × 24 = 8 256 h/an. Le rapport conserve le point à 3 lits, 122,5 bar et 32,25 % de conversion issu du screening à 8 000 h/an. Le mode « Point du rapport » applique ce réglage aux hypothèses actives ; « Candidat économique » relance la recherche.</p></div>
  <Section id="nh-reactor-title" title="Réacteur et charge catalytique" columns={2}>
   <Block id="nh-reactor-choice" title="Lits fixes adiabatiques, refroidissement indirect" rows={r.beds}><p>Chaque lit chauffe sous l’effet de la réaction. Un échangeur refroidit le gaz avant le lit suivant, sans mélange avec l’utilité. Le train complet n’est ni isotherme ni globalement adiabatique.</p><p>Architecture proposée : paniers à écoulement radial dans un corps sous pression. Le choix radial reste à confirmer avec le fournisseur ; aucune comparaison économique complète avec un réacteur isotherme n’est disponible.</p><p><b>Point affiché : {r.N} lits, {f(r.P,1)} bar, X = {f(r.X*100)} %.</b></p></Block>
   <Block id="nh-catalyst-choice" title="Fer promu · quantité de modèle" rows={r.beds}><p>Catalyseur proposé : fer promu. La cinétique de substitution n’est pas calibrée sur un grade commercial.</p><div className="nh-formula">W = F<sub>N₂,0</sub> ∫ dX/r<sub>N₂</sub><br/>V = W / ρ<sub>apparente</sub></div><p><b>{f(r.mass/1000)} t</b> équivalentes, soit <b>{f(r.volume)} m³</b> à {f(a.density,0)} kg/m³. À trajectoire et activité identiques, W varie avec le débit horaire.</p><p className="nh-note">La référence à 8 256 h/an donne environ 33,32 t et 15,15 m³. Charge fournisseur, granulométrie, désactivation et marge de fin de vie restent à confirmer.</p></Block>
  </Section>
  <Section id="nh-bed-design-title" title="Conditions et refroidissement du point affiché"><Block id="nh-bed-design" title="Détail des lits" rows={r.beds}><DataGrid head={['Lit','P entrée (bar abs)','T entrée (°C)','T sortie (°C)','X cumulé (%)','Catalyseur (t)','Volume (m³)','Échange suivant (MWth)']} rows={r.beds.map(b=>[b.lit,f(b.Pin,1),f(b.Tin,1),f(b.Tout,1),f(b.Xout*100),f(b.mass/1000),f(b.mass/a.density),f(b.coolMW)])}/></Block></Section>
  <Section id="nh-control-title" title="Instrumentation et correction de température"><Block id="nh-instrumented-flowsheet" title="Schéma de principe du rapport · configuration à trois lits" rows={[
   {boucle:'Température',mesure:'TT / TI',regulateur:'TIC',action:'Bypass froid du préchauffeur ou bypass chaud des échangeurs inter-lits'},
   {boucle:'Alimentation',mesure:'FT',regulateur:'FIC',action:'Débit frais en maintenant le rapport H₂/N₂ de 3:1'},
   {boucle:'Protection thermique',mesure:'TSHH indépendant',regulateur:'SIS',action:'Arrêt / mise en sécurité à définir par HAZOP'},
  ]}><img src={flowsheet} alt="Boucle de synthèse trois lits avec échangeurs, mesures TI et TT, régulateurs TIC, vannes de bypass, récupération de chaleur, séparation, purge et recycle." style={{display:'block',width:'100%',height:'auto'}}/><p className="nh-note">Schéma du rapport pour trois lits ; il ne se redessine pas lorsque le nombre de lits exploré change. Document conceptuel, pas un P&ID d’exécution.</p><DataGrid head={['Fonction','Mesure / régulation','Action']} rows={[
   ['Entrée du premier lit','TT/TI ; TIC-101 ; préchauffeur E-100','Si la température monte, ouvrir le bypass froid autour de E-100. H-100 assure le chauffage de démarrage.'],
   ['Entrée des lits 2 et 3','TIC-102/TV-102 ; TIC-103/TV-103','Si la température monte, fermer le bypass chaud autour de E-101/E-102.'],
   ['Sorties des lits','TI-111 à TI-113','Indication, alarmes et suivi des gradients et points chauds.'],
   ['Alimentation','FT/FIC ; rapport H₂/N₂','Régler le débit frais en maintenant 3 mol H₂ / mol N₂.'],
   ['Séparateur et pression','PT/PIC ; LT/LIC','Contrôler la pression et la sortie NH₃ liquide ; protéger le compresseur contre le pompage.'],
   ['Sécurité indépendante','TSHH ; soupapes ; détection H₂/NH₃','Mise en sécurité et dépressurisation selon étude HAZOP/SIL ; seuils et positions de panne à valider.'],
  ]}/></Block></Section>
  <Section id="nh-report-energy-title" title="Valorisation de l’exothermicité"><Block id="nh-report-energy" title="Couverture des charges de synthèse" rows={[{generation_MWe:r.grossMW,charges_MWe:load,couverture_pct:100*r.grossMW/load}]}><div className="nh-formula">Q<sub>chimique</sub> × η<sub>récupération</sub> × η<sub>électrique</sub> = P<sub>génération</sub><br/>{f(r.rxnMW,3)} MWth × {f(a.recovery*100,0)} % × {f(a.electricEta*100,0)} % = {f(r.grossMW,3)} MWe</div><p>Couverture calculée : <b>{f(100*r.grossMW/load,1)} %</b> de {f(load,3)} MWe de charges ; import net : <b>{f(r.netMW,3)} MWe</b>. La chaleur peut produire de la vapeur pour une turbine et un alternateur. Ce potentiel ne démontre pas l’autonomie de l’unité ; le démarrage exige une énergie externe.</p><p className="nh-note">Amont H₂/N₂ exclu. Le réseau vapeur et la turbine restent à dimensionner. Le bilan inter-lits n’est pas ajouté une seconde fois à la chaleur chimique.</p></Block></Section>
  <Section id="nh-history-title" title="Origine du choix de trois lits"><Block id="nh-historical-comparison" title="Screening historique · 8 000 h/an, conservé dans le rapport" rows={historical.map(([lits,conversion_pct,catalyseur_t,CAPEX_MMAD,cout_MAD_t])=>({lits,conversion_pct,catalyseur_t,CAPEX_MMAD,cout_MAD_t}))}><DataGrid head={['Lits','X (%)','Catalyseur (t)','CAPEX (MMAD)','Coût partiel (MAD/t)']} rows={historical.map(row=>row.map((v,i)=>i===0?v:f(v)))}/><p>Le troisième lit économisait environ 0,80 MMAD/an par rapport à deux lits ; le quatrième ajoutait 0,44 MMAD/an. Les valeurs de ce tableau sont historiques. Les coûts du bandeau et de l’onglet optimisation sont recalculés aux hypothèses actives, dont {f(a.hours,0)} h/an.</p><p className="nh-note">Corrections arithmétiques par rapport au PDF : à 8 256 h/an et au point de référence, Q inter-lits ≈ 8,819 MWth, Q chimique ≈ 9,068 MWth et couverture électrique ≈ 30,7 %. Les anciennes valeurs 9,10 / 9,36 MW et 30,2 % ne sont pas reprises.</p></Block></Section>
 </>;
}
