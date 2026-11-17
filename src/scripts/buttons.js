// Button labels roll on hover.
Array.prototype.forEach.call(document.querySelectorAll('a.pill'),function(b){
  var n=b.lastChild;if(!n||n.nodeType!==3||!n.textContent.trim())return;
  var t=n.textContent.trim(),w=document.createElement('span'),i=document.createElement('span');
  w.className='lbl';w.setAttribute('data-t',t);i.textContent=t;w.appendChild(i);b.replaceChild(w,n);
});
