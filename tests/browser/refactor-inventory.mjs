// Records source sizes, import edges and Vite output without changing application code.
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),sources=[];
async function scan(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await scan(file);else if(/\.(js|mjs|css|php)$/.test(file)){const text=await readFile(file,'utf8');sources.push({file:path.relative(root,file).replaceAll('\\','/'),lines:text.trimEnd().split(/\r?\n/).length,bytes:Buffer.byteLength(text),imports:[...text.matchAll(/(?:from\s+|import\s*\()['"]([^'"]+)/g)].map(match=>match[1])});}}}
for(const folder of ['app','resources','routes','tests','config','database/migrations'])await scan(folder);
const manifest=JSON.parse(await readFile('public/build/manifest.json','utf8')),bundles=[];
for(const [entry,chunk]of Object.entries(manifest))bundles.push({entry,file:chunk.file,bytes:(await stat('public/build/'+chunk.file)).size,isEntry:Boolean(chunk.isEntry),imports:chunk.imports||[],dynamicImports:chunk.dynamicImports||[]});
const report={sources:sources.toSorted((a,b)=>b.lines-a.lines),bundles};
await writeFile(process.argv[2]||'docs/REFACTOR_BASELINE.json',JSON.stringify(report,null,2));console.log(JSON.stringify({largest25:report.sources.slice(0,25),bundles},null,2));
