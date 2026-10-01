import {cpSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const snapshot=JSON.parse(readFileSync(path.join(root,'src/data.json'),'utf8'));
if(snapshot.buildStatus!=='complete')throw Error('Finish dashboard authoring before publishing.');
const dist=path.join(root,'dist'),site=path.join(root,'site');
if(!existsSync(path.join(dist,'data-app-build.json')))throw Error('Build the verified split-data app first.');
mkdirSync(site,{recursive:true});
for(const entry of readdirSync(dist,{withFileTypes:true})){
 if(entry.isFile())cpSync(path.join(dist,entry.name),path.join(site,entry.name));
}
writeFileSync(path.join(site,'.nojekyll'),'');
const files={};
for(const name of readdirSync(dist))files[name]=hash(readFileSync(path.join(dist,name)));
const sources={};
function walk(dir){for(const entry of readdirSync(path.join(root,dir),{withFileTypes:true})){
 const relative=dir+'/'+entry.name;
 if(entry.isDirectory())walk(relative);else sources[relative]=hash(readFileSync(path.join(root,relative)));
}}
walk('src/content');
for(const name of ['src/data.json','src/theme.css'])sources[name]=hash(readFileSync(path.join(root,name)));
writeFileSync(path.join(site,'release.json'),JSON.stringify({createdAt:new Date().toISOString(),files,sources},null,2)+'\n');
console.log('Packaged verified build into site/.');
