/* MundoAleam — real-time 3D world. Fictional architecture, procedural models. */
(function(){
'use strict';
const U=.0625, palettes={skin:['#f2ccac','#dba28b','#b67e58','#83503b','#513429'],hair:['#282321','#2f2724','#342621','#bb8b46','#52443c','#a7a5a2'],suit:['#334c78','#944350','#e0ded7','#665680','#343941']};
let current=null,preview=null;
function engine(T){
 const geometries={box:new T.BoxGeometry(1,1,1),sphere:new T.SphereGeometry(1,12,10),cyl:new T.CylinderGeometry(1,1,1,12),taper:new T.CylinderGeometry(.82,1,1,12),diamond:new T.OctahedronGeometry(1)};
 const materials=new Map();
 function material(color,rough=.8,metal=0){const key=color+rough+metal;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color:new T.Color(color).convertSRGBToLinear(),roughness:rough,metalness:metal}));return materials.get(key)}
 function mesh(parent,type,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const m=new T.Mesh(geometries[type],material(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);parent.add(m);return m}
 function batch(parent,draw){const groups=new Map();const obj=new T.Object3D();draw((type,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{const id=type+color;if(!groups.has(id))groups.set(id,{type,color,list:[]});obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);obj.rotation.set(rx,ry,rz);obj.updateMatrix();groups.get(id).list.push(obj.matrix.clone())});for(const g of groups.values()){const m=new T.InstancedMesh(geometries[g.type],material(g.color),g.list.length);g.list.forEach((a,i)=>m.setMatrixAt(i,a));m.instanceMatrix.needsUpdate=true;parent.add(m)}}
 return {mesh,batch,dispose(){for(const g of Object.values(geometries))g.dispose();for(const m of materials.values())m.dispose()}};
}
function person(T,k,a){const root=new T.Group(),body=new T.Group();root.add(body);let skin=palettes.skin[+a.skin]||palettes.skin[2],hair=palettes.hair[+a.hair]||palettes.hair[0],suit=palettes.suit[+a.outfit]||palettes.suit[0],style=+a.hair;const m=(type,col,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,p=body)=>k.mesh(p,type,col,x,y,z,sx,sy,sz,rx,ry,rz);
 m('taper',suit,0,1.25,0,.255,.62,.16);m('sphere',suit,0,1.51,0,.25,.125,.155);m('sphere','#303542',0,.91,0,.215,.14,.14);m('box','#efeeeb',0,1.41,.16,.13,.39,.019);m('box','#842e40',0,1.38,.18,.035,.26,.015);m('box',suit,-.095,1.43,.177,.08,.27,.025,0,0,-.36);m('box',suit,.095,1.43,.177,.08,.27,.025,0,0,.36);
 m('cyl',skin,0,1.65,0,.071,.14,.071);m('sphere',skin,0,1.85,0,.145,.19,.138);m('sphere',skin,0,1.82,.132,.035,.041,.035);for(let a of [-1,1]){m('sphere',skin,a*.142,1.85,0,.022,.042,.03);m('sphere','#f0e9e3',a*.052,1.875,.125,.031,.018,.011);m('sphere','#302b2d',a*.052,1.875,.138,.013,.014,.008);m('box',hair,a*.053,1.91,.13,.056,.011,.012)}m('sphere','#8c5148',0,1.765,.125,.034,.01,.008);
 if(style!==4){m('sphere',hair,0,1.95,-.017,.15,.112,.145);m('sphere',hair,0,1.9,-.085,.15,.13,.076);if(style===1){m('sphere',hair,-.12,1.77,-.065,.071,.24,.10);m('sphere',hair,.12,1.77,-.065,.071,.24,.10)}if(style===2)for(let i=0;i<5;i++){let q=i*1.256;m('sphere',hair,.105*Math.cos(q),2,.10*Math.sin(q),.067,.06,.067)}}else m('sphere',hair,0,1.99,-.01,.14,.045,.13);
 let limbs=[];for(let side of [-1,1]){const leg=new T.Group(),arm=new T.Group();leg.position.set(side*.109,.92,0);arm.position.set(side*.275,1.49,0);body.add(leg,arm);m('taper','#343747',0,-.33,0,.103,.65,.104,0,0,0,leg);m('sphere','#27282d',0,-.82,.04,.10,.083,.15,0,0,0,leg);m('taper',suit,0,-.22,0,.078,.44,.082,0,0,0,arm);m('sphere',skin,0,-.49,.015,.061,.084,.061,0,0,0,arm);limbs.push({leg,arm,side})}
 const blob=new T.Mesh(new T.CircleGeometry(.35,20),new T.MeshBasicMaterial({color:0x343341,transparent:true,opacity:.17,depthWrite:false}));blob.rotation.x=-Math.PI/2;blob.position.y=.016;blob.scale.y=.72;root.add(blob);root.userData={body,limbs,blob};return root;
}
function anim(p,t,moving,yaw){const b=p.userData,amp=moving?.53:0;b.body.position.y=moving?.035*Math.abs(Math.sin(t*10)):.007*Math.sin(t*2.4);for(const l of b.limbs){l.leg.rotation.x=Math.sin(t*10)*amp*l.side;l.arm.rotation.x=-Math.sin(t*10)*amp*.7*l.side;l.arm.rotation.z=l.side*.085}if(Number.isFinite(yaw))p.rotation.y+=Math.atan2(Math.sin(yaw-p.rotation.y),Math.cos(yaw-p.rotation.y))*.23}
function light(T,scene){scene.add(new T.HemisphereLight(0xe4edff,0x625a62,.85));let a=new T.DirectionalLight(0xffe8cf,1.45);a.position.set(-8,16,9);scene.add(a);let b=new T.DirectionalLight(0xb9d1ff,.35);b.position.set(13,8,-12);scene.add(b)}
function renderFactory(T,canvas){const r=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'default',stencil:false});r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.02;return r}
const X=x=>(x-240)*U,Z=y=>(y-152)*U;
function dispose(){if(!current)return;let c=current;cancelAnimationFrame(c.frame);c.observer&&c.observer.disconnect();if(c.cleanup)c.cleanup();window.removeEventListener('resize',c.resize);c.k.dispose();c.scene.traverse(o=>{if(o.userData&&o.userData.blob){o.userData.blob.geometry.dispose();o.userData.blob.material.dispose()}});c.renderer.dispose();current=null}
function clearPreview(){if(!preview)return;preview.k.dispose();preview.renderer.dispose();preview=null}
function avatar(){const canvas=document.getElementById('avatarPreview');if(!canvas||!window.THREE)return;try{const T=window.THREE;if(!preview){const renderer=renderFactory(T,canvas),scene=new T.Scene(),cam=new T.PerspectiveCamera(32,1,.1,30);scene.background=new T.Color('#344664').convertSRGBToLinear();light(T,scene);cam.position.set(3.2,2.3,5.4);cam.lookAt(0,1,0);preview={renderer,scene,cam,k:engine(T)}}const p=preview;if(p.model)p.scene.remove(p.model);let f=new FormData(document.getElementById('start'));p.model=person(T,p.k,{skin:f.get('skin'),hair:f.get('hair'),outfit:f.get('outfit')});p.scene.add(p.model);p.renderer.setSize(180,180,false);p.renderer.render(p.scene,p.cam)}catch(e){canvas.setAttribute('aria-label','Prévia 3D indisponível')}}
function mount(api){dispose();clearPreview();const canvas=document.getElementById('worldCanvas');if(!canvas)return;const error=message=>{canvas.setAttribute('data-render','error');const el=document.getElementById('worldDialog');if(el){el.textContent=message;const b=document.createElement('button');b.textContent='Reiniciar cenário 3D';b.onclick=()=>location.reload();el.append(b)}canvas.setAttribute('aria-label',message)};if(!window.THREE){error('O motor 3D não carregou. Recarregue a página. Os módulos parlamentares continuam disponíveis.');return}
 const T=window.THREE;canvas.setAttribute('data-render','loading');let renderer;try{renderer=renderFactory(T,canvas)}catch(e){error('O navegador não iniciou WebGL. Reabra a página no Safari atualizado.');return}
 try{
 const scene=new T.Scene(),k=engine(T),cam=new T.PerspectiveCamera(46,1,.1,80);scene.background=new T.Color('#263852').convertSRGBToLinear();scene.fog=new T.Fog(new T.Color('#263852').convertSRGBToLinear(),32,60);light(T,scene);
 k.batch(scene,m=>{
 const box=(c,x,y,z,w,h,d,ry=0)=>m('box',c,x,y,z,w,h,d,0,ry),wood='#805b45',dark='#56463e',wall='#c7b7a7',blue='#334d75',stone='#b8aa9a',tile='#beb1a0';
 box('#a2aab2',0,-.20,0,30.7,.34,19.3);box(tile,0,-.035,0,30,.08,19);box('#69788b',0,.035,0,30,.035,2.5);box('#8f394d',0,.055,0,29.8,.015,.13);
 for(let i=-14;i<=14;i+=2)box('#9ca8b8',i,.052,0,.018,.01,2.45);
 function table(x,z,w=2.05,d=.75){box(wood,x,.81,z,w,.12,d);box(dark,x,.39,z,w*.88,.72,d*.48);box('#a78e75',x,.73,z+d*.5,w,.065,.035)}
 function chair(x,z,ry=0){box(blue,x,.48,z,.46,.10,.43,ry);box('#32425a',x,.75,z-.20,.46,.46,.09,ry);for(let a of [-1,1])for(let b of [-1,1])box('#7d8287',x+a*.17,.22,z+b*.17,.043,.43,.043)}
 function monitor(x,z){box('#333943',x,1.02,z,.52,.34,.065);box('#9fb7c8',x,1.02,z+.04,.45,.27,.01);box('#444c55',x,.87,z,.06,.15,.05)}
 function plant(x,z){m('cyl','#9a7260',x,.24,z,.24,.47,.24);m('cyl','#67594c',x,.50,z,.035,.45,.035);for(let i=0;i<5;i++){let a=i*1.25;m('sphere','#648b72',x+Math.cos(a)*.18,.75+((i%2)*.17),z+Math.sin(a)*.18,.19,.29,.13,0,a)}}
 for(const r of api.rooms){let x=X(r.x+72),z=Z(r.y+58),w=9,d=7.25;box(r.id==='ple'?'#7c8da6':r.id==='gab'?'#b59678':r.id==='tri'?'#a897ac':'#a7a6a2',x,.015,z,w,.035,d);for(let i=-4;i<=4;i++)box('#8c8581',x+i,.038,z,.014,.01,d);for(let j=-3;j<=3;j++)box('#8c8581',x,.039,z+j,w,.01,.015);
 if(r.y<100){box(wall,x,1.15,z-d/2,w,2.3,.17);box('#b2b5bd',x,.11,z-d/2+.12,w,.22,.07)}else{for(const a of [-1,1]){box(wall,x+a*2.7,1.15,z-d/2,3.6,2.3,.17);box('#b2b5bd',x+a*2.7,.11,z-d/2+.12,3.6,.22,.07)}}box(wall,x-w/2,1.02,z,.14,2.04,d);box(wall,x+w/2,.45,z,.13,.9,d);
 box('#8392a5',x,2.25,z-d/2+.12,w,.08,.14);for(let a of [-1,1]){box('#91acc4',x+a*2.45,1.56,z-d/2+.105,1.9,1.12,.024);box('#7c8a9b',x+a*2.45,1.56,z-d/2+.13,.045,1.12,.018)}
 if(r.id==='gab'){table(x-1.8,z-1.6,2.6,1);chair(x-1.8,z-2.3);monitor(x-1.8,z-1.57);chair(x-2.4,z-.75,Math.PI);chair(x-1.3,z-.75,Math.PI);box('#968471',x+3.5,.67,z-1.9,.65,1.35,2.2);plant(x+3.2,z+2.2)}
 if(r.id==='ple'){box('#9e8b78',x,.15,z-2.2,6.8,.3,1.35);table(x,z-2.15,4.8,.8);for(let row=0;row<3;row++)for(let col=0;col<8;col++){let xx=x+(col-3.5)*.91,zz=z-.7+row*.72;chair(xx,zz);box(wood,xx,.70,zz-.34,.74,.10,.3)}}
 if(r.id==='tri'){box('#98929e',x,.16,z-1.6,5.8,.32,2);box(wood,x,.79,z-1.65,1.15,1.1,.67);box('#ddc5a6',x,1.39,z-1.65,1.24,.12,.79);m('cyl','#33353a',x+.13,1.57,z-1.6,.025,.25,.025,0,0,.2);for(let a of [-1,1]){m('cyl','#8c9093',x+a*2.2,1.2,z-2.6,.035,2.4,.035);box(a===1?'#983746':'#395a91',x+a*2.2+.48,1.94,z-2.6,.95,.6,.045)}chair(x-2,z+.8);chair(x+2,z+.8)}
 if(r.id==='orc'||r.id==='eme'){table(x-1.8,z-1.6,2.4,.8);monitor(x-1.8,z-1.65);chair(x-1.8,z-2.2);for(let i=0;i<3;i++)box('#a69b8e',x+2.65,.9,z-2.05+i*.6,1.05,1.8,.51);plant(x-3.3,z+1.7)}
 if(r.id==='imp'){box('#33517e',x,1.25,z-2.6,5,2.1,.12);table(x,z-1.3,3,.75);chair(x-.75,z-1.9);chair(x+.75,z-1.9);box('#323c4c',x-2.7,1.25,z+.8,.48,.32,.58);for(let i=0;i<3;i++){let a=i*2.094;m('cyl','#59616a',x-2.7+Math.cos(a)*.22,.63,z+.8+Math.sin(a)*.22,.025,1.1,.025,.3,a,.3)}}
 }
 });
 const player=person(T,k,api.getAvatar());scene.add(player);const crystal=k.mesh(player,'diamond','#e9bc63',0,2.36,0,.12,.27,.12);crystal.material=crystal.material.clone();const npcs=api.rooms.map(r=>{let p=person(T,k,{skin:r.skin,hair:r.hair,outfit:r.coat});scene.add(p);const mark=k.mesh(p,'diamond','#e8b850',0,2.28,0,.11,.19,.11);return {r,p,mark}});
 const pedestrians=[0,1].map(i=>{let p=person(T,k,{skin:i+1,hair:i+3,outfit:i+3});scene.add(p);return p});const ray=new T.Raycaster(),floorPlane=new T.Plane(new T.Vector3(0,1,0),0),hit=new T.Vector3();let wide=false,last=0,lastSave=0,lastLabel='',lastNear='',lastMini=0,wasMoving=false;const pos=new T.Vector3(),look=new T.Vector3(),target=new T.Vector3();const state={scene,renderer,k,frame:0,observer:null,resize:null};current=state;
 function resize(){let w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}state.resize=resize;resize();window.addEventListener('resize',resize);if(window.ResizeObserver){state.observer=new ResizeObserver(resize);state.observer.observe(canvas)}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();error('A memória gráfica foi interrompida. Recarregue a página para retomar a partida.')});
 const zoom=document.getElementById('worldZoom');if(zoom)zoom.onclick=()=>{wide=!wide;zoom.textContent=wide?'＋ Aproximar':'− Visão geral'};
 const full=document.getElementById('worldImmersive');if(full)full.onclick=()=>{document.body.classList.toggle('immersive-world');full.textContent=document.body.classList.contains('immersive-world')?'Sair da tela cheia':'⛶ Tela cheia';resize()};
 document.getElementById('worldTalk').onclick=api.talk;

