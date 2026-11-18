import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {imageExists} from './images.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let count=0;
try{for(const name of await fs.readdir(path.join(root,'media'))){if(name==='.gitkeep')continue;await imageExists(root,'/media/'+name);count++;}}catch(e){if(e.code!=='ENOENT')throw e;}
console.log(`Validated ${count} publication images.`);
