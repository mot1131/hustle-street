// Hustle Street 3D board. Loaded on demand by index.html; the game rules never depend on it.
import * as THREE from 'three';
import {RoomEnvironment} from './RoomEnvironment.js';
import {RoundedBoxGeometry} from './RoundedBoxGeometry.js';

export async function create(o){
 const {canvas,T,KIND,KCOL,WHITE,GCOL,IC,pos2cell,CORNERS,onTick,reduce}=o;
 const tileXZ=i=>{const [r,c]=pos2cell(i);return [c-3.5,r-5.5];};
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 const isMobile=matchMedia('(pointer:coarse)').matches;
 let DPR=Math.min(devicePixelRatio||1,2);renderer.setPixelRatio(DPR);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();const pmrem=new THREE.PMREMGenerator(renderer);
 scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.55;
 const camera=new THREE.PerspectiveCamera(30,1,.1,100);
 scene.add(new THREE.HemisphereLight(0xe8ecff,0x2b3a8c,.55));
 const key=new THREE.DirectionalLight(0xfff1dc,2.6);key.position.set(-4.5,11,6.5);key.castShadow=true;
 key.shadow.mapSize.set(isMobile?1024:2048,isMobile?1024:2048);Object.assign(key.shadow.camera,{left:-6.5,right:6.5,top:7.5,bottom:-7.5,near:2,far:30});
 key.shadow.bias=-.0004;key.shadow.normalBias=.025;key.shadow.radius=4;scene.add(key);
 const rim=new THREE.DirectionalLight(0x9fb4ff,.8);rim.position.set(5,6,-8);scene.add(rim);
 const maxAniso=renderer.capabilities.getMaxAnisotropy();

 /* ---------- printed artwork ---------- */
 const rr=(g,x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};
 const icon=(g,name,cx,cy,size,color,lw)=>{const p=new Path2D(IC[name]);g.save();g.translate(cx-size/2,cy-size/2);g.scale(size/24,size/24);g.strokeStyle=color;g.lineWidth=lw*24/size;g.lineCap='round';g.lineJoin='round';g.stroke(p);g.restore();};
 const CELL=256,BW=6*CELL,BH=10*CELL;
 function boardTexture(){const cv=document.createElement('canvas');cv.width=BW;cv.height=BH;const g=cv.getContext('2d');
  g.fillStyle='#1A1A2E';g.fillRect(0,0,BW,BH);const ix=CELL,iy=CELL,iw=4*CELL,ih=8*CELL;
  const grad=g.createRadialGradient(BW/2,BH*.45,60,BW/2,BH/2,ih*.7);grad.addColorStop(0,'#3A4BA8');grad.addColorStop(1,'#222E78');
  g.fillStyle=grad;rr(g,ix+10,iy+10,iw-20,ih-20,26);g.fill();
  g.save();rr(g,ix+10,iy+10,iw-20,ih-20,26);g.clip();g.fillStyle='rgba(255,255,255,.09)';
  for(let y=iy;y<iy+ih;y+=22)for(let x=ix+((y/22)%2?11:0);x<ix+iw;x+=22){g.beginPath();g.arc(x,y,2.2,0,7);g.fill();}g.restore();
  g.lineWidth=6;g.strokeStyle='rgba(255,255,255,.18)';rr(g,ix+26,iy+26,iw-52,ih-52,18);g.stroke();
  const sx=BW/2,sy=iy+250;g.save();g.translate(sx,sy);g.rotate(-.04);g.fillStyle='#10163A';rr(g,-330,-112,660,236,30);g.fill();
  g.fillStyle='#1E40AF';rr(g,-330,-124,660,236,30);g.fill();g.lineWidth=10;g.strokeStyle='#1A1A2E';g.stroke();
  g.lineWidth=5;g.strokeStyle='rgba(255,255,255,.75)';rr(g,-304,-98,608,184,20);g.stroke();
  g.textAlign='center';g.textBaseline='middle';g.font='120px "Lilita One"';g.fillStyle='#fff';g.fillText('HUSTLE',0,-44);g.fillStyle='#FFC53D';g.fillText('STREET',0,64);g.restore();
  g.textAlign='center';g.font='800 46px Nunito';g.fillStyle='rgba(255,255,255,.85)';g.fillText('Buy the suburbs. Live the life.',BW/2,iy+470);
  const dx=BW/2,dy=BH/2+CELL*2.95;g.setLineDash([22,16]);g.lineWidth=7;g.strokeStyle='rgba(255,255,255,.35)';rr(g,dx-170,dy-120,340,240,26);g.stroke();g.setLineDash([]);
  g.font='800 40px "Barlow Condensed"';g.fillStyle='rgba(255,255,255,.55)';g.fillText('LIFE CARDS',dx,dy+170);
  T.forEach((t,i)=>{const [r,c]=pos2cell(i);const x=(c-1)*CELL,y=(r-1)*CELL,pad=8,w=CELL-pad*2,corner=CORNERS.includes(i);
   if(t.k==='prop'){g.fillStyle='#fff';rr(g,x+pad,y+pad,w,w,22);g.fill();
    g.save();rr(g,x+pad,y+pad,w,w,22);g.clip();g.fillStyle=GCOL[t.g];g.fillRect(x,y,CELL,62);g.fillStyle='rgba(0,0,0,.14)';g.fillRect(x,y+62,CELL,6);g.restore();
    g.fillStyle='#1A1A2E';g.textAlign='center';g.textBaseline='alphabetic';const lines=t.n.split('\n');const fs=lines.length>1?48:(t.n.length>9?44:52);
    g.font=`800 ${fs}px "Barlow Condensed"`;lines.forEach((l,k)=>g.fillText(l.toUpperCase(),x+CELL/2,y+(lines.length>1?128:146)+k*(fs+4)));
    g.font='800 40px "Barlow Condensed"';g.fillStyle='#3E4462';g.fillText('$'+t.p+'K',x+CELL/2,y+CELL-28);}
   else{const col=KCOL[t.k]||'#fff';g.fillStyle=col;rr(g,x+pad,y+pad,w,w,22);g.fill();const ink=WHITE[t.k]?'#fff':'#1A1A2E';const sz=corner?104:88;
    g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(x+CELL/2,y+CELL/2-22,sz*.72,0,7);g.fill();
    icon(g,KIND[t.k].i,x+CELL/2,y+CELL/2-22,sz,ink,corner?9:8.5);g.fillStyle=ink;g.textAlign='center';g.font=`800 ${corner?44:40}px "Barlow Condensed"`;g.fillText(KIND[t.k].l,x+CELL/2,y+CELL-34);}
   g.lineWidth=7;g.strokeStyle='#1A1A2E';rr(g,x+pad,y+pad,w,w,22);g.stroke();});
  const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=maxAniso;return tex;}
 function numTex(n){const cv=document.createElement('canvas');cv.width=cv.height=128;const g=cv.getContext('2d');g.textAlign='center';g.textBaseline='middle';g.font='92px "Lilita One"';
  g.lineWidth=12;g.strokeStyle='rgba(26,26,46,.9)';g.strokeText(String(n),64,70);g.fillStyle='#fff';g.fillText(String(n),64,70);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;return t;}
 function cardBack(){const cv=document.createElement('canvas');cv.width=512;cv.height=720;const g=cv.getContext('2d');
  g.fillStyle='#FFC53D';rr(g,0,0,512,720,48);g.fill();g.lineWidth=14;g.strokeStyle='#1A1A2E';rr(g,7,7,498,706,42);g.stroke();g.fillStyle='#fff';rr(g,40,40,432,640,30);g.fill();g.lineWidth=8;g.stroke();
  g.save();rr(g,44,44,424,632,28);g.clip();for(let k=0;k<24;k++){g.fillStyle=k%2?'#FFE08A':'#FFF1C7';g.beginPath();g.moveTo(256,360);g.arc(256,360,600,k/24*Math.PI*2,(k+1)/24*Math.PI*2);g.fill();}g.restore();
  g.fillStyle='#fff';g.beginPath();g.arc(256,330,110,0,7);g.fill();g.lineWidth=10;g.stroke();g.textAlign='center';g.textBaseline='middle';g.fillStyle='#1A1A2E';g.font='150px "Lilita One"';g.fillText('?',256,338);g.font='86px "Lilita One"';g.fillText('LIFE',256,560);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=maxAniso;return t;}

 /* ---------- shaders ---------- */
 const vs=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
 const glowMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uColor:{value:new THREE.Color('#FFC53D')},uAlpha:{value:0}},vertexShader:vs,
  fragmentShader:`varying vec2 vUv;uniform float uTime;uniform vec3 uColor;uniform float uAlpha;
  float sdRound(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
  void main(){vec2 p=vUv*2.-1.;float d=sdRound(p,vec2(.62),.2);float ring=exp(-pow(max(d,0.)*5.,1.4))*(.55+.45*sin(uTime*4.));
   float edge=smoothstep(.06,0.,abs(d))*.9;float sweep=pow(max(0.,sin(atan(p.y,p.x)*2.-uTime*3.)),12.)*smoothstep(.12,0.,abs(d));
   float a=(ring*.8+edge+sweep*.9)*uAlpha*smoothstep(1.,.75,length(p)*.75);gl_FragColor=vec4(uColor*a,a);}`});
 const rippleMat=()=>new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uT:{value:0},uColor:{value:new THREE.Color('#fff')}},vertexShader:vs,
  fragmentShader:`varying vec2 vUv;uniform float uT;uniform vec3 uColor;void main(){float r=length(vUv*2.-1.);float w=.06+.1*uT;float ring=smoothstep(w,0.,abs(r-uT*.95));float a=ring*(1.-uT)*(1.-uT)*1.4;gl_FragColor=vec4(uColor*a,a);}`});
 const sheenTime={value:0};
 const sheen=mat=>{mat.onBeforeCompile=sh=>{sh.uniforms.uTime=sheenTime;
  sh.vertexShader='varying vec2 vUvSheen;\n'+sh.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nvUvSheen=(modelMatrix*vec4(position,1.)).xz;');
  sh.fragmentShader='uniform float uTime;\nvarying vec2 vUvSheen;\n'+sh.fragmentShader.replace('#include <dithering_fragment>',`#include <dithering_fragment>
  float band=smoothstep(.0,.5,1.-abs(fract(vUvSheen.x*.35+vUvSheen.y*.18-uTime*.04)*2.-1.));gl_FragColor.rgb+=pow(band,18.)*.035;`);};return mat;};

 /* ---------- board ---------- */
 const TILE_H=.11;const world=new THREE.Group();scene.add(world);const tex=boardTexture();
 const sc=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({opacity:.32}));sc.rotation.x=-Math.PI/2;sc.position.y=-.32;sc.receiveShadow=true;world.add(sc);
 const slab=new THREE.Mesh(new RoundedBoxGeometry(6.42,.3,10.42,5,.12),new THREE.MeshPhysicalMaterial({color:'#1B2466',roughness:.5,clearcoat:.6,clearcoatRoughness:.3}));slab.position.y=-.16;slab.castShadow=true;slab.receiveShadow=true;world.add(slab);
 const trim=new THREE.Mesh(new RoundedBoxGeometry(6.2,.04,10.2,3,.02),new THREE.MeshStandardMaterial({color:'#FFC53D',metalness:.85,roughness:.28}));trim.position.y=-.035;world.add(trim);
 const top=new THREE.Mesh(new THREE.PlaneGeometry(6,10),sheen(new THREE.MeshPhysicalMaterial({map:tex,roughness:.48,clearcoat:.55,clearcoatRoughness:.22})));top.rotation.x=-Math.PI/2;top.position.y=.001;top.receiveShadow=true;world.add(top);
 const tileMat=sheen(new THREE.MeshPhysicalMaterial({map:tex,roughness:.42,clearcoat:.7,clearcoatRoughness:.18}));
 T.forEach((t,i)=>{const [x,z]=tileXZ(i);const geo=new RoundedBoxGeometry(.94,TILE_H,.94,4,.045);const pos=geo.attributes.position,uv=geo.attributes.uv;
  for(let k=0;k<pos.count;k++){const wx=pos.getX(k)+x,wz=pos.getZ(k)+z;const cx=Math.max(x-.44,Math.min(x+.44,wx)),cz=Math.max(z-.44,Math.min(z+.44,wz));uv.setXY(k,(cx+3)/6,1-(cz+5)/10);}
  const m=new THREE.Mesh(geo,tileMat);m.position.set(x,TILE_H/2,z);m.castShadow=true;m.receiveShadow=true;world.add(m);});

 /* ---------- wheel ---------- */
 const W={group:new THREE.Group(),spin:new THREE.Group(),angle:0,flap:null,flapAng:0,flapVel:0,lastPeg:null,prev:0};const WR=1.25;
 const WCOL=['#FFC53D','#FF7EB6','#2BB673','#2F6FE0','#A98BFF','#FFC53D','#FF7EB6','#2BB673','#2F6FE0','#D63A3A'];
 W.group.position.set(0,0,.25);world.add(W.group);
 {const ped=new THREE.Mesh(new THREE.CylinderGeometry(.5,.62,.14,48),new THREE.MeshPhysicalMaterial({color:'#10163A',roughness:.4,clearcoat:.5}));ped.position.y=.07;ped.castShadow=true;ped.receiveShadow=true;W.group.add(ped);
  W.spin.position.y=.2;W.group.add(W.spin);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(WR+.06,WR+.1,.12,96),new THREE.MeshPhysicalMaterial({color:'#1A1A2E',roughness:.35,clearcoat:.8}));body.castShadow=true;body.receiveShadow=true;W.spin.add(body);
  const pegMat=new THREE.MeshStandardMaterial({color:'#FFE08A',metalness:.9,roughness:.2});
  for(let k=0;k<10;k++){const seg=new THREE.Mesh(new THREE.CircleGeometry(WR-.02,24,k*Math.PI/5+.012,Math.PI/5-.024),new THREE.MeshPhysicalMaterial({color:WCOL[k],roughness:.32,clearcoat:1,clearcoatRoughness:.1}));
   seg.rotation.x=-Math.PI/2;seg.position.y=.062;seg.receiveShadow=true;W.spin.add(seg);const a=k*Math.PI/5+Math.PI/10;
   const num=new THREE.Mesh(new THREE.PlaneGeometry(.36,.36),new THREE.MeshBasicMaterial({map:numTex(k+1),transparent:true,toneMapped:false}));num.rotation.x=-Math.PI/2;num.rotation.z=a-Math.PI/2;num.position.set(Math.cos(a)*WR*.74,.066,-Math.sin(a)*WR*.74);W.spin.add(num);
   const pa=k*Math.PI/5;const peg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.1,16),pegMat);peg.position.set(Math.cos(pa)*WR,.11,-Math.sin(pa)*WR);peg.castShadow=true;W.spin.add(peg);}
  const rimG=new THREE.Mesh(new THREE.TorusGeometry(WR+.04,.035,16,128),new THREE.MeshStandardMaterial({color:'#FFC53D',metalness:.9,roughness:.22}));rimG.rotation.x=Math.PI/2;rimG.position.y=.065;W.spin.add(rimG);
  const hub=new THREE.Mesh(new THREE.SphereGeometry(.2,40,20,0,Math.PI*2,0,Math.PI/2),new THREE.MeshPhysicalMaterial({color:'#FFC53D',roughness:.18,clearcoat:1,metalness:.2}));hub.position.y=.062;hub.castShadow=true;W.spin.add(hub);
  const fsh=new THREE.Shape();fsh.moveTo(0,-.12);fsh.lineTo(.09,.1);fsh.quadraticCurveTo(0,.17,-.09,.1);fsh.closePath();
  const fg=new THREE.ExtrudeGeometry(fsh,{depth:.05,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:3});fg.translate(0,.12,0);
  const flap=new THREE.Mesh(fg,new THREE.MeshPhysicalMaterial({color:'#fff',roughness:.2,clearcoat:1}));flap.rotation.x=-Math.PI/2;flap.castShadow=true;
  const fp=new THREE.Group();fp.position.set(0,.32,-(WR+.32));fp.add(flap);W.group.add(fp);W.flap=fp;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.32,16),new THREE.MeshStandardMaterial({color:'#FFC53D',metalness:.85,roughness:.25}));post.position.set(0,.16,-(WR+.32));post.castShadow=true;W.group.add(post);}

 /* ---------- life deck (decor) ---------- */
 {const g=new THREE.Group();g.position.set(0,0,2.95);world.add(g);const back=cardBack();const edge=new THREE.MeshPhysicalMaterial({color:'#FFE9A8',roughness:.6});const face=new THREE.MeshPhysicalMaterial({map:back,roughness:.4,clearcoat:.6});
  for(let k=0;k<6;k++){const c=new THREE.Mesh(new RoundedBoxGeometry(.62,.025,.88,2,.012),[edge,edge,face,edge,edge,edge]);c.position.set((Math.random()-.5)*.02,.013+k*.027,(Math.random()-.5)*.02);c.rotation.y=(Math.random()-.5)*.06;c.castShadow=true;c.receiveShadow=true;g.add(c);}}

 /* ---------- pawns, houses, markers ---------- */
 const pts=[[0,0],[.19,0],[.2,.025],[.19,.05],[.15,.075],[.12,.11],[.095,.2],[.082,.28],[.11,.3],[.112,.315],[.075,.335]].map(([x,y])=>new THREE.Vector2(x,y));
 const bodyG=new THREE.LatheGeometry(pts,48),headG=new THREE.SphereGeometry(.105,40,28);headG.translate(0,.42,0);const ringG=new THREE.TorusGeometry(.19,.012,10,48);const ringM=new THREE.MeshStandardMaterial({color:'#1A1A2E',roughness:.6});
 const PS=1.3;const pawns=[];
 function pawn(i){if(pawns[i])return pawns[i];const mat=new THREE.MeshPhysicalMaterial({color:'#fff',roughness:.22,clearcoat:1,clearcoatRoughness:.08,sheen:.3,sheenColor:new THREE.Color('#fff')});
  const g=new THREE.Group(),inner=new THREE.Group();inner.scale.setScalar(PS);g.add(inner);[bodyG,headG].forEach(geo=>{const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;inner.add(m);});
  const ring=new THREE.Mesh(ringG,ringM);ring.rotation.x=Math.PI/2;ring.position.y=.012;inner.add(ring);g.visible=false;world.add(g);
  return pawns[i]={g,inner,mat,pos:-1,hop:false,squash:0,target:new THREE.Vector3(),color:'',placed:false};}
 const houseMat=new THREE.MeshPhysicalMaterial({color:'#2BB673',roughness:.3,clearcoat:.8,clearcoatRoughness:.15});
 const hotelMat=new THREE.MeshPhysicalMaterial({color:'#E11D48',roughness:.3,clearcoat:.8,clearcoatRoughness:.15});
 const roofMat=new THREE.MeshPhysicalMaterial({color:'#1A1A2E',roughness:.45,clearcoat:.5});
 function houseMesh(hotel){const g=new THREE.Group();const w=hotel?.34:.17,h=hotel?.16:.13,d=hotel?.17:.15;
  const base=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,.02),hotel?hotelMat:houseMat);base.position.y=h/2;
  const sh=new THREE.Shape();sh.moveTo(-w/2-.02,0);sh.lineTo(w/2+.02,0);sh.lineTo(0,hotel?.1:.09);sh.closePath();
  const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:d+.03,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2}),roofMat);roof.position.set(0,h,-(d+.03)/2);
  [base,roof].forEach(m=>{m.castShadow=true;m.receiveShadow=true;g.add(m);});return g;}
 const markerG=new THREE.CylinderGeometry(.1,.1,.045,32);
 const props={};// tile -> {owner,level,color,marker,houses}

 /* ---------- coins, glow, ripples ---------- */
 const COINS=60;const coinMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.075,.075,.022,28),new THREE.MeshStandardMaterial({color:'#FFC53D',metalness:1,roughness:.22,emissive:'#3a2600',emissiveIntensity:.25}),COINS);
 coinMesh.castShadow=true;coinMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(coinMesh);const coinsA=[];for(let k=0;k<COINS;k++)coinsA.push({life:0});
 const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),S3=new THREE.Vector3(),P=new THREE.Vector3(),ZERO=new THREE.Matrix4().makeScale(0,0,0);
 for(let k=0;k<COINS;k++)coinMesh.setMatrixAt(k,ZERO);
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.5),glowMat);glow.rotation.x=-Math.PI/2;glow.renderOrder=2;glow.position.y=TILE_H+.006;scene.add(glow);let glowWant=0;
 const ripples=[];

 /* ---------- tweens + loop ---------- */
 const tweens=[];const tw=(dur,fn,delay=0)=>new Promise(r=>tweens.push({t:-delay,dur,fn,done:r}));
 const easeInOut=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;const easeOutBack=t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);};
 const easeOutElastic=t=>t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-.75)*(2*Math.PI)/3)+1;
 const clock=new THREE.Clock();let frameN=0,alive=true,fpsF=0,fpsA=0,slow=0;
 function slotOf(i){const same=pawns.map((p,j)=>({p,j})).filter(x=>x.p&&x.p.g.visible&&!x.p.hop&&x.p.pos===pawns[i].pos);const n=same.length,idx=same.findIndex(x=>x.j===i);
  const [x,z]=tileXZ(pawns[i].pos);let ox=0,oz=0;if(n>1){const a=idx/n*Math.PI*2+Math.PI/4;const r=n>3?.25:.22;ox=Math.cos(a)*r;oz=Math.sin(a)*r;}
  if(T[pawns[i].pos].k==='prop')oz+=n>1?.08:.13;return P.set(x+ox,TILE_H,z+oz).clone();}
 function busyNow(){return tweens.length||ripples.length||coinsA.some(c=>c.life>0)||pawns.some(p=>p&&p.hop)||Math.abs(W.flapAng)>.002;}
 function frame(){if(!alive)return;requestAnimationFrame(frame);
  if(!canvas.getClientRects().length)return;frameN++;
  const dtRaw=clock.getDelta();const dt=Math.min(dtRaw,1/20);const time=clock.elapsedTime;
  const busy=busyNow();if(!busy&&frameN%2)return;// idle: half rate to save battery
  for(let k=tweens.length-1;k>=0;k--){const w=tweens[k];w.t+=busy?dt:dt*2;if(w.t<0)continue;const t=Math.min(1,w.t/w.dur);w.fn(t);if(t>=1){tweens.splice(k,1);w.done();}}
  const seg=Math.PI/5;const pegIdx=Math.floor((Math.PI/2-W.angle)/seg);if(W.lastPeg==null)W.lastPeg=pegIdx;
  if(pegIdx!==W.lastPeg){W.lastPeg=pegIdx;onTick&&onTick();W.flapVel+=(W.angle>W.prev?-1:1)*14;}
  W.flapVel+=(-W.flapAng*260-W.flapVel*16)*dt;W.flapAng=Math.max(-.7,Math.min(.7,W.flapAng+W.flapVel*dt));W.flap.rotation.y=W.flapAng;W.prev=W.angle;W.spin.rotation.y=W.angle;
  const k1=1-Math.pow(.0005,dt*(busy?1:2));
  pawns.forEach((p,i)=>{if(!p||!p.g.visible)return;if(!p.hop){p.g.position.lerp(p.target,1-Math.pow(.002,dt*(busy?1:2)));p.squash*=Math.pow(.0005,dt);
   const s=1-p.squash*Math.cos(time*30)*.6,br=1+Math.sin(time*2+i*1.7)*.012;p.inner.scale.set(PS/Math.sqrt(s),PS*s*br,PS/Math.sqrt(s));}});
  glowMat.uniforms.uAlpha.value+=(glowWant-glowMat.uniforms.uAlpha.value)*k1;glowMat.uniforms.uTime.value=time;sheenTime.value=time;
  for(let k=ripples.length-1;k>=0;k--){const r=ripples[k];r.t+=dt/.8;r.m.material.uniforms.uT.value=Math.min(1,r.t);if(r.t>=1){scene.remove(r.m);r.m.material.dispose();ripples.splice(k,1);}}
  let anyCoin=false;for(let k=0;k<COINS;k++){const c=coinsA[k];if(c.life<=0)continue;anyCoin=true;if(c.delay>0){c.delay-=dt;coinMesh.setMatrixAt(k,ZERO);continue;}
   c.age+=dt;const t=Math.min(1,c.age/c.dur);
   if(c.to){const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;c.p.lerpVectors(c.start,c.to,e);c.p.y+=Math.sin(t*Math.PI)*1.6;}
   else{c.v.y-=9.8*dt;c.p.addScaledVector(c.v,dt);if(c.p.y<TILE_H+.02){c.p.y=TILE_H+.02;c.v.y*=-.35;c.v.x*=.6;c.v.z*=.6;c.rv.multiplyScalar(.7);}}
   c.r.addScaledVector(c.rv,dt);E.set(c.r.x,c.r.y,0);Q.setFromEuler(E);const s=t>.8?(1-t)/.2:Math.min(1,c.age*8);S3.set(s,s,s);M.compose(c.p,Q,S3);coinMesh.setMatrixAt(k,M);
   if(t>=1){c.life=0;coinMesh.setMatrixAt(k,ZERO);}}
  if(anyCoin||coinMesh.userData.dirty){coinMesh.instanceMatrix.needsUpdate=true;coinMesh.userData.dirty=anyCoin;}
  renderer.render(scene,camera);
  fpsF++;fpsA+=dtRaw;if(fpsA>=1.5){const fps=fpsF/fpsA;if(busy&&fps<42&&DPR>1){if(++slow>=2){DPR=Math.max(1,DPR-.25);renderer.setPixelRatio(DPR);resize();slow=0;}}else slow=0;fpsF=0;fpsA=0;}}

 /* ---------- camera fit ---------- */
 const tgt=new THREE.Vector3(0,0,.3);const EL=1.02;
 const corners=[];for(const x of [-3.25,3.25])for(const z of [-5.25,5.25])for(const y of [-.3,.55])corners.push(new THREE.Vector3(x,y,z));
 const place=d=>{camera.position.set(tgt.x,tgt.y+Math.sin(EL)*d,tgt.z+Math.cos(EL)*d);camera.lookAt(tgt);camera.updateMatrixWorld();};
 let layoutCb=null,cw=0,ch=0;
 function resize(){const r=canvas.parentElement.getBoundingClientRect();cw=Math.max(1,r.width);ch=Math.max(1,r.height);renderer.setSize(cw,ch,false);camera.aspect=cw/ch;camera.updateProjectionMatrix();
  let lo=5,hi=60;for(let it=0;it<28;it++){const d=(lo+hi)/2;place(d);let ok=true;for(const c of corners){const p=c.clone().project(camera);if(Math.abs(p.x)>.985||Math.abs(p.y)>.985){ok=false;break;}}if(ok)hi=d;else lo=d;}
  place(hi);renderer.render(scene,camera);layoutCb&&layoutCb();}
 const ro=new ResizeObserver(()=>resize());ro.observe(canvas.parentElement);
 const proj=(x,y,z)=>{const p=new THREE.Vector3(x,y,z).project(camera);return [(p.x+1)/2*cw,(1-p.y)/2*ch];};
 function tileRect(i){const [x,z]=tileXZ(i);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const dx of [-.47,.47])for(const dz of [-.47,.47]){const [sx,sy]=proj(x+dx,TILE_H,z+dz);x0=Math.min(x0,sx);y0=Math.min(y0,sy);x1=Math.max(x1,sx);y1=Math.max(y1,sy);}return {x:x0,y:y0,w:x1-x0,h:y1-y0};}
 function wheelRect(){const [cx,cy]=proj(0,.3,.25);return {x:cx-30,y:cy-30,w:60,h:60};}

 /* ---------- public API ---------- */
 function sync(players,owned,glowAt){
  players.forEach((pl,i)=>{const p=pawn(i);if(p.color!==pl.color){p.color=pl.color;p.mat.color.set(pl.color);}
   const show=!pl.retired&&!pl.hidden;if(p.hop)return;
   if(!show){p.g.visible=false;return;}p.pos=pl.pos;
   if(!p.g.visible){p.g.visible=true;p.placed=false;}});
  for(let i=players.length;i<pawns.length;i++)if(pawns[i])pawns[i].g.visible=false;
  pawns.forEach((p,i)=>{if(!p||!p.g.visible||p.hop)return;p.target.copy(slotOf(i));if(!p.placed){p.g.position.copy(p.target);p.placed=true;}});
  // ownership + houses
  const seen=new Set();
  for(const k in owned){const o=owned[k];seen.add(String(k));const t=Number(k);const [x,z]=tileXZ(t);let pr=props[k];
   if(!pr){pr=props[k]={owner:o.owner,level:0,color:o.color,marker:new THREE.Mesh(markerG,new THREE.MeshPhysicalMaterial({color:o.color,roughness:.25,clearcoat:1})),houses:null};
    pr.marker.castShadow=true;pr.marker.position.set(x+.33,TILE_H+.02,z+.33);world.add(pr.marker);const mk=pr.marker;mk.scale.setScalar(.001);tw(.55,e=>mk.scale.setScalar(Math.max(.001,easeOutElastic(e))));}
   if(pr.color!==o.color){pr.color=o.color;pr.marker.material.color.set(o.color);pr.owner=o.owner;}
   const lv=o.level||0;if(lv!==pr.level){const old=pr.houses;if(old){tw(.18,e=>old.scale.setScalar(Math.max(.001,1-e))).then(()=>world.remove(old));}
    pr.houses=null;if(lv>0){const g=new THREE.Group();const n=lv===3?1:lv;for(let j=0;j<n;j++){const h=houseMesh(lv===3);h.position.x=n>1?(j-.5)*.22:0;g.add(h);}
     g.position.set(x,TILE_H,z-.28);g.scale.setScalar(.001);world.add(g);pr.houses=g;const grow=lv>pr.level;
     tw(grow?.7:.3,e=>{g.scale.setScalar(Math.max(.001,grow?easeOutElastic(e):e));if(grow)g.position.y=TILE_H+(1-Math.min(1,e*2.2))*.9;},grow?.15:0);}
    pr.level=lv;}}
  for(const k in props)if(!seen.has(k)){const pr=props[k];delete props[k];[pr.marker,pr.houses].forEach(m=>{if(!m)return;tw(.3,e=>m.scale.setScalar(Math.max(.001,1-e))).then(()=>world.remove(m));});}
  if(glowAt){glowWant=1;glowMat.uniforms.uColor.value.set(glowAt.color);const [x,z]=tileXZ(glowAt.tile);glow.position.x=x;glow.position.z=z;}else glowWant=0;}
 function setWheel(n){W.angle=n?(90-((n-1)*36+18))*Math.PI/180:0;W.lastPeg=null;}
 function spin(n){if(reduce&&reduce()){setWheel(n);return Promise.resolve();}
  const want=(n-1)*36+18+(Math.random()-.5)*22;const cur=W.angle*180/Math.PI;let to=90-want;while(to<cur+360*4)to+=360;const from=W.angle,toR=to*Math.PI/180;
  return tw(2.7,t=>{W.angle=from+(toR-from)*(1-Math.pow(1-t,4));});}
 async function hop(i,start,path,onStep){const p=pawn(i);p.g.visible=true;p.hop=true;p.pos=start;
  const from=slotOf(i);p.g.position.copy(from);
  for(let s=0;s<path.length;s++){const a=p.g.position.clone();p.pos=path[s];const [bx,bz]=tileXZ(p.pos);const b=new THREE.Vector3(bx,TILE_H,bz);const last=s===path.length-1;
   const dur=(path.length>7?.2:.24)+(last?.08:0);const dir=Math.atan2(b.x-a.x,b.z-a.z);
   await tw(dur,t=>{p.g.position.lerpVectors(a,b,easeInOut(t));p.g.position.y=TILE_H+Math.sin(t*Math.PI)*(last?.6:.42);
    const st=t<.15?1-t/.15*.18:1+Math.sin(t*Math.PI)*.12;p.inner.scale.set(PS/Math.sqrt(st),PS*st,PS/Math.sqrt(st));
    p.inner.rotation.x=Math.sin(t*Math.PI*2)*.12*Math.cos(dir);p.inner.rotation.z=-Math.sin(t*Math.PI*2)*.12*Math.sin(dir);});
   p.squash=last?.32:.16;onStep&&onStep(s,p.pos);}
  p.inner.rotation.set(0,0,0);p.hop=false;const [x,z]=tileXZ(p.pos);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),rippleMat());m.material.uniforms.uColor.value.set(p.color||'#fff');m.rotation.x=-Math.PI/2;m.position.set(x,TILE_H+.01,z);m.renderOrder=3;scene.add(m);ripples.push({m,t:0});
  pawns.forEach((q,j)=>{if(q&&q.g.visible&&!q.hop)q.target.copy(slotOf(j));});}
 function coins(tile,n,toIdx){const [x,z]=tileXZ(tile);const from=new THREE.Vector3(x,TILE_H+.15,z);const to=toIdx!=null&&pawns[toIdx]&&pawns[toIdx].g.visible?pawns[toIdx].g.position.clone().add(new THREE.Vector3(0,.45,0)):null;
  let made=0;for(const c of coinsA){if(made>=n)break;if(c.life>0)continue;made++;c.life=1;c.age=0;c.dur=to?1.05+Math.random()*.25:1.1+Math.random()*.5;c.p=from.clone();c.start=from.clone();c.to=to;c.delay=made*.04;
   const a=Math.random()*Math.PI*2,s=1.2+Math.random()*1.4;c.v=new THREE.Vector3(Math.cos(a)*s*.5,3.4+Math.random()*1.6,Math.sin(a)*s*.5);c.r=new THREE.Vector3(Math.random()*6,Math.random()*6,0);c.rv=new THREE.Vector3(8+Math.random()*8,4+Math.random()*6,0);}}
 resize();renderer.compile(scene,camera);requestAnimationFrame(frame);
 return {sync,spin,setWheel,hop,coins,tileRect,wheelRect,resize,onLayout:cb=>{layoutCb=cb;cb();},
  dispose(){alive=false;ro.disconnect();renderer.dispose();}};
}