// Dedicated touch joystick. A tap on the map is accepted only on release, not on a swipe.
const stick=document.getElementById('worldStick'),knob=document.getElementById('stickKnob');let finger=null,tap=null,cleanups=[];
const bind=(el,type,fn,opt)=>{if(!el)return;el.addEventListener(type,fn,opt);cleanups.push(()=>el.removeEventListener(type,fn,opt))};
function stickMove(x,y,nudge){let r=stick.getBoundingClientRect(),dx=x-r.left-r.width/2,dy=y-r.top-r.height/2;let len=Math.hypot(dx,dy),limit=r.width*.32;if(len>limit){dx*=limit/len;dy*=limit/len}knob.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)';if(len<6){api.release();return}api.direction(dx/limit,dy/limit,nudge)}
function stop(){finger=null;tap=null;if(knob)knob.style.transform='translate(0px,0px)';api.stopRoute();api.release()}
function release(){finger=null;if(knob)knob.style.transform='translate(0px,0px)';api.release()}
function mapTap(x,y){let r=canvas.getBoundingClientRect();if(r.width<1||r.height<1)return;ray.setFromCamera({x:((x-r.left)/r.width)*2-1,y:1-((y-r.top)/r.height)*2},cam);if(ray.ray.intersectPlane(floorPlane,hit)&&ray.ray.direction.y<-.08){let xx=hit.x/U+240,yy=hit.z/U+152;if(xx>=8&&xx<=472&&yy>=16&&yy<=295){api.stopRoute();const room=api.rooms.find(a=>xx>=a.x&&xx<=a.x+144&&yy>=a.y&&yy<=a.y+116);api.route(xx,yy,room?.id)}}}
if(window.PointerEvent){
bind(stick,'pointerdown',e=>{if(finger!==null||e.button>0)return;e.preventDefault();finger=e.pointerId;try{stick.setPointerCapture(e.pointerId)}catch{}stickMove(e.clientX,e.clientY,true)});
bind(stick,'pointermove',e=>{if(e.pointerId!==finger)return;e.preventDefault();stickMove(e.clientX,e.clientY,false)});
for(const event of ['pointerup','pointercancel','lostpointercapture'])bind(stick,event,e=>{if(e.pointerId===finger){e.preventDefault();release()}});
bind(window,'pointerup',e=>{if(e.pointerId===finger)release()});
bind(window,'pointercancel',e=>{if(e.pointerId===finger)release()});
bind(canvas,'pointerdown',e=>{if(finger!==null||e.button>0)return;e.preventDefault();tap={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};try{canvas.setPointerCapture(e.pointerId)}catch{}});
bind(canvas,'pointerup',e=>{if(!tap||tap.id!==e.pointerId)return;let p=tap;tap=null;if(Math.hypot(e.clientX-p.x,e.clientY-p.y)<12&&performance.now()-p.t<650)mapTap(e.clientX,e.clientY)});
bind(canvas,'pointercancel',()=>tap=null);
}else{
bind(stick,'touchstart',e=>{if(finger!==null)return;e.preventDefault();let a=e.changedTouches[0];finger=a.identifier;stickMove(a.clientX,a.clientY,true)},{passive:false});
bind(stick,'touchmove',e=>{let a=Array.from(e.changedTouches).find(t=>t.identifier===finger);if(a){e.preventDefault();stickMove(a.clientX,a.clientY,false)}},{passive:false});
for(const event of ['touchend','touchcancel'])bind(window,event,e=>{if(Array.from(e.changedTouches).some(t=>t.identifier===finger))release()},{passive:true});
bind(canvas,'touchstart',e=>{if(finger!==null)return;e.preventDefault();let a=e.changedTouches[0];tap={id:a.identifier,x:a.clientX,y:a.clientY,t:performance.now()}},{passive:false});
bind(canvas,'touchend',e=>{let a=Array.from(e.changedTouches).find(t=>t.identifier===tap?.id);if(!a)return;let p=tap;tap=null;if(Math.hypot(a.clientX-p.x,a.clientY-p.y)<12&&performance.now()-p.t<650)mapTap(a.clientX,a.clientY)});
}
bind(window,'blur',stop);bind(document,'visibilitychange',()=>{if(document.hidden)stop()});bind(document.getElementById('worldStop'),'click',stop);
state.cleanup=()=>{stop();cleanups.forEach(f=>f())};
document.querySelectorAll('[data-room]').forEach(b=>b.onclick=()=>{let r=api.rooms.find(r=>r.id===b.dataset.room);if(r){stop();api.route(r.x+72,r.y+103,r.id)}});
 let w=api.world();cam.position.set(X(w.x)+.8,5.9,Z(w.y)+7.3);look.set(X(w.x),.9,Z(w.y)-.5);cam.lookAt(look);
 function frame(t){if(!canvas.isConnected||!api.isWorld()||current!==state){if(current===state)dispose();return}let dt=Math.max(0,Math.min(.035,(t-(last||t))/1000));last=t;let beforeX=w.x,beforeY=w.y;api.tick(t);let move=api.step(dt);let yaw=move?Math.atan2(w.x-beforeX,w.y-beforeY):undefined;player.position.set(X(w.x),0,Z(w.y));anim(player,t/1000,move,yaw);crystal.rotation.y=t*.0015;crystal.position.y=2.36+Math.sin(t*.003)*.07;crystal.material.color.set(api.mood()>=70?'#70d0a0':api.mood()>=40?'#e9bc63':'#d96070').convertSRGBToLinear();
 npcs.forEach(({r,p,mark})=>{let n=api.npcPos(r,t),nx=X(n.x),nz=Z(n.y);p.position.set(nx,0,nz);anim(p,t/1000,n.walk,n.dir>0?Math.PI/2:-Math.PI/2);mark.rotation.y=t*.001;mark.visible=w.done[r.id]!==api.week()});
 pedestrians.forEach((p,i)=>{let a=(t*.012+i*210)%850,xx=a<=425?27+a:452-(a-425);p.position.set(X(xx),0,Z(i?168:137));anim(p,t/1000,true,a<=425?Math.PI/2:-Math.PI/2)});
 if(wide){pos.set(0,25,17);target.set(0,0,0)}else{pos.set(X(w.x),5.9,Z(w.y)+7.3);target.set(X(w.x),.95,Z(w.y)-.45)}let lerp=1-Math.exp(-dt*7);cam.position.lerp(pos,lerp);look.lerp(target,lerp);cam.lookAt(look);
 let loc=api.rooms.find(r=>w.x>=r.x&&w.x<=r.x+144&&w.y>=r.y&&w.y<=r.y+116)?.label||'CORREDOR CENTRAL';if(loc!==lastLabel){document.getElementById('worldLocation').textContent=loc;lastLabel=loc}let n=api.near(),label=n?'Interagir · '+n.npc:'';if(label!==lastNear){let el=document.getElementById('worldNear');el.textContent=label;el.classList.toggle('visible',!!n);lastNear=label}
 if(t-lastMini>200){document.getElementById('worldMini').innerHTML='<svg viewBox="0 0 480 304">'+api.rooms.map(r=>'<rect x="'+r.x+'" y="'+r.y+'" width="144" height="116" rx="7" fill="'+(w.done[r.id]===api.week()?'#8ed4b5':'#899bb9')+'"/>').join('')+'<circle cx="'+w.x+'" cy="'+w.y+'" r="12" fill="#e6bd63" stroke="#222b40" stroke-width="4"/></svg>';lastMini=t}
 try{renderer.render(scene,cam);if(canvas.getAttribute('data-render')!=='ready')canvas.setAttribute('data-render','ready')}catch(e){error('Falha de renderização 3D. Reinicie o cenário para recuperar a partida.');console.error(e);return}if((wasMoving&&!move)||(move&&t-lastSave>1500)){api.save();lastSave=t}wasMoving=move;state.frame=requestAnimationFrame(frame)
 }state.frame=requestAnimationFrame(frame);
 }catch(e){dispose();error('Falha ao iniciar o cenário 3D. Os módulos do jogo permanecem disponíveis.');console.error(e)}
}
window.Mundo3D={mount,avatar,clearPreview,dispose};
})();