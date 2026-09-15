/* ICF Favourites — shared across guidelines, resources, dept pages */
(function(){
  var KEY = 'icf-favs';

  function get(){
    try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }catch(e){ return []; }
  }
  function save(a){
    try{ localStorage.setItem(KEY, JSON.stringify(a)); }catch(e){}
  }
  function has(id){ return get().some(function(f){ return f.id===id; }); }

  function btnStyle(active){
    return 'background:none;border:none;cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;flex-shrink:0;color:'+(active?'#ef4444':'#d1d5db')+';transition:color .15s;';
  }

  window.icfToggleFav = function(btn){
    var id    = btn.dataset.favId;
    var title = btn.dataset.favTitle || id;
    var url   = btn.dataset.favUrl   || '';
    var favs  = get();
    var idx   = -1;
    favs.forEach(function(f,i){ if(f.id===id) idx=i; });
    if(idx>=0){ favs.splice(idx,1); } else { favs.push({id:id,title:title,url:url}); }
    save(favs);
    var active = idx<0;
    btn.innerHTML = active ? '♥' : '♡';
    btn.setAttribute('style', btnStyle(active));
    renderPanel();
  };

  window.icfRemoveFav = function(id){
    save(get().filter(function(f){ return f.id!==id; }));
    var btn = document.querySelector('[data-fav-id="'+id+'"]');
    if(btn){ btn.innerHTML='♡'; btn.setAttribute('style', btnStyle(false)); }
    renderPanel();
  };

  window.icfInitFavBtns = function(){
    document.querySelectorAll('[data-fav-id]').forEach(function(btn){
      var active = has(btn.dataset.favId);
      btn.innerHTML = active ? '♥' : '♡';
      btn.setAttribute('style', btnStyle(active));
    });
    renderPanel();
  };

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function renderPanel(){
    var panel = document.getElementById('sidesheet-favs');
    if(!panel) return;
    var favs = get();
    if(!favs.length){
      panel.innerHTML = '<p style="font-size:13px;color:var(--text-soft);font-style:italic;padding:6px 12px;">Tap ♡ on any card to save it here</p>';
      return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:4px;padding:4px 10px;">';
    favs.forEach(function(f){
      html += '<div style="display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;">'
            + '<span style="font-size:12.5px;font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(f.title)+'</span>';
      if(f.url) html += '<a href="'+esc(f.url)+'" target="_blank" rel="noopener" style="font-size:11.5px;color:#3b82f6;flex-shrink:0;text-decoration:none;">Open</a>';
      html += '<button onclick="icfRemoveFav(\''+esc(f.id)+'\')" title="Remove" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:13px;flex-shrink:0;padding:0;line-height:1;">✕</button>'
            + '</div>';
    });
    html += '</div>';
    panel.innerHTML = html;
  }

  // Auto-init after DOM + dynamic content
  function init(){
    window.icfInitFavBtns && window.icfInitFavBtns();
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 300);
  }
})();
