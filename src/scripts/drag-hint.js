// "Drag to rotate" tag that follows the mouse over the 3D scene.
(function(){
  var fine=false;try{fine=matchMedia('(hover: hover) and (pointer: fine)').matches;}catch(e){}
  var cv=document.getElementById('bloch');
  if(!fine||!cv)return;
  var c=document.createElement('div');c.className='cur';c.setAttribute('aria-hidden','true');c.textContent='Drag to rotate';
  document.body.appendChild(c);
  var down=false;
  cv.addEventListener('pointermove',function(e){c.style.transform='translate3d('+e.clientX+'px,'+e.clientY+'px,0)';c.classList.toggle('show',!down);});
  cv.addEventListener('pointerdown',function(){down=true;c.classList.remove('show');});
  cv.addEventListener('pointerup',function(){down=false;});
  cv.addEventListener('pointerleave',function(){down=false;c.classList.remove('show');});
  window.addEventListener('scroll',function(){c.classList.remove('show');},{passive:true});
})();
