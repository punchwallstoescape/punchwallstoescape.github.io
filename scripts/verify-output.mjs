#!/usr/bin/env node
/** Inspect actual static export files, not source templates. */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root=resolve('out');
const site='https://punchwallstoescape.github.io';
const routes=['','codes','beginner-guide','tools','gems'];
const problems=[];
const read=(p)=>existsSync(p)?readFileSync(p,'utf8'):'';
const find=(p)=>existsSync(p)&&statSync(p).isDirectory()?readdirSync(p):[];
const pageInfo=[];
for(const route of routes){
 const page=route?`/${route}/`:'/';
 const file=join(root,route,'index.html');
 const html=read(file);
 if(!html){problems.push(`${page}: no exported HTML`);continue;}
 const canonical=html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0]||html.match(/<link[^>]+href=["'][^"']+["'][^>]+rel=["']canonical["'][^>]*>/i)?.[0]||'';
 const url=`${site}${page}`;
 if(!canonical.includes(url))problems.push(`${page}: canonical missing or wrong (${canonical})`);
 if((html.match(/<h1\b/gi)||[]).length!==1)problems.push(`${page}: expected one H1`);
 if(!/<meta[^>]+name=["']description["']/i.test(html))problems.push(`${page}: meta description missing`);
 if(!/<title>[^<]+<\/title>/i.test(html))problems.push(`${page}: title missing`);
 if(!/<(?:nav|header)\b/i.test(html))problems.push(`${page}: missing header/nav`);
 if(!/<footer\b/i.test(html))problems.push(`${page}: missing footer`);
 const headings=(html.match(/<h2\b/gi)||[]).length;
 if(headings<2)problems.push(`${page}: too few H2 (${headings})`);
 const cssLinks=[...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(m=>m[0]);
 if(cssLinks.length===0)problems.push(`${page}: no stylesheet links`);
 for(const tag of cssLinks){const path=tag.match(/href=["']([^"']+)["']/)?.[1];if(!path)continue;
  if(path.startsWith('/')&&!existsSync(join(root,path.slice(1))))problems.push(`${page}: CSS referenced but missing: ${path}`);
 }
 const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&\w+;/g,' ').replace(/\s+/g,' ').trim();
 const wordCount=(text.match(/[a-zA-Z]+(?:[-'][a-zA-Z]+)*/g)||[]).length;
 if(wordCount<1400)problems.push(`${page}: only ${wordCount} visible English words (target ~1500–2000)`);
 pageInfo.push({page,wordCount,cssLinks:cssLinks.length,headings});
}
const sitemap=read(join(root,'sitemap.xml'));
const robots=read(join(root,'robots.txt'));
if(!sitemap.includes(site+'/'))problems.push('sitemap.xml missing current site URL');
for(const r of routes)if(!sitemap.includes(`${site}/${r?r+'/':''}`))problems.push(`sitemap missing /${r}`);
if(!robots.includes('Sitemap:'))problems.push('robots.txt missing sitemap reference');
const cssDirs=find(join(root,'_next','static','css'));
if(!cssDirs.some(x=>x.endsWith('.css')))problems.push('No exported Next CSS in _next/static/css');
for(const p of problems)console.error('FAIL',p);
console.log(JSON.stringify({status:problems.length?'FAIL':'PASS',pages:pageInfo,problems},null,2));
if(problems.length)process.exit(1);
