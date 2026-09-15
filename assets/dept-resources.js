/* dept-resources.js  v2
   Loads department resources from a Google Sheet and renders them.

   Auto-runs once on load using window globals (backward-compatible).
   Can also be called explicitly: window.ICF_LOAD_RESOURCES({ sheetId, tab, slug, color })

   Window globals (set BEFORE this script):
     window.ICF_RESOURCES_SHEET_ID   — Sheet ID (required; empty = do nothing)
     window.ICF_RESOURCES_SHEET_TAB  — Tab name (default: 'Department_Content'; '' = first tab)
     window.ICF_RESOURCES_SLUG       — Container ID prefix (default: derived from ICF_DEPT)
     window.ICF_DEPT_COLOR           — Hex accent colour
     window.ICF_DEPT                 — Dept name (used for slug derivation)

   Explicit call params (override globals):
     sheetId, tab, slug, color

   Target element: <div id="SLUG-resources-list">

   Sheet columns:
     order | title | description | link_label | link_url |
     contact_label | contact_url | status | live

   status values:
     coming soon  → grey "Coming soon" badge
     contact      → modal-trigger button (link_url = person name passed to openModal)
     (empty/other) → link button(s)
*/
(function(){

  var PALETTES = {
    '#5b21b6':{bg:'#f5f3ff',border:'#c4b5fd',text:'#7c3aed'},
    '#7c3aed':{bg:'#f5f3ff',border:'#c4b5fd',text:'#7c3aed'},
    '#065f46':{bg:'#f0fdf4',border:'#6ee7b7',text:'#059669'},
    '#059669':{bg:'#f0fdf4',border:'#6ee7b7',text:'#059669'},
    '#991b1b':{bg:'#fef2f2',border:'#fca5a5',text:'#dc2626'},
    '#dc2626':{bg:'#fef2f2',border:'#fca5a5',text:'#dc2626'},
    '#1d4ed8':{bg:'#eff6ff',border:'#93c5fd',text:'#2563eb'},
    '#2563eb':{bg:'#eff6ff',border:'#93c5fd',text:'#2563eb'},
    '#b45309':{bg:'#fffbeb',border:'#fde68a',text:'#d97706'},
    '#d97706':{bg:'#fffbeb',border:'#fde68a',text:'#d97706'},
  };

  var ICON_SEND = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  var ICON_LINK = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
  var ICON_FILE = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
  var ICON_SOON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

  function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function raw(s){return s||'';}

  function bStyle(bg,border,color,extra){
    return 'display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:'+bg
      +';border:1.5px solid '+border+';border-radius:8px;font-size:12px;font-weight:500;color:'+color
      +';flex-shrink:0;text-decoration:none;font-family:inherit;'+(extra||'');
  }

  function parseCSV(text){
    var rows=[],row=[],cur='',inQ=false;
    for(var i=0;i<text.length;i++){
      var c=text[i];
      if(inQ){if(c==='"'&&text[i+1]==='"'){cur+='"';i++;}else if(c==='"'){inQ=false;}else{cur+=c;}}
      else if(c==='"'){inQ=true;}
      else if(c===','){row.push(cur);cur='';}
      else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;if(row.length||cur){row.push(cur);rows.push(row);}row=[];cur='';}
      else{cur+=c;}
    }
    if(cur||row.length){row.push(cur);rows.push(row);}
    return rows;
  }

  function loadResources(cfg) {
    cfg = cfg || {};
    var SHEET_ID = cfg.sheetId || window.ICF_RESOURCES_SHEET_ID || '';
    var TAB      = cfg.tab !== undefined ? cfg.tab
                 : (window.ICF_RESOURCES_SHEET_TAB !== undefined ? window.ICF_RESOURCES_SHEET_TAB : 'Department_Content');
    var COLOR    = cfg.color || window.ICF_DEPT_COLOR || '#475569';
    if(!SHEET_ID) return;

    var slug = cfg.slug
      || window.ICF_RESOURCES_SLUG
      || (window.ICF_DEPT||'').toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      || 'dept';

    var wrap = document.getElementById(slug+'-resources-list');
    if(!wrap) return;

    var pal = PALETTES[COLOR] || {bg:'#f8fafc',border:'#e2e8f0',text:COLOR};

    var url = 'https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/gviz/tq?tqx=out:csv'
            + (TAB ? '&sheet='+encodeURIComponent(TAB) : '');

    fetch(url).then(function(r){return r.text();}).then(function(csv){
      var rows = parseCSV(csv);
      if(rows.length<2) return;
      var h = rows[0].map(function(x){return x.trim().toLowerCase().replace(/\s+/g,'_');});
      function col(row,name){var i=h.indexOf(name);return i>=0?(row[i]||'').trim():'';}

      var items = rows.slice(1).filter(function(r){
        var live = col(r,'live').toUpperCase();
        return live===''||live==='TRUE'||live==='YES';
      });
      if(!items.length) return;
      items.sort(function(a,b){return(parseInt(col(a,'order'))||99)-(parseInt(col(b,'order'))||99);});

      var html = '';
      items.forEach(function(row){
        var title     = col(row,'title'); if(!title) return;
        var desc      = col(row,'description');
        var linkLabel = col(row,'link_label') || 'Open';
        var linkUrl   = col(row,'link_url');
        var contLabel = col(row,'contact_label');
        var contUrl   = col(row,'contact_url');
        var status    = col(row,'status').toLowerCase();

        var btn = '';
        if(status==='coming soon'||status==='soon'||(!linkUrl&&!contUrl)){
          btn = '<span style="'+bStyle('#f8fafc','#e2e8f0','#94a3b8')+'cursor:not-allowed;">'+ICON_SOON+'Coming soon</span>';
        } else if(status==='contact'&&linkUrl){
          btn = '<button onclick="(window.ICF_OPEN_MODAL||openModal)(\''+raw(linkUrl).replace(/\\/g,'\\\\').replace(/'/g,"\\'")+'\')" style="'+bStyle(pal.bg,pal.border,pal.text)+'cursor:pointer;">'+ICON_SEND+esc(linkLabel)+'</button>';
        } else {
          var btns='';
          if(linkUrl){
            var isFile=/\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|gif)(\b|$)/i.test(linkUrl)||linkUrl.includes('/export?format=');
            var icon = isFile ? ICON_FILE : ICON_LINK;
            btns+='<a href="'+esc(linkUrl)+'" target="_blank" rel="noopener" style="'+bStyle(COLOR,'transparent','#fff')+'">'+icon+esc(linkLabel)+'</a>';
          }
          if(contUrl&&contLabel){
            btns+='<a href="'+esc(contUrl)+'" target="_blank" rel="noopener" style="'+bStyle(pal.bg,pal.border,pal.text)+'">'+ICON_SEND+esc(contLabel)+'</a>';
          }
          btn = btns ? '<div style="display:flex;gap:6px;flex-shrink:0;">'+btns+'</div>' : '';
        }

        html+='<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:8px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 1px 2px rgba(0,0,0,.04);">'
             +'<div style="min-width:0;"><div style="font-weight:500;font-size:13.5px;margin:0;">'+esc(title)+'</div>'
             +(desc?'<div style="font-size:12px;color:var(--text-muted);margin:0;">'+esc(desc)+'</div>':'')
             +'</div>'+btn+'</div>\n';
      });
      if(html) wrap.innerHTML = html;
    }).catch(function(){});
  }

  // Expose for explicit calls (e.g. second section on same page)
  window.ICF_LOAD_RESOURCES = loadResources;

  // Auto-run with window globals
  loadResources({});

})();
