// Small-screen menu.
(function(){
  var b=document.getElementById('burger'),n=document.getElementById('nav'),h=document.documentElement;if(!b||!n)return;
  function set(open){h.classList.toggle('menu-open',open);b.setAttribute('aria-expanded',open?'true':'false');b.setAttribute('aria-label',open?'Close menu':'Open menu');}
  b.addEventListener('click',function(){set(!h.classList.contains('menu-open'));});
  n.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('a'))set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
  window.addEventListener('resize',function(){if(window.innerWidth>1000)set(false);});
})();
