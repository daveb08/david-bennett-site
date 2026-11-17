// Scroll text highlight, entrance reveals and count-up numbers.
import { CALM, cssVar } from './util.js';

(function(){
  if(CALM)return;
  var p=document.querySelector('.statement p');
  if(p){
    var words=[];
    (function wrap(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var f=document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(t){
            if(!t)return;
            if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(t));return;}
            var sp=document.createElement('span');sp.className='w';sp.textContent=t;f.appendChild(sp);words.push(sp);
          });
          node.replaceChild(f,n);
        }else if(n.nodeType===1)wrap(n);
      });
    })(p);
    p.classList.add('dim');
    var upd=function(){
      var r=p.getBoundingClientRect(),vh=window.innerHeight||800;
      var prog=(vh*.82-r.top)/(r.height+vh*.28), k=Math.round(Math.max(0,Math.min(1,prog))*words.length);
      for(var i=0;i<words.length;i++)words[i].classList.toggle('on',i<k);
    };
    window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
  }
  if(window.IntersectionObserver){
    document.documentElement.classList.add('anim');
    var ro=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;ro.unobserve(e.target);var el=e.target;
      var sib=Array.prototype.filter.call(el.parentNode.children,function(c){return c.classList.contains('reveal');});
      var d=Math.min(sib.indexOf(el),5)*90;el.style.transitionDelay=d+'ms';el.classList.add('in');
      setTimeout(function(){el.style.transitionDelay='';},d+1200);
    });},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ro.observe(el);});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;io.unobserve(e.target);
      var el=e.target,to=parseFloat(el.getAttribute('data-to')),dec=(to%1)?1:0,t0=performance.now();
      (function f(now){var u=Math.min(1,(now-t0)/1400),v=1-Math.pow(1-u,4);el.textContent=(to*v).toFixed(dec);if(u<1)requestAnimationFrame(f);})(t0);
    });},{threshold:.6});
    document.querySelectorAll('[data-to]').forEach(function(el){io.observe(el);});
  }
})();
