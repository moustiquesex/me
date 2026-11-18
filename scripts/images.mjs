import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
export const imageLimit=5*1024*1024;
const formats={'image/jpeg':'jpeg','image/png':'png','image/webp':'webp'};
export async function cleanImage(bytes,mime){
 if(!formats[mime])throw Error('Formats acceptés : JPEG, PNG et WebP.');
 if(!bytes.length||bytes.length>imageLimit)throw Error('Image limitée à 5 Mio.');
 const decoder=sharp(bytes,{limitInputPixels:24_000_000,failOn:'warning',animated:false});
 const meta=await decoder.metadata();
 if(meta.format!==formats[mime])throw Error('Le type MIME ne correspond pas au contenu de l’image.');
 if((meta.pages||1)>1)throw Error('Les images animées ne sont pas acceptées.');
 // Decode and re-encode: discard metadata, appended bytes and original filename.
 return decoder.rotate().resize({width:1800,height:1800,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
}
export async function imageExists(root,value){
 if(!/^\/media\/[a-f0-9-]{36}\.webp$/.test(value))throw Error('Image invalide. Utilisez le téléversement du portail.');
 const target=path.join(root,value);
 const stat=await fs.lstat(target);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>imageLimit)throw Error('Image refusée.');
 const bytes=await fs.readFile(target);const metadata=await sharp(bytes,{limitInputPixels:24_000_000}).metadata();
 if(metadata.format!=='webp'||(metadata.pages||1)>1)throw Error('Image enregistrée invalide.');
 // Force full decoding during checks, not just a signature read.
 await sharp(bytes,{limitInputPixels:24_000_000}).raw().toBuffer();
 return target;
}
