@component()
export class GhostGame extends APJS.BasicScriptComponent {
 @serializeProperty ghost: APJS.SceneObject;
 @serializeProperty template: APJS.SceneObject;
 @serializeProperty hud: APJS.SceneObject;
 @serializeProperty panel: APJS.SceneObject;
 @serializeProperty result: APJS.SceneObject;
 @serializeProperty reward: APJS.SceneObject;
 @serializeProperty hurt: APJS.SceneObject;
 @serializeProperty textures: APJS.Texture[]=[];
 @serializeProperty verificationTime: number=0;
 @serializeProperty spider:APJS.SceneObject;
 @serializeProperty webTemplate:APJS.SceneObject;
 @serializeProperty stageTwoScore:number=100;
 @serializeProperty verificationScore:number=0;
 @serializeProperty resultArt:APJS.SceneObject;
 @serializeProperty successTexture:APJS.Texture;
 @serializeProperty failureTexture:APJS.Texture;
 @serializeProperty tutorial:APJS.SceneObject;
 @serializeProperty verificationOutcome:number=0;
 @serializeProperty silk:APJS.SceneObject;
 private spiderY=710;private spiderX=150;
 private webAge:number[]=[];private webMode:number[]=[];
 private celebration=0;
 private lanes:number[]=[];private drift:number[]=[];private fallSpeed:number[]=[];
 private nextDropX():number{if(!this.lanes.length){this.lanes=[0,1,2,3,4];for(let i=4;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=this.lanes[i];this.lanes[i]=this.lanes[j];this.lanes[j]=t;}}return -275+(this.lanes.pop() as number)*115+(Math.random()-.5)*40;}
 private hadFace=false; private phase=1;private banner=0;private webTimer=0;private slow=0;
 private webs:APJS.SceneObject[]=[];private wx:number[]=[];private wy:number[]=[];private vx:number[]=[];private vy:number[]=[];private live:boolean[]=[];
 private finished=false; private ready=false; private active=false; private remaining=15; private hp=3; private score=0;
 private x=-40; private elapsed=0; private spawnTimer=0; private immunity=0; private logTimer=0;
 private pool:APJS.SceneObject[]=[]; private xs:number[]=[]; private ys:number[]=[]; private used:boolean[]=[];
 private recordStarted=()=>{this.spiderY=650;this.spiderX=Math.random()<.5?-220:150;if(this.silk)this.silk.setEnabledInHierarchy(false);this.lanes=[];this.x=-40;this.phase=1;this.banner=0;this.webTimer=2.2;this.slow=0;this.finished=false;this.active=true;this.remaining=15;this.hp=3;this.celebration=0;if(this.resultArt)this.resultArt.setEnabledInHierarchy(false);this.ghost.setEnabledInHierarchy(true);this.score=0;this.elapsed=0;this.spawnTimer=1.8;this.immunity=1.8;for(let i=0;i<this.pool.length;i++){this.used[i]=false;this.pool[i].setEnabledInHierarchy(false);}for(let i=0;i<this.webs.length;i++){this.live[i]=false;this.webs[i].setEnabledInHierarchy(false);}if(this.spider)this.spider.setEnabledInHierarchy(false);console.log('[state] ghost record-start phase=1');};
 private stopped=()=>{for(let i=0;i<this.pool.length;i++){this.used[i]=false;this.pool[i].setEnabledInHierarchy(false);}for(let i=0;i<this.webs.length;i++){this.live[i]=false;this.webs[i].setEnabledInHierarchy(false);}this.slow=0;if(this.silk)this.silk.setEnabledInHierarchy(false);if(this.spider)this.spider.setEnabledInHierarchy(false);this.active=false;this.finished=false;console.log('[state] ghost idle');};
 onStart():void {const e=APJS.EventManager.getGlobalEmitter();e.on(APJS.EventType.RecordStart,this.recordStarted,this);e.on(APJS.EventType.RecordEnd,this.stopped,this);}
 private txt(o:APJS.SceneObject,s:string):void{const t=o.getComponent("Text") as APJS.Text;if(t)t.text=s;}
 private sound(o:APJS.SceneObject):void{const a=o.getComponent("AudioComponent") as APJS.AudioComponent;if(a){a.play();console.log('[audio] '+o.name);}}
 onUpdate(dt:number):void{
 if(!this.ready){if(!this.ghost||!this.template||!this.hud||!this.panel||!this.result||!this.spider||!this.webTemplate)return;this.ready=true;if(this.silk){const t=this.silk.getComponent('Image') as APJS.Image;(t as any).autoSortingOrder=false;(t as any).sortingOrder=11;}if(this.silk)this.silk.setEnabledInHierarchy(false);const ghostImage=this.ghost.getComponent('Image') as APJS.Image;(ghostImage as any).autoSortingOrder=false;(ghostImage as any).sortingOrder=10;this.spider.setEnabledInHierarchy(false);this.webTemplate.setEnabledInHierarchy(false);for(let i=0;i<6;i++){const o=this.webTemplate.clone();o.setEnabledInHierarchy(false);const im=o.getComponent('Image') as APJS.Image;(im as any).autoSortingOrder=false;(im as any).sortingOrder=8;this.webs.push(o);this.wx.push(0);this.wy.push(0);this.vx.push(0);this.vy.push(0);this.live.push(false);this.webAge.push(0);this.webMode.push(0);}this.template.setEnabledInHierarchy(false);for(let i=0;i<12;i++){const o=this.template.clone();o.setEnabledInHierarchy(false);const image=o.getComponent("Image") as APJS.Image;(image as any).autoSortingOrder=false;(image as any).sortingOrder=8;this.pool.push(o);this.xs.push(0);this.ys.push(0);this.drift.push(0);this.fallSpeed.push(1);this.used.push(false);}console.log('[state] ghost pool ready=12');}
 dt=Math.max(0,Math.min(dt,1));this.logTimer+=dt;
 const r=APJS.AlgorithmManager.getResult();const face=r.getFaceCount()>0;if(face!==this.hadFace){console.log(face?'[tracking] face-restored':'[tracking] face-lost paused');this.hadFace=face;}
 if(face){const f=r.getFaceBaseInfo(0);const cx=f.rect.x+f.rect.width*.5;const target=Math.max(-260,Math.min(180,(cx-.5)*850-40));this.x+=(target-this.x)*Math.min(1,dt*(this.slow>0?4:8));if(this.logTimer>1){console.log('[input] faceX='+cx.toFixed(3)+' ghostX='+this.x.toFixed(1));this.logTimer=0;}}
 const st=this.ghost.getComponent("ScreenTransform") as APJS.ScreenTransform;st.anchoredPosition=new APJS.Vector2f(this.x,-300+Math.sin(this.elapsed*7)*5);st.rotation=Math.sin(this.elapsed*4)*4;
 const gi=this.ghost.getComponent("Image") as APJS.Image;gi.opacity=this.immunity>0?(Math.sin(this.elapsed*35)>0?.35:1):1;
 if(!this.active){if(this.finished){this.celebration+=dt;if(this.resultArt){const a=this.resultArt.getComponent('ScreenTransform') as APJS.ScreenTransform;const pop=Math.min(1,this.celebration/.45);const s=.75+.25*pop+Math.sin(pop*Math.PI)*.12;a.scale=new APJS.Vector2f(s,s);a.rotation=Math.sin(this.celebration*3)*2;}return;}if(this.resultArt)this.resultArt.setEnabledInHierarchy(false);this.ghost.setEnabledInHierarchy(true);if(this.tutorial)this.txt(this.tutorial,'← 轻轻移头，躲开南瓜 →');this.panel.setEnabledInHierarchy(false);this.txt(this.hud,'幽灵糖果夜 · 开拍挑战15秒');return;}
 if(!face){this.panel.setEnabledInHierarchy(true);this.txt(this.result,'小幽灵找不到你啦\n请回到镜头前\n游戏已暂停');return;}
 this.panel.setEnabledInHierarchy(false);
 if(this.verificationScore>0){this.score=this.verificationScore;this.verificationScore=0;}
 if(this.phase===1&&this.elapsed>=5){this.phase=2;this.banner=1.4;this.spiderY=710;this.webTimer=.8;this.spider.setEnabledInHierarchy(true);console.log('[stage] ghost phase=2 score='+this.score);}
 if(this.banner>0){this.banner-=dt;this.panel.setEnabledInHierarchy(true);this.txt(this.result,'第二阶段：蜘蛛出动！\n小心定向蛛网\n碰到蛛网会短暂减速');return;}
 this.slow=Math.max(0,this.slow-dt);
 if(this.phase===2){this.webTimer-=dt;const ss=this.spider.getComponent('ScreenTransform') as APJS.ScreenTransform;this.spiderY=Math.max(100,this.spiderY-dt*85);const sx=this.spiderX;ss.anchoredPosition=new APJS.Vector2f(sx,this.spiderY);ss.rotation=Math.sin(this.elapsed*5)*5;if(this.silk){this.silk.setEnabledInHierarchy(true);const line=this.silk.getComponent('ScreenTransform') as APJS.ScreenTransform;const length=Math.max(1,640-this.spiderY);line.anchoredPosition=new APJS.Vector2f(sx,640-length*.5);line.scale=new APJS.Vector2f(1,1);line.sizeDelta=new APJS.Vector2f(3,length+4);}
 if(this.webTimer<=0){this.webTimer=2.4;for(let i=0;i<6;i++){if(this.live[i])continue;this.live[i]=true;this.webMode[i]=0;this.webAge[i]=0;const wi=this.webs[i].getComponent('Image') as APJS.Image;wi.opacity=1;const wt=this.webs[i].getComponent('ScreenTransform') as APJS.ScreenTransform;wt.scale=new APJS.Vector2f(1,1);this.wx[i]=sx;this.wy[i]=this.spiderY;const dx=this.x-sx,dy=-300-this.spiderY;const len=Math.sqrt(dx*dx+dy*dy);this.vx[i]=dx/len*230;this.vy[i]=dy/len*230;this.webs[i].setEnabledInHierarchy(true);console.log('[web] fire aimX='+this.x.toFixed(0));break;}}
 for(let i=0;i<6;i++){if(!this.live[i])continue;
 const ws=this.webs[i].getComponent('ScreenTransform') as APJS.ScreenTransform;
 const im=this.webs[i].getComponent('Image') as APJS.Image;
 if(this.webMode[i]===0){
 this.wx[i]+=this.vx[i]*dt;this.wy[i]+=this.vy[i]*dt;
 if(this.wx[i]<=-310||this.wx[i]>=230||this.wy[i]<=-410){
 this.wx[i]=Math.max(-310,Math.min(230,this.wx[i]));this.wy[i]=Math.max(-410,this.wy[i]);
 this.webMode[i]=1;this.webAge[i]=0;console.log('[web] wall-bloom x='+this.wx[i].toFixed(0)+' y='+this.wy[i].toFixed(0));}
 }else{
 this.webAge[i]+=dt;const age=this.webAge[i];const pop=Math.min(1,age/.22);const scale=1+3*pop;ws.scale=new APJS.Vector2f(scale,scale);im.opacity=age<=2?1:Math.max(0,1-(age-2)/.65);
 if(age<=2&&Math.pow((this.wx[i]-this.x)/145,2)+Math.pow((this.wy[i]+300)/145,2)<1){this.slow=Math.max(this.slow,.18);}
 if(age>=2.65){this.live[i]=false;this.webs[i].setEnabledInHierarchy(false);this.score+=15;console.log('[web] faded hp='+this.hp);continue;}
 }
 ws.anchoredPosition=new APJS.Vector2f(this.wx[i],this.wy[i]);ws.rotation=this.webMode[i]===0?this.elapsed*60:0;
 }}
 this.remaining-=dt;this.elapsed+=dt;this.immunity=Math.max(0,this.immunity-dt);this.spawnTimer-=dt;
 if(this.verificationTime>0){this.remaining=this.verificationTime;this.verificationTime=0;}
 if(this.spawnTimer<=0){this.spawnTimer=Math.max(.75,1.15-this.elapsed*.018)*(.8+Math.random()*.4);for(let i=0;i<12;i++){if(this.used[i])continue;this.used[i]=true;this.xs[i]=this.nextDropX();this.ys[i]=530+Math.random()*60;this.drift[i]=(Math.random()-.5)*28;this.fallSpeed[i]=.85+Math.random()*.3;console.log('[spawn] pumpkin x='+this.xs[i].toFixed(0));const o=this.pool[i];const im=o.getComponent("Image") as APJS.Image;if(this.textures.length)im.texture=this.textures[0];o.setEnabledInHierarchy(true);break;}}
 for(let i=0;i<12;i++){if(!this.used[i])continue;const oldY=this.ys[i];this.ys[i]-=(175+this.elapsed*4.2)*this.fallSpeed[i]*dt;this.xs[i]=Math.max(-300,Math.min(220,this.xs[i]+this.drift[i]*dt));const os=this.pool[i].getComponent("ScreenTransform") as APJS.ScreenTransform;os.anchoredPosition=new APJS.Vector2f(this.xs[i],this.ys[i]);os.rotation=Math.sin(this.elapsed*2+i)*10;
 if(Math.abs(this.xs[i]-this.x)<48&&Math.min(oldY,this.ys[i])< -255&&Math.max(oldY,this.ys[i])> -345&&this.immunity<=0){this.hp--;this.immunity=1.8;this.used[i]=false;this.pool[i].setEnabledInHierarchy(false);this.sound(this.hurt);console.log('[hit] hp='+this.hp);}
 else if(this.ys[i]<-410){this.used[i]=false;this.pool[i].setEnabledInHierarchy(false);this.score+=20;this.sound(this.reward);console.log('[score] '+this.score);}}
 this.txt(this.hud,'生命 '+this.hp+'/3    '+Math.ceil(Math.max(0,this.remaining))+'秒    '+this.score+'分');
 if(this.verificationOutcome===1){this.hp=0;this.verificationOutcome=0;}else if(this.verificationOutcome===2){this.remaining=0;this.verificationOutcome=0;}
 if(this.tutorial)this.txt(this.tutorial,this.phase===1?'← 轻轻移头，躲开南瓜 →':this.slow>0?'被缠住啦！移出蛛网':'蛛网撞墙会展开 · 只减速');
 if(this.remaining<=0||this.hp<=0){this.finished=true;this.active=false;for(let i=0;i<12;i++)this.pool[i].setEnabledInHierarchy(false);for(let i=0;i<6;i++)this.webs[i].setEnabledInHierarchy(false);this.spider.setEnabledInHierarchy(false);this.panel.setEnabledInHierarchy(true);this.ghost.setEnabledInHierarchy(false);if(this.silk)this.silk.setEnabledInHierarchy(false);this.celebration=0;if(this.resultArt){const im=this.resultArt.getComponent('Image') as APJS.Image;im.texture=this.hp>0?this.successTexture:this.failureTexture;this.resultArt.setEnabledInHierarchy(true);}if(this.tutorial)this.txt(this.tutorial,'重新开拍 · 再玩一局');this.txt(this.result,(this.hp>0?'成功！糖果全归你啦':'你变成南瓜头了！')+'\n剩余生命 '+Math.max(0,this.hp)+'/3 · '+this.score+'分'+'\n重新开拍再挑战');console.log('[result] score='+this.score+' hp='+this.hp);}}
 onDestroy():void{const e=APJS.EventManager.getGlobalEmitter();e.off(APJS.EventType.RecordStart,this.recordStarted,this);e.off(APJS.EventType.RecordEnd,this.stopped,this);}
}