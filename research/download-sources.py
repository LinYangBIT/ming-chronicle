#!/usr/bin/env python3
"""Archive selected public-domain Ming Shi chapters with provenance and hashes."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import json
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent / 'sources'
ROOT.mkdir(exist_ok=True)
VOLUMES = [(1,'太祖一'),(2,'太祖二'),(5,'成祖一'),(113,'后妃'),(125,'徐达与常遇春'),(128,'刘基'),(145,'姚广孝'),(304,'郑和'),(170,'于谦'),(212,'戚继光'),(226,'海瑞'),(213,'张居正'),(24,'崇祯末年')]
class ArticleText(HTMLParser):
    def __init__(self):
        super().__init__(); self.depth=0; self.parts=[]; self.active=False; self.skip=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if not self.active and 'mw-parser-output' in a.get('class','').split():
            self.active=True; self.depth=1; return
        if self.active:
            if tag not in ('br','hr','img','meta','input','link','wbr','source'): self.depth+=1
            if tag in ('script','style'): self.skip+=1
            if tag in ('p','h1','h2','h3','h4','div','li','tr','br'): self.parts.append('\n')
    def handle_endtag(self,tag):
        if tag in ('br','hr','img','meta','input','link','wbr','source'): return
        if self.active:
            if tag in ('script','style'): self.skip=max(0,self.skip-1)
            self.depth-=1
            if self.depth<=0:self.active=False
    def handle_data(self,data):
        if self.active and not self.skip:self.parts.append(data)

def fetch(item):
    n,title=item
    url='https://zh.wikisource.org/wiki/'+urllib.parse.quote(f'明史/卷{n}')
    name=f'ming-shi-{n:03}'
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'MingChronicleResearch/1.0 (educational historical reference archive)'})
        with urllib.request.urlopen(req,timeout=30) as r:
            data=r.read(); final_url=r.url
        if len(data)<1000:raise ValueError('Response too short for a chapter')
        html=data.decode('utf-8')
        if '明史' not in html:raise ValueError('Expected title absent')
        (ROOT/(name+'.html')).write_bytes(data)
        parser=ArticleText();parser.feed(html)
        body='\n'.join(line.strip() for line in ''.join(parser.parts).splitlines() if line.strip())
        text='明史 · 卷'+str(n)+' · '+title+'\n来源：'+url+'\n古籍正文属公版；网页整理及注释请遵守来源页所列许可。\n\n'+body
        (ROOT/(name+'.txt')).write_text(text,encoding='utf-8')
        return {'volume':n,'title':'《明史》卷'+str(n)+' · '+title,'url':url,'final_url':final_url,'html_file':name+'.html','text_file':name+'.txt','bytes':len(data),'sha256':sha256(data).hexdigest(),'text_chars':len(body),'status':'downloaded'}
    except Exception as e:
        return {'volume':n,'title':title,'url':url,'status':'failed','error':str(e)}

with ThreadPoolExecutor(max_workers=3) as pool: records=list(pool.map(fetch,VOLUMES))
manifest={'retrieved_at_utc':datetime.now(timezone.utc).isoformat(),'work':'明史','author':'张廷玉等奉敕修','edition':'维基文库排印本；见各卷来源页及版本历史','scope':'13 selected reference volumes, not 明朝那些事儿','license_note':'Ancient original is public domain. Archive preserves source URLs; modern additions and website material follow source-page licensing.','records':records}
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for row in records:print(row['volume'],row['status'],row.get('bytes',0),row.get('text_chars',0),row.get('error',''))
raise SystemExit(any(x['status']!='downloaded' for x in records))
