import {portrait} from './portraits.js';
export function challengeURL(run){const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('seed',run.seed);return url.href;}
export function shareText(run,ending){return `我在《大明·故人长卷》里，成为了「${ending.title}」。\n${ending.subtitle} · 人生回响 ${ending.score} · ${run.wins}/6 幕告捷\n同一卷历史，你会作何选择？\n${challengeURL(run)}`;}
function wrap(ctx,text,x,y,maxWidth,lineHeight){let line='';for(const char of text){if(ctx.measureText(line+char).width>maxWidth&&line){ctx.fillText(line,x,y);line=char;y+=lineHeight;}else line+=char;}if(line)ctx.fillText(line,x,y);return y+lineHeight;}
function load(src){return new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}
export async function downloadPoster(run,ending,character){
 const c=document.createElement('canvas');c.width=900;c.height=1200;const x=c.getContext('2d');
 x.fillStyle='#f6efdf';x.fillRect(0,0,900,1200);
 try{const bg=await load('assets/ming-scroll.png');x.save();x.globalAlpha=.32;x.drawImage(bg,-390,645,1420,800);x.restore();}catch{}
 x.strokeStyle='#b99a58';x.lineWidth=2;x.strokeRect(28,28,844,1144);x.lineWidth=1;x.strokeRect(39,39,822,1122);
 x.textAlign='center';x.fillStyle='#88774f';x.font='20px "PingFang SC",sans-serif';x.fillText('大 明  ·  故 人 长 卷',450,105);x.font='14px sans-serif';x.fillText('M I N G   ·   A   L I F E   I N   H I S T O R Y',450,135);
 if(character){const svg=portrait(character,240);const blobURL=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const im=await load(blobURL);x.drawImage(im,335,175,230,258);}finally{URL.revokeObjectURL(blobURL);}}
 x.fillStyle='#9e4232';x.font='bold 43px "Songti SC",serif';x.fillText(ending.title,450,492);x.fillStyle='#65705a';x.font='24px "Songti SC",serif';x.fillText(ending.subtitle,450,541);
 x.textAlign='left';x.font='22px "Songti SC",serif';wrap(x,ending.text,125,604,650,40);
 x.textAlign='center';x.fillStyle='#9d7c41';x.font='68px Georgia,serif';x.fillText(String(ending.score),450,817);x.font='17px sans-serif';x.fillText(`人生回响  /  ${run.wins} 幕告捷`,450,854);
 const stats=[['民心','people'],['粮草','grain'],['军备','army'],['声望','prestige']];x.font='20px sans-serif';x.fillStyle='#52664f';stats.forEach(([label,key],i)=>x.fillText(`${label} ${run.stats[key]}`,195+i*170,925));
 x.font='21px "Songti SC",serif';x.fillText('同一卷历史，你会作何选择？',450,1015);x.font='15px monospace';x.fillText(`同题种子  ${run.seed}`,450,1055);x.font='14px sans-serif';x.fillStyle='#8c8972';x.fillText('历史人物 · 原创演绎 · 我的选择不等于历史结局',450,1117);
 const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw new Error('海报生成失败');const url=URL.createObjectURL(blob);const a=document.createElement('a');a.download=`大明人生签-${ending.title}.png`;a.href=url;a.click();return {blob,url};
}
