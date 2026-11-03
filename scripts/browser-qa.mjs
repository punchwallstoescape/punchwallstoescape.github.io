#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const routes=['/','/codes/','/beginner-guide/','/tools/','/gems/'];
const widths=[375,390,768,1440];
const browser=await chromium.launch({headless:true});
mkdirSync('qa-screenshots',{recursive:true});
const findings=[];
for(const route of routes){
 for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:width>=768?900:844},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',res=>{if(res.url().endsWith('.css')&&res.status()!==200)errors.push(`CSS HTTP ${res.status()}: ${res.url()}`)});
  const response=await page.goto(`http://127.0.0.1:8765${route}`,{waitUntil:'networkidle'});
  const data=await page.evaluate(()=>{
   const header=document.querySelector('header');const h1=document.querySelector('h1');const css=[...document.styleSheets].filter(s=>s.href);
   const headerStyle=header?getComputedStyle(header):null;
   return {title:document.title,h1:h1?.textContent?.trim(),cssCount:css.length,headerDisplay:headerStyle?.display,headerPosition:headerStyle?.position,bodyWidth:document.documentElement.clientWidth,rawBodyScrollWidth:document.body.scrollWidth,innerWidth:innerWidth,navLinks:document.querySelectorAll('header a').length};
  });
  const path=`qa-screenshots/${route.replace(/\//g,'_')||'home'}-${width}.png`;
  await page.screenshot({path,fullPage:true});
  if(data.actualHorizontalScroll>1){
    data.offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+2&&getComputedStyle(e).display!=='none'})
      .slice(0,12).map(e=>({tag:e.tagName,class:e.className?.toString().slice(0,80),width:Math.round(e.getBoundingClientRect().width),right:Math.round(e.getBoundingClientRect().right),text:e.textContent?.trim().slice(0,45)})));
  }
  data.actualHorizontalScroll=await page.evaluate(()=>{window.scrollTo(99999,0);const x=window.scrollX;window.scrollTo(0,0);return x;});
  if(response.status()!==200||data.cssCount===0||data.actualHorizontalScroll>1||!data.h1||data.navLinks<5||errors.length) findings.push({route,width,status:response.status(),...data,errors});
  await page.close();
 }
}
await browser.close();
writeFileSync('qa-browser-results.json',JSON.stringify({status:findings.length?'FAIL':'PASS',findings,checked:routes.length*widths.length},null,2));
console.log(JSON.stringify({status:findings.length?'FAIL':'PASS',findings,checked:routes.length*widths.length},null,2));
if(findings.length)process.exit(1);
