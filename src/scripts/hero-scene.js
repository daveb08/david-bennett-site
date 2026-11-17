// The 3D hero: one continuous line that shows four pieces of MRI physics.
// Loaded on demand by main.js so three.js never blocks the first paint.
import * as THREE from 'three';
import { CALM, cssVar } from './util.js';

(function(){
  var canvas=document.getElementById('bloch'), stage=document.getElementById('stage');
  var copyEl=document.getElementById('hero-copy'), barEl=document.getElementById('hero-bar');
  var trace=document.getElementById('trace'), tctx=trace.getContext('2d');
  var mzEl=document.getElementById('mz'), mxyEl=document.getElementById('mxy');
  var root0=document.documentElement;
  var C={ink:cssVar(root0,'--ink'),muted:cssVar(root0,'--muted'),line:cssVar(root0,'--line'),sig:cssVar(root0,'--signal'),cool:cssVar(root0,'--cool')};
  function fail(){stage.style.display='none';}
  var renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});}catch(e){fail();return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));

  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(30,1,0.1,50);camera.position.set(0,0,5.8);
  var holder=new THREE.Group();scene.add(holder);
  var root=new THREE.Group();holder.add(root);
  var frame=new THREE.Group();frame.rotation.x=-Math.PI/2;root.add(frame); // physics z points up
  var az=-0.65, el=0.3, px=0, py=0;

  var ADD=THREE.AdditiveBlending;
  var mGrid=new THREE.LineBasicMaterial({color:C.cool,transparent:true,opacity:.16});
  var mAxis=new THREE.LineBasicMaterial({color:C.muted,transparent:true,opacity:.55});
  var mM=new THREE.MeshBasicMaterial({color:C.sig});
  var mProj=new THREE.LineBasicMaterial({color:C.ink,transparent:true,opacity:.45});

  // One continuous line. Its home shape is the relaxation spiral: the path the tip of the
  // magnetization traces after a 90 degree pulse (same T1, T2 and frequency as the live arrow).
  var T1=5.5, T2=2.8, OMEGA=2*Math.PI*1.1, TMAX=15;
  var NP=3000, pp=new Float32Array(NP*3), tgt=new Float32Array(NP*3), from=new Float32Array(NP*3), delay=new Float32Array(NP);
  var coil=new Float32Array(NP*3), ksp=new Float32Array(NP*3), fid=new Float32Array(NP*3);
  for(var i=0;i<NP;i++){
    var u=i/(NP-1), t=u*TMAX, e2=Math.exp(-t/T2), a=OMEGA*t, j=i*3;
    tgt[j]=e2*Math.sin(a);tgt[j+1]=e2*Math.cos(a);tgt[j+2]=1-Math.exp(-t/T1);                  // Bloch solution after a 90 degree pulse: Mxy=exp(-t/T2), Mz=1-exp(-t/T1), precessing clockwise about +z as protons do
    from[j]=0;from[j+1]=0;from[j+2]=-1.15+2.3*u;delay[i]=u;                                    // starts as a straight line along B0
    var b=u*Math.PI*2*8;coil[j]=-.8+1.6*u;coil[j+1]=.62*Math.cos(b);coil[j+2]=.62*Math.sin(b); // solenoid RF coil, axis along x so its B1 field is perpendicular to B0 (z)
    var c=u*Math.PI*2*26,r=1.15*u;ksp[j]=r*Math.cos(c);ksp[j+1]=r*Math.sin(c);ksp[j+2]=0;        // Archimedean spiral k-space trajectory, centre out, equal spacing between turns
    var amp=Math.exp(-u*2.7),d=u*Math.PI*2*11;fid[j]=-1.15+2.3*u;fid[j+1]=amp*Math.cos(d)*.95;fid[j+2]=amp*Math.sin(d)*.95; // free induction decay: real and imaginary parts against time, exponential envelope
  }
  var intro=CALM?1:0, fade=1, swapped=true;pp.set(tgt);
  var shapes=[tgt,coil,ksp,fid], shape=0, mFrom=from, mTo=tgt, mT=CALM?1:0, mDur=3, introDone=CALM, hT=1, picked=false;
  var caps=["Magnetization relaxing after a 90 degree pulse: it precesses about the main field while the transverse part decays (T2) and the longitudinal part recovers (T1). Drag to rotate.",
    "A solenoid RF coil. Its axis lies across the main field, so the field it produces can tip the magnetization.",
    "A spiral trajectory through k-space: the path the gradients trace while the scanner collects the data for an image.",
    "The free induction decay: the real and imaginary parts of the signal plotted against time."];
  var tabs=document.querySelectorAll('#tabs .tab'), capEl=document.getElementById('cap'), hud=document.querySelector('.hud');
  function setShape(k){
    if(k===shape)return;
    mTo=shapes[k];mT=0;swapped=false;mDur=CALM?.01:2.4;shape=k;autoT=0;if(!picked)tabs[k].style.setProperty('--p',0);
    for(var i=0;i<tabs.length;i++)tabs[i].classList.toggle('on',i===k);
    capEl.textContent=caps[k];hud.classList.toggle('off',k!==0);
  }
  var autoT=0;
  Array.prototype.forEach.call(tabs,function(t){t.addEventListener('click',function(){picked=true;Array.prototype.forEach.call(tabs,function(x){x.style.setProperty('--p',1);});setShape(+t.getAttribute('data-k'));});});
  var posAttr=new THREE.BufferAttribute(pp,3);
  var pg=new THREE.BufferGeometry();pg.setAttribute('position',posAttr);if(!CALM)pg.setDrawRange(0,0);
  var mLine=new THREE.LineBasicMaterial({color:C.cool,transparent:true,opacity:.62});
  var mGhost=new THREE.LineBasicMaterial({color:C.sig,transparent:true,opacity:.2,blending:ADD,depthWrite:false});
  var main=new THREE.Line(pg,mLine);main.frustumCulled=false;frame.add(main);
  [1.014,.986].forEach(function(k){var l=new THREE.Line(pg,mGhost);l.scale.set(k,k,k);l.frustumCulled=false;frame.add(l);});
  // the part of the spiral the arrow has already travelled, drawn bright
  var litGeo=new THREE.BufferGeometry();litGeo.setAttribute('position',posAttr);litGeo.setDrawRange(0,0);
  var mTrail=new THREE.LineBasicMaterial({color:C.sig,transparent:true,opacity:1,blending:ADD,depthWrite:false});
  var lit=new THREE.Line(litGeo,mTrail);lit.frustumCulled=false;frame.add(lit);
  var lit2=new THREE.Line(litGeo,mTrail);lit2.scale.set(1.006,1.006,1.006);lit2.frustumCulled=false;frame.add(lit2);
  var since=-1;   // seconds since the last pulse finished
  function circle(plane){
    var pts=[];for(var i=0;i<=128;i++){var a=i/128*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
      pts.push(plane==='xy'?new THREE.Vector3(c,s,0):plane==='xz'?new THREE.Vector3(c,0,s):new THREE.Vector3(0,c,s));}
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mGrid);
  }
  frame.add(circle('xy'),circle('xz'),circle('yz'));
  function seg(a,b,mat){return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);}
  frame.add(seg(new THREE.Vector3(-1.18,0,0),new THREE.Vector3(1.18,0,0),mAxis));
  frame.add(seg(new THREE.Vector3(0,-1.18,0),new THREE.Vector3(0,1.18,0),mAxis));
  frame.add(seg(new THREE.Vector3(0,0,-1.18),new THREE.Vector3(0,0,1.2),mAxis));
  var b0tip=new THREE.Mesh(new THREE.ConeGeometry(.024,.12,32),new THREE.MeshBasicMaterial({color:C.cool}));
  b0tip.rotation.x=Math.PI/2;b0tip.position.set(0,0,1.26);frame.add(b0tip);

  var arrow=new THREE.Group();frame.add(arrow);
  var shaft=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,1,24),mM);
  var head=new THREE.Mesh(new THREE.ConeGeometry(.036,.17,40),mM);
  var tipGlow=new THREE.Mesh(new THREE.SphereGeometry(.06,24,16),new THREE.MeshBasicMaterial({color:C.sig,transparent:true,opacity:.16,blending:ADD,depthWrite:false}));
  arrow.add(shaft,head,tipGlow);
  var UP=new THREE.Vector3(0,1,0), dir=new THREE.Vector3();

  var projGeo=new THREE.BufferGeometry();projGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3));
  var proj=new THREE.Line(projGeo,mProj);proj.frustumCulled=false;frame.add(proj);

  var labels=[];
  function label(text,x,y,z,color){
    var sp=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false}));
    sp.position.set(x,y,z);sp.scale.set(.36,.18,1);sp.userData={text:text,color:color};frame.add(sp);labels.push(sp);return sp;
  }
  label('B₀',0,0,1.44,C.cool);label('x',1.3,0,0,C.muted);label('y',0,1.3,0,C.muted);
  var mLabel=label('M',0,0,0,C.sig);
  function paintLabels(){
    labels.forEach(function(sp){
      var c=document.createElement('canvas');c.width=128;c.height=64;var g=c.getContext('2d');
      g.font='500 38px "Manrope Variable", system-ui, sans-serif';g.textAlign='center';g.textBaseline='middle';
      g.fillStyle=sp.userData.color;g.fillText(sp.userData.text,64,34);
      if(sp.material.map)sp.material.map.dispose();
      sp.material.map=new THREE.CanvasTexture(c);sp.material.map.colorSpace=THREE.SRGBColorSpace;sp.material.needsUpdate=true;
    });
  }
  paintLabels();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(paintLabels);

  function size(){
    var w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    var halfH=Math.tan(15*Math.PI/180)*camera.position.z, ppu=h/(2*halfH);
    // large and centred: the model sits behind the headline and the buttons
    var s=Math.min(1.3,(h*.29)/ppu,(w*.44)/ppu), k=Math.min(1,.78/s);
    holder.scale.set(s,s,s);holder.position.x=0;
    holder.position.y=(h/2-h*(w>900?.6:.62))/ppu;
    shaft.scale.x=shaft.scale.z=k;head.scale.x=head.scale.z=k;tipGlow.scale.set(k,k,k);
    labels.forEach(function(sp){sp.scale.set(.36*k,.18*k,1);});
    var d=Math.min(window.devicePixelRatio||1,2);trace.width=trace.clientWidth*d;trace.height=trace.clientHeight*d;
  }
  if(window.ResizeObserver)new ResizeObserver(size).observe(stage);else window.addEventListener('resize',size);
  size();

  var drag=null;
  canvas.addEventListener('pointerdown',function(e){drag={x:e.clientX,y:e.clientY};try{canvas.setPointerCapture(e.pointerId);}catch(_){}});
  canvas.addEventListener('pointermove',function(e){if(!drag)return;az+=(e.clientX-drag.x)*.008;el=Math.max(-.25,Math.min(1.2,el+(e.clientY-drag.y)*.005));drag={x:e.clientX,y:e.clientY};});
  ['pointerup','pointercancel'].forEach(function(n){canvas.addEventListener(n,function(){drag=null;});});
  if(!CALM)window.addEventListener('pointermove',function(e){px=(e.clientX/window.innerWidth-.5);py=(e.clientY/window.innerHeight-.5);});

  // Bloch equations in a slightly off-resonance rotating frame
  var M=[0,0,1], pulse=0, RATE=(Math.PI/2)/0.5;
  var hist=[], HIST=300;
  function step(dt){
    if(pulse>0){var a=Math.min(pulse,RATE*dt);pulse-=a;var c=Math.cos(a),s=Math.sin(a),y=M[1],z=M[2];M[1]=y*c+z*s;M[2]=-y*s+z*c;
      if(pulse<=0){M=[0,1,0];since=0;}return;}   // lands on the start of the spiral
    if(since>=0)since+=dt;
    var p=OMEGA*dt,cp=Math.cos(p),sp=Math.sin(p),x=M[0],y2=M[1];
    M[0]=x*cp+y2*sp;M[1]=-x*sp+y2*cp;
    var e2=Math.exp(-dt/T2),e1=Math.exp(-dt/T1);
    M[0]*=e2;M[1]*=e2;M[2]=1-(1-M[2])*e1;
  }
  function drawTrace(){
    var w=trace.width,h=trace.height;if(!w)return;
    tctx.clearRect(0,0,w,h);
    tctx.strokeStyle=C.line;tctx.lineWidth=1;tctx.beginPath();tctx.moveTo(0,h/2);tctx.lineTo(w,h/2);tctx.stroke();
    if(hist.length<2)return;
    tctx.strokeStyle=C.sig;tctx.lineWidth=Math.max(1.5,h/26);tctx.lineJoin='round';tctx.beginPath();
    for(var i=0;i<hist.length;i++){var x=w-(hist.length-1-i)/HIST*w,y=h/2-hist[i]*(h/2-3);i?tctx.lineTo(x,y):tctx.moveTo(x,y);}
    tctx.stroke();
  }

  var last=performance.now(), acc=0, sx=0, sy=0, spin=0;
  // The loop only runs while the hero is on screen. On devices that cannot keep up (measured over
  // the first frames) it settles on a still frame and wakes for a few seconds when touched.
  var running=false, onScreen=true, lite=false, wake=0, slow=0, seen=0;
  function kick(ms){wake=performance.now()+(ms||0);if(!running){running=true;last=performance.now();requestAnimationFrame(tick);}}
  function tick(now){
    var raw=now-last, dt=Math.min(.05,raw/1000);last=now;
    if(!lite&&raw<1000){seen++;if(seen>3){slow+=raw;
      if(seen===15){if(slow/12>42){lite=true;
        if(mT<1){pp.set(mTo);posAttr.needsUpdate=true;swapped=true;mT=1;pg.setDrawRange(0,NP);fade=1;intro=1;introDone=true;}}
        seen=3;slow=0;}}}
    // Changing view: the old curve fades out, then the new one is traced from its start,
    // the way an instrument plots it. Nothing bends from one shape into another.
    if(mT<1){
      mT=Math.min(1,mT+dt/mDur);
      var u=introDone?(mT-.28)/.72:mT;
      if(u<0)fade=1-mT/.28;
      else{
        if(!swapped){pp.set(mTo);posAttr.needsUpdate=true;swapped=true;}
        var e=u<.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
        pg.setDrawRange(0,Math.max(2,Math.floor(e*NP)));fade=Math.min(1,u*5);
      }
      if(!introDone){intro=mT;spin+=(1-intro)*dt*1.4;if(mT>=1)introDone=true;}
      if(mT>=1){pg.setDrawRange(0,NP);fade=1;}
    }
    mLine.opacity=.62*fade;mGhost.opacity=.2*fade;
    // step through the views on a timer until the visitor picks one
    if(!CALM&&!picked&&introDone&&mT>=1&&!document.hidden&&(window.scrollY||0)<window.innerHeight*.6){
      var lim=shape===0?11:7;autoT+=dt;tabs[shape].style.setProperty('--p',Math.min(1,autoT/lim));
      if(autoT>=lim)setShape((shape+1)%shapes.length);
    }
    hT+=((shape===0?1:0)-hT)*Math.min(1,dt*5);
    var hv=hT*(introDone?1:Math.max(0,(intro-.45)/.55));
    mGrid.opacity=.16*hv;mAxis.opacity=.4*hv;mTrail.opacity=hv;mProj.opacity=.35*hv;
    litGeo.setDrawRange(0,(shape===0&&mT>=1&&since>=0)?Math.min(NP,Math.max(2,Math.round(since/TMAX*(NP-1))+1)):0);
    labels.forEach(function(sp){sp.material.opacity=hv;});b0tip.visible=hv>.3;
    step(dt);
    var len=Math.sqrt(M[0]*M[0]+M[1]*M[1]+M[2]*M[2]);
    arrow.visible=len>.04&&hv>.6;
    if(arrow.visible){
      dir.set(M[0]/len,M[1]/len,M[2]/len);arrow.quaternion.setFromUnitVectors(UP,dir);
      var sl=Math.max(.001,len-.17);shaft.scale.y=sl;shaft.position.y=sl/2;head.position.y=sl+.085;tipGlow.position.y=sl+.1;
    }
    mLabel.position.set(M[0]*1.2,M[1]*1.2,M[2]*1.2+(len<.3?.25:0));
    var mxy=Math.sqrt(M[0]*M[0]+M[1]*M[1]);
    var pa=projGeo.attributes.position.array;
    pa[0]=0;pa[1]=0;pa[2]=0;pa[3]=M[0];pa[4]=M[1];pa[5]=0;pa[6]=M[0];pa[7]=M[1];pa[8]=M[2];
    projGeo.attributes.position.needsUpdate=true;proj.visible=mxy>.03;
    if(!CALM&&introDone&&shape===0&&mT>=1&&pulse<=0&&mxy<.012&&M[2]>.93)pulse=Math.PI/2;   // fire again once it has relaxed
    sx+=(px-sx)*.05;sy+=(py-sy)*.05;
    var scroll=CALM?0:(window.scrollY||0)*.0009;
    camera.position.z=5.8-Math.min(1.6,scroll*1.6)+(1-intro)*(1-intro)*2.5;
    if(!drag&&!CALM)spin+=dt*.07;
    root.rotation.set(el+sy*.2,az+spin+sx*.4+scroll,0);
    renderer.render(scene,camera);drawTrace();
    if(document.hidden||!onScreen||(lite&&now>wake)){running=false;return;}
    requestAnimationFrame(tick);
  }
  kick();
  if(window.IntersectionObserver)new IntersectionObserver(function(es){onScreen=es[0].isIntersecting;if(onScreen)kick(lite?1200:0);}).observe(stage);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)kick(lite?1200:0);});
  canvas.addEventListener('pointerdown',function(){kick(4000);});
  canvas.addEventListener('pointermove',function(){if(drag)kick(4000);});
  Array.prototype.forEach.call(tabs,function(t){t.addEventListener('click',function(){kick(5000);});});
  if(!CALM)setTimeout(function(){pulse+=Math.PI/2;},3000);
})();
