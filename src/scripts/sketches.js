// Small looping sketches on the simulator cards.
import { CALM, cssVar } from './util.js';

(function(){
  var a=document.getElementById('mini-mri'), b=document.getElementById('mini-phys');
  function fit(c){var d=Math.min(window.devicePixelRatio||1,2);c.width=c.clientWidth*d;c.height=c.clientHeight*d;return d;}
  function drawMri(t){
    var d=fit(a),g=a.getContext('2d'),w=a.width,h=a.height;g.clearRect(0,0,w,h);
    var sets=[[.9,'#8A93A6',.4],[1.6,'#8A93A6',.7],[3.2,'#4D8DFF',1]];
    sets.forEach(function(s,k){
      g.beginPath();g.lineWidth=(k===2?2:1.2)*d;g.strokeStyle=s[1];g.globalAlpha=s[2];
      for(var x=0;x<=w;x+=2*d){var u=x/w*6, y=h/2-Math.exp(-u/s[0])*Math.cos(u*9-t*3)*(h*.36);x?g.lineTo(x,y):g.moveTo(x,y);}
      g.stroke();
    });
    g.globalAlpha=.5;g.setLineDash([4*d,6*d]);g.strokeStyle='#4D8DFF';g.lineWidth=d;g.beginPath();
    for(var x2=0;x2<=w;x2+=4*d){var u2=x2/w*6,y2=h/2-Math.exp(-u2/3.2)*(h*.36);x2?g.lineTo(x2,y2):g.moveTo(x2,y2);}
    g.stroke();g.setLineDash([]);g.globalAlpha=1;
  }
  function drawPhys(t){
    var d=fit(b),g=b.getContext('2d'),w=b.width,h=b.height;g.clearRect(0,0,w,h);
    var cx=w/2,cy=h/2,r=h*.34;
    g.strokeStyle='rgba(196,204,218,.35)';g.lineWidth=d;g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();
    for(var i=28;i>0;i--){var ta=t*1.4-i*.045;g.fillStyle='rgba(77,141,255,'+(.5*(1-i/28))+')';g.beginPath();g.arc(cx+Math.cos(ta)*r,cy+Math.sin(ta)*r,3*d,0,7);g.fill();}
    var th=t*1.4,x=cx+Math.cos(th)*r,y=cy+Math.sin(th)*r;
    function arrow(x1,y1,x2,y2,col){var an=Math.atan2(y2-y1,x2-x1),s=9*d;g.strokeStyle=g.fillStyle=col;g.lineWidth=1.1*d;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2-s*.8*Math.cos(an),y2-s*.8*Math.sin(an));g.stroke();
      g.beginPath();g.moveTo(x2,y2);g.lineTo(x2-s*Math.cos(an-.24),y2-s*Math.sin(an-.24));g.lineTo(x2-s*Math.cos(an+.24),y2-s*Math.sin(an+.24));g.closePath();g.fill();}
    arrow(x,y,x-Math.sin(th)*r*.62,y+Math.cos(th)*r*.62,'#F5F6F7');
    arrow(x,y,x-Math.cos(th)*r*.5,y-Math.sin(th)*r*.5,'#8A93A6');
    g.fillStyle='#4D8DFF';g.beginPath();g.arc(x,y,5*d,0,7);g.fill();
    g.fillStyle='rgba(243,245,249,.35)';g.beginPath();g.arc(cx,cy,2.5*d,0,7);g.fill();
  }
  // Only animate while the cards are on screen.
  var on=false, going=false;
  function loop(now){var t=now/1000;drawMri(t);drawPhys(t);if(!CALM&&on&&!document.hidden)requestAnimationFrame(loop);else going=false;}
  function go(){if(!going){going=true;requestAnimationFrame(loop);}}
  if(window.IntersectionObserver){var io=new IntersectionObserver(function(es){on=es.some(function(e){return e.isIntersecting;})||false;if(on)go();},{rootMargin:'200px'});io.observe(a);io.observe(b);}
  else{on=true;go();}
  document.addEventListener('visibilitychange',function(){if(on)go();});
  requestAnimationFrame(function(t){drawMri(t/1000);drawPhys(t/1000);});
  if(CALM)window.addEventListener('resize',function(){loop(1200);});
})();
