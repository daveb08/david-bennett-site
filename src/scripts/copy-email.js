// Copy the email address.
(function(){
  var b=document.getElementById('copymail'),m=document.getElementById('copymsg');if(!b)return;
  b.addEventListener('click',function(){
    var done=function(ok){b.classList.toggle('ok',ok);b.classList.toggle('err',!ok);m.textContent=ok?'Copied':'Could not copy, select the address';setTimeout(function(){b.classList.remove('ok','err');m.textContent='Copy email address';},2000);};
    try{navigator.clipboard.writeText('dgbenn@gmail.com').then(function(){done(true);},function(){done(false);});}catch(e){done(false);}
  });
})();
