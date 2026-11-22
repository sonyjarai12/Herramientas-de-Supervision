/* Acceso con usuario y contraseña (Herramientas de supervisión).
   Se guarda solo el hash SHA-256 de "usuario|contraseña". El acceso queda recordado en el equipo 30 días. */
(function(){
  var H='0ffb0f5dc8eb2d55800410ed44033f33cdfc2ee747723540f58c7e73f67dcb18', K='osi_auth_v1', DIAS=30;
  function sha256(ascii){function r(v,a){return(v>>>a)|(v<<(32-a))}var mp=Math.pow,mw=mp(2,32),i,j,res='',words=[],bl=ascii.length*8,h=sha256.h=sha256.h||[],k=sha256.k=sha256.k||[],pl=k.length,ic={};
    for(var c=2;pl<64;c++){if(!ic[c]){for(i=0;i<313;i+=c)ic[i]=c;h[pl]=(mp(c,.5)*mw)|0;k[pl++]=(mp(c,1/3)*mw)|0}}
    ascii+='\x80';while(ascii.length%64-56)ascii+='\x00';for(i=0;i<ascii.length;i++){j=ascii.charCodeAt(i);if(j>>8)return;words[i>>2]|=j<<((3-i)%4)*8}
    words[words.length]=((bl/mw)|0);words[words.length]=bl;var hash=h.slice(0,8);
    for(j=0;j<words.length;){var w=words.slice(j,j+=16),oh=hash;hash=hash.slice(0,8);
      for(i=0;i<64;i++){var w15=w[i-15],w2=w[i-2],a=hash[0],e=hash[4];
        var t1=hash[7]+(r(e,6)^r(e,11)^r(e,25))+((e&hash[5])^((~e)&hash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(r(w15,7)^r(w15,18)^(w15>>>3))+w[i-7]+(r(w2,17)^r(w2,19)^(w2>>>10)))|0);
        var t2=(r(a,2)^r(a,13)^r(a,22))+((a&hash[1])^(a&hash[2])^(hash[1]&hash[2]));hash=[(t1+t2)|0].concat(hash);hash[4]=(hash[4]+t1)|0}
      for(i=0;i<8;i++)hash[i]=(hash[i]+oh[i])|0}
    for(i=0;i<8;i++)for(j=3;j+1;j--){var b=(hash[i]>>(j*8))&255;res+=((b<16)?0:'')+b.toString(16)}return res}
  function utf8(s){return unescape(encodeURIComponent(s))}
  function ok(){try{var a=JSON.parse(localStorage.getItem(K)||'null');return a&&a.h===H&&a.exp>Date.now()}catch(e){return false}}
  window.OSI_LOGOUT=function(){try{localStorage.removeItem(K)}catch(e){}location.href='index.html'};
  if(ok())return;
  var st=document.createElement('style');st.id='authHide';st.textContent='body>*:not(#authGate){display:none!important}';document.head.appendChild(st);
  function gate(){
    var d=document.createElement('div');d.id='authGate';
    d.innerHTML='<style>#authGate{position:fixed;inset:0;z-index:99999;background:#0B2A4A;color:#fff;display:flex;align-items:center;justify-content:center;padding:20px;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}'+
      '#authGate .bx{width:100%;max-width:360px}#authGate .lg{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:700;margin-bottom:16px}'+
      '#authGate h1{font-size:24px;margin:0 0 4px}#authGate p{color:rgba(255,255,255,.65);margin:0 0 22px;font-size:14px}#authGate label{display:block;font-size:13px;color:rgba(255,255,255,.8);margin:12px 0 5px;font-weight:600}'+
      '#authGate input[type=text],#authGate input[type=password]{width:100%;box-sizing:border-box;font-size:16px;padding:13px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:#fff;color:#0B2A4A;outline:none}'+
      '#authGate button{width:100%;margin-top:20px;padding:14px;border:0;border-radius:10px;background:#1E5AA8;color:#fff;font-size:16px;font-weight:700;cursor:pointer}'+
      '#authGate .er{color:#ffb4ab;font-size:13.5px;min-height:20px;margin-top:10px}#authGate .sh{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px;color:rgba(255,255,255,.75)}</style>'+
      '<form class="bx" autocomplete="on"><div class="lg">OSI</div><h1>Herramientas de supervisión</h1><p>OSINERGMIN · Oficina Regional Loreto</p>'+
      '<label for="auU">Usuario</label><input type="text" id="auU" autocomplete="username" autocapitalize="off" spellcheck="false">'+
      '<label for="auP">Contraseña</label><input type="password" id="auP" autocomplete="current-password">'+
      '<label class="sh"><input type="checkbox" id="auS" style="width:18px;height:18px"> Mostrar contraseña</label>'+
      '<button type="submit">Ingresar</button><div class="er" id="auE"></div></form>';
    document.body.appendChild(d);
    var f=d.querySelector('form');d.querySelector('#auS').onchange=function(){d.querySelector('#auP').type=this.checked?'text':'password'};
    f.onsubmit=function(e){e.preventDefault();var u=d.querySelector('#auU').value.trim(),p=d.querySelector('#auP').value;
      if(sha256(utf8(u+'|'+p))===H){try{localStorage.setItem(K,JSON.stringify({h:H,exp:Date.now()+DIAS*864e5}))}catch(x){}d.remove();var s=document.getElementById('authHide');if(s)s.remove();window.dispatchEvent(new Event('resize'))}
      else{d.querySelector('#auE').textContent='Usuario o contraseña incorrectos.';d.querySelector('#auP').value=''}};
    setTimeout(function(){d.querySelector('#auU').focus()},50)}
  if(document.body)gate();else document.addEventListener('DOMContentLoaded',gate);
})();
