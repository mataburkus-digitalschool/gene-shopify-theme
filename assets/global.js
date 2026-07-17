(function(){
  var money=function(cents){
    var f=window.moneyFormat||'${{amount}}';
    var v=(cents/100).toFixed(2);
    return f.replace(/\{\{\s*amount\s*\}\}/,v).replace(/\{\{\s*amount_no_decimals\s*\}\}/,Math.round(cents/100));
  };
  var byId=function(id){return document.getElementById(id)};

  /* ---- Cart drawer ---- */
  function openCart(){document.body.classList.add('cart-open')}
  function closeCart(){document.body.classList.remove('cart-open')}
  window.geneOpenCart=openCart;

  function renderCart(cart){
    var count=cart.item_count;
    document.querySelectorAll('[data-cart-count]').forEach(function(e){e.textContent=count});
    var itemsEl=byId('geneDrawerItems'), footEl=byId('geneDrawerFoot'), emptyEl=byId('geneDrawerEmpty'), shipEl=byId('geneShip');
    if(!itemsEl)return;
    if(count===0){
      itemsEl.innerHTML='';itemsEl.style.display='none';
      if(footEl)footEl.style.display='none';if(shipEl)shipEl.style.display='none';
      if(emptyEl)emptyEl.style.display='flex';
      return;
    }
    if(emptyEl)emptyEl.style.display='none';
    itemsEl.style.display='block';
    if(footEl)footEl.style.display='block';
    itemsEl.innerHTML=cart.items.map(function(it){
      var opts=(it.options_with_values||[]).map(function(o){return o.value}).join(' / ');
      return '<div class="gene-ci"><img src="'+(it.image?it.image.replace(/(\.[a-z]+)(\?|$)/,'_200x$1$2'):'')+'" alt=""><div style="flex:1;min-width:0"><div class="gene-ci__t">'+it.product_title+'</div><div class="gene-ci__v">'+(opts||'')+'</div><div style="display:flex;align-items:center;gap:10px"><div class="gene-qty"><button data-key="'+it.key+'" data-q="'+(it.quantity-1)+'">\u2212</button><span>'+it.quantity+'</span><button data-key="'+it.key+'" data-q="'+(it.quantity+1)+'">+</button></div><span class="gene-ci__price">'+money(it.final_line_price)+'</span></div></div></div>';
    }).join('');
    var subEl=byId('geneSubtotal');if(subEl)subEl.textContent=money(cart.total_price);
    // free shipping bar
    var thresh=(window.geneFreeShip||0)*100;
    if(shipEl&&thresh>0){
      shipEl.style.display='block';
      var pct=Math.min(100,cart.total_price/thresh*100);
      var fill=byId('geneShipFill');if(fill)fill.style.width=pct+'%';
      var lbl=byId('geneShipLabel');
      if(lbl)lbl.textContent=cart.total_price>=thresh?"You've unlocked FREE shipping!":("You're "+money(thresh-cart.total_price)+" away from FREE shipping");
    } else if(shipEl){shipEl.style.display='none';}
  }
  function fetchCart(){return fetch(window.routes.cart+'.js',{headers:{'Accept':'application/json'}}).then(function(r){return r.json()}).then(renderCart)}

  function addToCart(id,qty){
    return fetch(window.routes.cart_add+'.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:[{id:id,quantity:qty||1}]})}).then(function(r){return r.json()});
  }
  function addMultiple(items){
    return fetch(window.routes.cart_add+'.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:items})}).then(function(r){return r.json()});
  }
  function changeQty(key,q){
    return fetch(window.routes.cart_change+'.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({id:key,quantity:q})}).then(function(r){return r.json()}).then(renderCart);
  }

  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-cart-toggle]');if(t){e.preventDefault();openCart();return;}
    if(e.target.closest('[data-cart-close]')){closeCart();return;}
    // size select
    var s=e.target.closest('.gene-size');
    if(s&&!s.disabled){
      var card=s.closest('[data-product-card]');
      card.querySelectorAll('.gene-size').forEach(function(x){x.classList.remove('is-active')});
      s.classList.add('is-active');
      card.setAttribute('data-variant',s.getAttribute('data-variant'));
      return;
    }
    // quick add
    var a=e.target.closest('[data-add]');
    if(a){
      e.preventDefault();
      var card=a.closest('[data-product-card]');
      var vid=card?card.getAttribute('data-variant'):a.getAttribute('data-variant');
      if(!vid){return;}
      a.disabled=true;var old=a.textContent;a.textContent='Adding…';
      addToCart(vid,1).then(function(){return fetchCart()}).then(function(){openCart();a.disabled=false;a.textContent=old;}).catch(function(){a.disabled=false;a.textContent=old;});
      return;
    }
    // bundle add
    var b=e.target.closest('[data-bundle-add]');
    if(b){
      e.preventDefault();
      var ids=(b.getAttribute('data-variants')||'').split(',').filter(Boolean);
      if(!ids.length)return;
      b.disabled=true;var ob=b.textContent;b.textContent='Adding…';
      addMultiple(ids.map(function(id){return{id:id,quantity:1}})).then(function(){return fetchCart()}).then(function(){openCart();b.disabled=false;b.textContent=ob;}).catch(function(){b.disabled=false;b.textContent=ob;});
      return;
    }
    // notify
    var n=e.target.closest('[data-notify]');
    if(n&&!n.classList.contains('is-done')){
      n.classList.add('is-done');n.textContent="\u2713 We'll email you";
      try{var k='gene_notify_'+n.getAttribute('data-notify');localStorage.setItem(k,'1');}catch(_){}
      return;
    }
    // qty in drawer
    var q=e.target.closest('.gene-qty button');
    if(q){changeQty(q.getAttribute('data-key'),parseInt(q.getAttribute('data-q'),10));return;}
    // faq
    var fq=e.target.closest('.gene-faq__q');
    if(fq){fq.closest('.gene-faq__item').classList.toggle('is-open');return;}
  });

  // restore notify state
  document.querySelectorAll('[data-notify]').forEach(function(n){
    try{if(localStorage.getItem('gene_notify_'+n.getAttribute('data-notify'))){n.classList.add('is-done');n.textContent="\u2713 We'll email you";}}catch(_){}
  });

  /* ---- Countdown ---- */
  document.querySelectorAll('[data-countdown]').forEach(function(el){
    var target=el.getAttribute('data-countdown');
    function tick(){
      var end;
      if(target&&target!=='midnight'){end=new Date(target).getTime();}
      else{var d=new Date();d.setHours(24,0,0,0);end=d.getTime();}
      var diff=Math.max(0,end-Date.now());
      var h=Math.floor(diff/3.6e6);diff-=h*3.6e6;var m=Math.floor(diff/6e4);diff-=m*6e4;var s=Math.floor(diff/1000);
      var p=function(n){return String(n).padStart(2,'0')};
      var hs=el.querySelector('[data-h]'),ms=el.querySelector('[data-m]'),ss=el.querySelector('[data-s]');
      if(hs)hs.textContent=p(h);if(ms)ms.textContent=p(m);if(ss)ss.textContent=p(s);
    }
    tick();setInterval(tick,1000);
  });

  fetchCart();
})();