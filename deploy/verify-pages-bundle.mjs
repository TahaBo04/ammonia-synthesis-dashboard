import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url));
const release=JSON.parse(readFileSync(path.join(root,'site/release.json'),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
for(const [file,expected] of Object.entries(release.files)){
 if(hash(readFileSync(path.join(root,'site',file)))!==expected)throw Error('Static build hash mismatch: '+file);
}
for(const [file,expected] of Object.entries(release.sources)){
 if(hash(readFileSync(path.join(root,file)))!==expected)throw Error('Source changed after packaging; rebuild and run deploy/prepare-pages.mjs: '+file);
}
const snapshot=JSON.parse(readFileSync(path.join(root,'src/data.json'),'utf8'));
if(snapshot.buildStatus!=='complete')throw Error('Dashboard is not complete.');
console.log('Static bundle and authored source hashes verified.');
