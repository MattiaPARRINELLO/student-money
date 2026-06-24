(()=>{var a={};a.id=435,a.ids=[435],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3421:(a,b,c)=>{"use strict";Object.defineProperty(b,"I",{enumerable:!0,get:function(){return g}});let d=c(71237),e=c(55088),f=c(17679);async function g(a,b,c,g){if((0,d.isNodeNextResponse)(b)){var h;b.statusCode=c.status,b.statusMessage=c.statusText;let d=["set-cookie","www-authenticate","proxy-authenticate","vary"];null==(h=c.headers)||h.forEach((a,c)=>{if("x-middleware-set-cookie"!==c.toLowerCase())if("set-cookie"===c.toLowerCase())for(let d of(0,f.splitCookiesString)(a))b.appendHeader(c,d);else{let e=void 0!==b.getHeader(c);(d.includes(c.toLowerCase())||!e)&&b.appendHeader(c,a)}});let{originalResponse:i}=b;c.body&&"HEAD"!==a.method?await (0,e.pipeToNodeResponse)(c.body,i,g):i.end()}}},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},29554:(a,b,c)=>{"use strict";function d(a){return a.replace(/<[^>]*>/g,"").trim()}async function e(a){try{let b=encodeURIComponent(a+" France"),c=`https://news.google.com/rss/search?q=${b}&hl=fr&gl=FR&hl=fr`,e=await fetch(c,{headers:{"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},signal:AbortSignal.timeout(8e3)});if(!e.ok)return{results:"",urls:"",count:0};let f=(await e.text()).match(/<item>[\s\S]*?<\/item>/gi)||[],g=[],h=[];for(let a of f.slice(0,5)){let b=d(a.match(/<title>([\s\S]*?)<\/title>/)?.[1]||""),c=(a.match(/<link>([\s\S]*?)<\/link>/)?.[1]||"").trim(),e=a.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]||"",f=a.match(/<description>([\s\S]*?)<\/description>/)?.[1]||"",i=d(d(f)),j=d(a.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]||"");if(b&&c){let a=e?new Date(e).toLocaleDateString("fr-FR"):"";g.push(`Titre: ${b}
Source: ${j||"Google News"}
Date: ${a}
${i.slice(0,300)}
Lien: ${c}`),h.push({href:c,title:b})}}return{results:g.length>0?g.map((a,b)=>`[${b+1}] ${a}`).join("\n\n"):"",urls:h.length>0?h.map(a=>`- [${a.title}](${a.href})`).join("\n"):"",count:g.length}}catch{return{results:"",urls:"",count:0}}}async function f(a){try{let b=`https://html.duckduckgo.com/html/?q=${encodeURIComponent(a+" France")}`,c=await fetch(b,{headers:{"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"},signal:AbortSignal.timeout(8e3)});if(!c.ok)return{results:"",urls:"",count:0};let e=await c.text();if(e.includes("challenge")||e.includes("anomaly"))return{results:"",urls:"",count:0};let f=[],g=[],h=[...e.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)],i=[...e.matchAll(/<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi)];for(let a=0;a<Math.min(h.length,i.length,5);a++){let b=h[a][1].trim();b.startsWith("//")?b="https:"+b:b.startsWith("/")&&(b="https://duckduckgo.com"+b);let c=d(h[a][2]),e=d(i[a][1]);c&&b&&(f.push(`${c}
${e}
Lien: ${b}`),g.push({href:b,title:c}))}return{results:f.length>0?f.map((a,b)=>`[${b+1}] ${a}`).join("\n\n"):"",urls:g.length>0?g.map(a=>`- [${a.title}](${a.href})`).join("\n"):"",count:f.length}}catch{return{results:"",urls:"",count:0}}}async function g(a){let b=await e(a);if(b.results)return{results:b.results,urls:b.urls};let c=await f(a);return c.results?{results:c.results,urls:c.urls}:{results:"",urls:""}}async function h(a){let b=[],c=[];for(let d of a){let a=await g(d);a.results&&(b.push(a.results),c.push(a.urls))}return{results:b.join("\n\n---\n\n"),urls:c.join("\n")}}c.d(b,{H:()=>g,O:()=>h})},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},69038:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>C,patchFetch:()=>B,routeModule:()=>x,serverHooks:()=>A,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>z});var d={};c.r(d),c.d(d,{POST:()=>w});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(29554);let v=`Tu es un journaliste expert en finances \xe9tudiantes francophones.
Tu \xe9cris pour Student-Money, le blog de r\xe9f\xe9rence des \xe9tudiants fran\xe7ais qui veulent \xe9conomiser.

STYLE :
- Ton de pote qui s'y conna\xeet, pas d'encyclop\xe9die
- N'H\xc9SITE PAS \xe0 donner ton avis, \xe0 classer, \xe0 recommander
- Phrases naturelles, pas de formules robotiques
- Varie la structure : parfois 4 sections, parfois 6, pas de plan syst\xe9matique
- Pas de t\xe9moignages fictifs, JAMAIS
- Public : \xe9tudiants 18-25 ans
- Pas d'appel aux commentaires ni de phrases d'interaction artificielles en fin d'article
- PRENDS POSITION : gauche sociale, d\xe9fense des \xe9tudiants, critique des in\xe9galit\xe9s et du syst\xe8me, mais reste concret et pas militant

FORMAT DE SORTIE OBLIGATOIRE — MDX avec frontmatter YAML :
---
title: "TITRE_ACCROCHEUR_OPTIMISE_SEO"
slug: "slug-court-en-kebab-case"
date: "DATE_DU_JOUR_YYYY-MM-DD"
category: "CATEGORIE_PARMI_bourses|logement|bouffe|transport|jobs|banque|nouvelle_categorie_si_indispensable"
excerpt: "R\xc9SUM\xc9_MAX_155_CARACT\xc8RES"
coverImage: "DESCRIPTION_IMAGE_DETAILLEE_EN_FRANCAIS"
faq:
  - question: "QUESTION_1"
    answer: "R\xc9PONSE_1"
  - question: "QUESTION_2"
    answer: "R\xc9PONSE_2"
  - question: "QUESTION_3"
    answer: "R\xc9PONSE_3"
  - question: "QUESTION_4"
    answer: "R\xc9PONSE_4"
  - question: "QUESTION_5"
    answer: "R\xc9PONSE_5"
liens:
  - titre: "NOM_DU_SITE"
    url: "https://..."
    description: "Courte description du site"
  - titre: "NOM_DU_SITE_2"
    url: "https://..."
    description: "Courte description du site 2"
tags:
  - "mot-cle-1"
  - "mot-cle-2"
  - "mot-cle-3"
---

Structure INDICATIVE (adaptable) :
## INTRODUCTION
(chiffre choc ou question, 120-180 mots)

## H2_TITRE_NATUREL_1
(contenu + liste \xe0 puces)

## H2_TITRE_NATUREL_2
(contenu + conseils)

... (pas forc\xe9ment 5 sections, adapte au sujet)

## CONCLUSION
(avis personnel + call-to-action newsletter)

R\xc8GLES STRICTES :
- 1200-2000 mots au total
- Chaque section apporte une VRAIE valeur, pas de remplissage
- Utilise des chiffres, des prix, des donn\xe9es v\xe9rifiables
- CITATIONS OBLIGATOIRES : cite tes sources dans le texte avec des liens markdown
- LIENS UTILES : UNIQUEMENT dans le champ 'liens' du frontmatter, jamais dans le corps
- Cat\xe9gories existantes : bourses, logement, bouffe, transport, jobs, banque. Utilise d'ABORD ces cat\xe9gories. Cr\xe9e une nouvelle cat\xe9gorie UNIQUEMENT si vraiment aucun sujet existant ne correspond. Si tu cr\xe9es une nouvelle cat\xe9gorie, choisis un mot court en fran\xe7ais sans espaces (ex: sante, mode, tech, etc.).
- La date doit \xeatre AUJOURD'HUI
- R\xe9ponds UNIQUEMENT avec le contenu MDX, pas de texte avant/apr\xe8s`;async function w(a){try{let{topic:b}=await a.json();if(!b||"string"!=typeof b||b.trim().length<3)return Response.json({error:"Le sujet doit contenir au moins 3 caract\xe8res."},{status:400});let c=b.trim(),{results:d,urls:e}=await (0,u.H)(c),f=process.env.OPENSCODE_API_KEY;if(!f)return Response.json({error:"Cl\xe9 API OpenCode non configur\xe9e (OPENSCODE_API_KEY)."},{status:500});let g=await fetch("https://opencode.ai/zen/go/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${f}`,"Content-Type":"application/json"},body:JSON.stringify({model:"deepseek-v4-pro",messages:[{role:"system",content:v},{role:"user",content:function(a,b,c){let d=new Date().toISOString().split("T")[0],e=`SUJET : ${a}
DATE : ${d}

`;return b&&(e+=`R\xc9SULTATS DE RECHERCHE WEB R\xc9CENTS :
${b}

`),c&&(e+=`SOURCES \xc0 CITER (utilise ces liens dans le corps du texte et dans la section LIENS UTILES) :
${c}

`),e+=`\xc9cris l'article complet en MDX. R\xe9ponds UNIQUEMENT avec le contenu MDX.`}(c,d,e)}],temperature:.7,max_tokens:16e3}),signal:AbortSignal.timeout(12e4)});if(!g.ok){let a=await g.text();return Response.json({error:`Erreur API (${g.status}) : ${a.slice(0,200)}`},{status:502})}let h=await g.json(),i=h.choices?.[0]?.message?.content||"";if(!i||i.length<100)return Response.json({error:"L'IA n'a pas g\xe9n\xe9r\xe9 assez de contenu. R\xe9essaie avec un sujet plus pr\xe9cis."},{status:500});return Response.json({content:i,searched:d.length>0})}catch(b){let a=b instanceof Error?b.message:"Erreur inconnue";return Response.json({error:`Erreur lors de la g\xe9n\xe9ration : ${a}`},{status:500})}}let x=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/generate/route",pathname:"/api/generate",filename:"route",bundlePath:"app/api/generate/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/mattia/Documents/Perso/student-money/src/app/api/generate/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:y,workUnitAsyncStorage:z,serverHooks:A}=x;function B(){return(0,g.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:z})}async function C(a,b,c){var d;let e="/api/generate/route";"/index"===e&&(e="/");let g=await x.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:y,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!y){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||x.isDev||y||(G="/index"===(G=D)?"/":G);let H=!0===x.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>x.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>x.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await x.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await x.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await x.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},95736:(a,b,c)=>{"use strict";a.exports=c(44870)},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[873],()=>b(b.s=69038));module.exports=c})();