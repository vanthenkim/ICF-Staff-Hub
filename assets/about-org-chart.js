/* about-org-chart.js v2
   Fetches Master Sheet, builds hierarchy, renders department columns
   into <div id="about-dept-cols"> in about.html.

   Also populates window.ICF_PEOPLE so showModal gets fresh contact data.

   Depends on globals defined in about.html:
     window.ICF_PEOPLE   — people contact object (write target)
     window.ICF_SHOW_MODAL(name, data, role) — modal opener
     window.openChartPopup(url) — dept chart popup opener
*/
(function(){
  var WRAP = document.getElementById('about-dept-cols');
  if(!WRAP) return;

  var SHEET = 'https://docs.google.com/spreadsheets/d/1TVyhqGjtqrKeiCfWZBVCdAnMRH34zwcvHILvMRaBCsk/gviz/tq?tqx=out:csv&sheet=Master';

  // ── BOD configuration (display order; contact info pulled from Sheet) ──────
  var BOD_CONFIG = [
    { name: 'ND Strupler',    chip: 'Founder',            colorClass: 'green',
      links: [
        { label: 'Donor Care', page: 'department-donor-care.html', color: '#059669', bg: '#f0fdf4', border: '#86efac' },
        { label: 'New Campus',  page: 'department-new-campus.html', color: '#059669', bg: '#f0fdf4', border: '#86efac' },
        { label: 'MarCom',      page: 'department-marcom.html',     color: '#059669', bg: '#f0fdf4', border: '#86efac' }
      ]},
    { name: 'Matthias Lendi', chip: 'Executive Director', colorClass: 'red',
      links: [
        { label: 'Human Resources', page: 'department-hr.html',       color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
        { label: 'Social',          page: 'department-social.html',    color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
        { label: 'Catering',        page: 'department-catering.html',  color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' }
      ]},
    { name: 'Martin Strupler', chip: 'Executive Director', colorClass: 'amber',
      links: [
        { label: 'Property',        page: 'department-property.html', color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
        { label: 'Learning Center', page: 'department-marcom.html',   color: '#d97706', bg: '#fffbeb', border: '#fcd34d' }
      ]},
    { name: 'Eddie Roach',    chip: 'Executive Director', colorClass: 'purple',
      links: [
        { label: 'Church', page: 'department-church.html', color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' }
      ]},
    { name: 'Vattey Chhun',   chip: 'Executive Director', colorClass: 'blue',
      links: [
        { label: 'Operations', page: 'department-operations.html', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
      ]}
  ];

  // ── DLT configuration (display order; contact info pulled from Sheet) ───────
  var DLT_CONFIG = [
    { name: 'Rany Mom',         chip: 'Location Pastor', colorClass: 'purple' },
    { name: 'Karano Chhuon',    chip: 'Family Care',     colorClass: 'red'    },
    { name: 'Parigna Souem',    chip: 'Education',       colorClass: 'red'    },
    { name: 'Longsamnieng Pol', chip: 'Fundraising',     colorClass: 'green'  },
    { name: 'Ratana Khy',       chip: 'MarCom',          colorClass: 'green'  },
    { name: 'Thavy Tham',       chip: 'Human Resources', colorClass: 'red'    },
    { name: 'Linet Un',         chip: 'Finance',         colorClass: 'blue'   }
  ];

  // ── Column configuration ─────────────────────────────────────────────────
  // edDept: dept name to pull the Director-level card from (top of column)
  // sections: each section shows a label badge, a chart link, then that dept's staff
  var COLUMNS = [
    { edDept:'Church',              color:'#7c3aed', lc:'#ddd6fe',
      sections:[{ label:'Church',              depts:['Church'],              page:'department-church.html' }] },
    { edDept:'Catering',            color:'#dc2626', lc:'#fca5a5',
      sections:[
        { label:'Social',           depts:['Social'],              page:'department-social.html' },
        { label:'Catering',         depts:['Catering'],            page:'department-catering.html' }
      ]},
    { edDept:'Operations',          color:'#2563eb', lc:'#bfdbfe',
      sections:[{ label:'Operations',          depts:['Operations'],          page:'department-operations.html' }] },
    { edDept:'Property Management', color:'#d97706', lc:'#fcd34d',
      sections:[{ label:'Property Management', depts:['Property Management'], page:'department-property.html' }] },
    { edDept:'Donor Care',          color:'#059669', lc:'#6ee7b7',
      sections:[
        { label:'Donor Care',       depts:['Donor Care'],          page:'department-donor-care.html' },
        { label:'New Campus',       depts:['New Campus'],          page:'department-new-campus.html' },
        { label:'MarCom',           depts:['MarCom'],              page:'department-marcom.html' }
      ]}
  ];

  // ── CSV parser ────────────────────────────────────────────────────────────
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

  function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

  function resolvePhoto(url){
    if(!url)return'';
    if(url.startsWith('https://staff-icf-cambodia.com/'))return url.replace('https://staff-icf-cambodia.com/','');
    var m=url.match(/[?&]id=([^&]+)/)||url.match(/\/file\/d\/([^/]+)/);
    return m?'https://lh3.googleusercontent.com/d/'+m[1]+'=s400':url;
  }

  var _uid = 0;
  function uid(){ return 'ao'+(++_uid); }

  // ── Render helpers ────────────────────────────────────────────────────────
  function dimStyle(p){
    return (p.isLeft||p.isNotStarted) ? 'opacity:0.4;filter:grayscale(0.6);' : '';
  }

  function directorCard(p, col){
    return '<div data-org-name="'+esc(p.name)+'" style="background:'+col.color+';border-radius:10px;padding:9px 10px;text-align:center;color:#fff;width:100%;box-sizing:border-box;cursor:pointer;'+dimStyle(p)+'">'
      +'<div style="font-size:9px;color:'+col.lc+';text-transform:uppercase;letter-spacing:.06em;">'+esc(p.role)+'</div>'
      +'<div style="font-weight:500;font-size:12px;margin-top:2px;">'+esc(p.name)+'</div>'
      +'</div>';
  }

  function sectionLabel(section, col, sid){
    var url = section.page+'#open-orgchart';
    var bg = col.lc.replace('ddd6fe','f5f3ff').replace('fca5a5','fef2f2').replace('bfdbfe','eff6ff').replace('fcd34d','fffbeb').replace('6ee7b7','f0fdf4');
    return '<div style="display:flex;align-items:center;gap:5px;margin:8px 0 4px;align-self:flex-start;">'
      +'<button onclick="var s=document.getElementById(\''+sid+'\');var open=s.style.display!==\'none\';s.style.display=open?\'none\':\'flex\';this.textContent=open?\''+esc(section.label)+' ▸\':\''+esc(section.label)+' ▾\'" style="background:'+bg+';border:1px solid '+col.lc+';border-radius:5px;padding:2px 8px;font-size:9px;font-weight:500;color:'+col.color+';text-transform:uppercase;letter-spacing:.06em;cursor:pointer;font-family:inherit;">'+esc(section.label)+' ▸</button>'
      +'<a href="'+esc(url)+'" onclick="event.preventDefault();if(window.openChartPopup)openChartPopup(\''+url+'\')" style="display:inline-flex;align-items:center;padding:2px 6px;border-radius:5px;font-size:9px;font-weight:500;text-decoration:none;background:'+bg+';border:1px solid '+col.lc+';color:'+col.color+';" onmouseover="this.style.opacity=\'0.7\'" onmouseout="this.style.opacity=\'1\'">chart →</a>'
      +'</div>';
  }

  function managerCard(p, reports){
    var id = uid();
    var hasReports = reports.length > 0;
    var btn = hasReports
      ? '<button onclick="event.stopPropagation();var f=document.getElementById(\''+id+'\');f.style.display=f.style.display===\'none\'?\'flex\':\'none\'" style="position:absolute;top:3px;right:3px;background:#dcfce7;border:1px solid #86efac;border-radius:5px;cursor:pointer;font-size:13px;color:#16a34a;padding:1px 5px;line-height:1.4;">&#9658;</button>'
      : '';
    var card = '<div data-org-name="'+esc(p.name)+'" style="position:relative;background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:5px 7px;width:100%;box-sizing:border-box;text-align:center;cursor:pointer;'+dimStyle(p)+'">'
      + btn
      +'<div style="font-weight:500;font-size:10.5px;color:#166534;">'+esc(p.name)+'</div>'
      +'<div style="font-size:9.5px;color:#16a34a;margin-top:1px;line-height:1.3;">'+esc(p.role)+'</div>'
      +'</div>';
    if(hasReports){
      var inner = reports.map(function(r){
        return '<div data-org-name="'+esc(r.name)+'" style="background:#fff;border:1.5px solid #e2e8f0;border-left:3px solid #86efac;border-radius:8px;padding:5px 7px;width:calc(100% - 8px);box-sizing:border-box;text-align:center;margin-left:8px;cursor:pointer;'+dimStyle(r)+'">'
          +'<div style="font-weight:500;font-size:10.5px;">'+esc(r.name)+'</div>'
          +'<div style="font-size:9.5px;color:#6b7a8d;margin-top:1px;line-height:1.3;">'+esc(r.role)+'</div>'
          +'</div>';
      }).join('');
      card += '<div id="'+id+'" style="display:none;flex-direction:column;gap:5px;width:100%;align-items:center;">'+inner+'</div>';
    }
    return card;
  }

  function teamCard(p){
    return '<div data-org-name="'+esc(p.name)+'" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:5px 7px;width:100%;box-sizing:border-box;text-align:center;cursor:pointer;'+dimStyle(p)+'">'
      +'<div style="font-weight:500;font-size:10.5px;color:#166534;">'+esc(p.name)+'</div>'
      +'<div style="font-size:9.5px;color:#16a34a;margin-top:1px;line-height:1.3;">'+esc(p.role)+'</div>'
      +'</div>';
  }

  // ── Leader card helpers ───────────────────────────────────────────────────
  function svgEmail(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'; }
  function svgPhone(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.7 3.07a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2-1.27a2 2 0 0 1 2.11-.45c1 .33 2 .57 3.07.7A2 2 0 0 1 22 16.92z"/></svg>'; }
  function svgTelegram(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'; }
  function svgChevronR(){ return '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>'; }

  function renderLeaderCard(p, chip, colorClass, links) {
    if (!p) return '';
    var bs = 'flex:1;padding:6px 4px;display:flex;align-items:center;justify-content:center;border-radius:8px;border:1px solid var(--border);background:#fff;color:var(--text-muted);transition:background .15s,color .15s;';
    var html = '<article class="person person--'+esc(colorClass)+'" style="min-width:0;">';
    if (p.photo) html += '<img class="person__photo" src="'+esc(p.photo)+'" alt="'+esc(p.name)+'" loading="lazy" />';
    html += '<div style="padding:8px 10px 6px;display:flex;flex-direction:column;gap:2px;">';
    html += '<span class="person__chip" style="font-size:10px;padding:2px 6px;margin-bottom:2px;">'+esc(chip)+'</span>';
    html += '<h4 class="person__name" style="font-size:12px;line-height:1.3;">'+esc(p.name)+'</h4>';
    html += '<p class="person__role" style="font-size:10.5px;line-height:1.3;">'+esc(p.role)+'</p>';
    html += '</div><div style="margin-top:auto;display:flex;flex-direction:column;gap:4px;padding:0 8px 8px;">';
    html += '<div style="display:flex;gap:4px;">';
    if (p.email) html += '<a class="person__btn person__btn--email" href="mailto:'+esc(p.email)+'" title="Email" style="'+bs+'">'+svgEmail()+'</a>';
    var ph = (p.phone||'').replace(/\D/g,'');
    if (ph) html += '<a class="person__btn person__btn--phone" href="tel:+'+ph+'" title="Phone" style="'+bs+'">'+svgPhone()+'</a>';
    if (p.telegram) html += '<a class="person__btn person__btn--telegram" href="https://t.me/'+esc(p.telegram)+'" target="_blank" rel="noopener" title="Telegram" style="'+bs+'">'+svgTelegram()+'</a>';
    html += '</div>';
    if (links) links.forEach(function(lnk){
      html += '<div><a href="'+esc(lnk.page)+'" style="display:flex;align-items:center;justify-content:center;gap:4px;padding:5px 4px;border-radius:8px;background:'+lnk.bg+';border:1px solid '+lnk.border+';color:'+lnk.color+';font-size:10px;font-weight:500;text-decoration:none;transition:background .15s;" onmouseover="this.style.background=\''+lnk.border+'\'" onmouseout="this.style.background=\''+lnk.bg+'\'">'+esc(lnk.label)+' '+svgChevronR()+'</a></div>';
    });
    html += '</div></article>';
    return html;
  }

  // ── Main fetch + render ───────────────────────────────────────────────────
  fetch(SHEET).then(function(r){return r.text();}).then(function(csv){
    var rows = parseCSV(csv);
    if(rows.length < 2) return;

    var h = rows[0].map(function(x){return x.trim().toLowerCase().replace(/\s+/g,'_');});
    function col(row,name){var i=h.indexOf(name);return i>=0?(row[i]||'').trim():'';}

    var today = new Date(); today.setHours(0,0,0,0);
    var byName = {}, byDept = {};  // name→person, dept→[persons]

    rows.slice(1).forEach(function(r){
      if(!r.length || r.every(function(x){return!x.trim();})) return;
      var sort = col(r,'sort'); if(!sort||isNaN(+sort)) return;
      var name = col(r,'name'); if(!name) return;

      var leftDate = col(r,'left_date');
      var activeDate = col(r,'active_date');
      var isLeft = leftDate && !isNaN(new Date(leftDate)) && new Date(leftDate) <= today;
      var isNotStarted = activeDate && !isNaN(new Date(activeDate)) && new Date(activeDate) > today;

      var photo = resolvePhoto(col(r,'photo_url'));
      var dept  = col(r,'department');
      var level = col(r,'level').toLowerCase();
      var manager = col(r,'manager');

      var p = {
        name: name, dept: dept, role: col(r,'role'),
        group: col(r,'group'), level: level, manager: manager,
        sort: +sort, isLeft:!!isLeft, isNotStarted:!!isNotStarted,
        email: col(r,'email'), phone: col(r,'phone'),
        telegram: col(r,'telegram').replace(/^@/,''), photo: photo
      };
      byName[name] = p;
      if(!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(p);

      // Populate contact info for showModal
      if(window.ICF_PEOPLE){
        window.ICF_PEOPLE[name] = window.ICF_PEOPLE[name] || {};
        if(p.email)    window.ICF_PEOPLE[name].email    = p.email;
        if(p.phone)    window.ICF_PEOPLE[name].phone    = p.phone;
        if(p.telegram) window.ICF_PEOPLE[name].telegram = p.telegram;
        if(p.photo)    window.ICF_PEOPLE[name].photo    = p.photo;
      }
    });

    // ── Render BOD ────────────────────────────────────────────────────────────
    var bodWrap = document.getElementById('about-bod-grid');
    if (bodWrap) {
      var bodHtml = ''; var bodCount = 0;
      BOD_CONFIG.forEach(function(cfg){
        var p = byName[cfg.name];
        if (!p || p.isLeft || p.isNotStarted) return;
        bodHtml += renderLeaderCard(p, cfg.chip, cfg.colorClass, cfg.links);
        bodCount++;
      });
      if (bodHtml) {
        bodWrap.innerHTML = bodHtml;
        bodWrap.style.gridTemplateColumns = 'repeat('+bodCount+',1fr)';
        bodWrap.style.setProperty('--row-count', bodCount);
      }
    }

    // ── Render DLT ────────────────────────────────────────────────────────────
    var dltWrap = document.getElementById('about-dlt-grid');
    if (dltWrap) {
      var dltHtml = ''; var dltCount = 0;
      DLT_CONFIG.forEach(function(cfg){
        var p = byName[cfg.name];
        if (!p || p.isLeft || p.isNotStarted) return;
        dltHtml += renderLeaderCard(p, cfg.chip, cfg.colorClass, []);
        dltCount++;
      });
      if (dltHtml) {
        dltWrap.innerHTML = dltHtml;
        dltWrap.style.gridTemplateColumns = 'repeat('+dltCount+',1fr)';
        dltWrap.style.setProperty('--row-count', dltCount);
      }
    }

    // Build children map: managerName → [direct reports]
    var children = {};
    Object.keys(byName).forEach(function(name){
      var p = byName[name];
      if(p.manager){
        if(!children[p.manager]) children[p.manager] = [];
        children[p.manager].push(p);
      }
    });
    // Sort each children list by sort
    Object.keys(children).forEach(function(k){
      children[k].sort(function(a,b){return a.sort-b.sort;});
    });

    // ── Render columns ──────────────────────────────────────────────────────
    var colsHtml = '';

    COLUMNS.forEach(function(colCfg){
      // Find Director for this column's edDept
      var deptPeople = (byDept[colCfg.edDept]||[]).slice().sort(function(a,b){return a.sort-b.sort;});
      var director = deptPeople.find(function(p){return p.level==='director'||!p.manager;});
      if(!director && deptPeople.length) director = deptPeople[0];

      var col = '<div style="display:flex;flex-direction:column;align-items:center;width:180px;gap:5px;">'
        + '<div style="width:2px;height:20px;background:#cbd5e1;"></div>';

      if(director) col += directorCard(director, colCfg);

      colCfg.sections.forEach(function(sec){
        var sid = uid();
        col += sectionLabel(sec, colCfg, sid);
        col += '<div id="'+sid+'" style="display:none;flex-direction:column;gap:5px;width:100%;align-items:center;">';

        // Collect Manager + Leader level people for this section's depts (no Team members)
        var secPeople = [];
        sec.depts.forEach(function(d){
          (byDept[d]||[]).forEach(function(p){
            if(director && p.name===director.name) return; // skip the ED
            if(p.level==='director') return; // skip other directors
            if(p.level==='team') return; // team members not shown in main chart
            secPeople.push(p);
          });
        });
        secPeople.sort(function(a,b){return a.sort-b.sort;});

        // First-level: people whose manager is the director, OR who have no manager (and are in this section)
        var dirName = director ? director.name : null;
        var firstLevel = secPeople.filter(function(p){
          return !p.manager || p.manager===dirName ||
                 !byName[p.manager] || // manager not in sheet
                 (sec.depts.indexOf((byName[p.manager]||{}).dept)<0 && p.manager!==dirName);
        });
        // Deduplicate and fix: first level = those whose manager is the director or who are "top" in section
        // Simpler: first level = Level in [Manager, Leader, Team] but no manager in this same section
        firstLevel = secPeople.filter(function(p){
          var mgr = byName[p.manager];
          if(!mgr) return true; // manager not in sheet = top of section
          if(mgr.name === dirName) return true; // direct report of director
          if(sec.depts.indexOf(mgr.dept) < 0) return true; // manager in different dept
          return false;
        });

        firstLevel.forEach(function(p){
          var reports = (children[p.name]||[]).filter(function(r){
            return sec.depts.indexOf(r.dept)>=0 || sec.depts.indexOf((byName[r.name]||{}).dept)>=0;
          });
          if(reports.length > 0){
            col += managerCard(p, reports);
          } else {
            col += teamCard(p);
          }
        });

        col += '</div>'; // close section collapse div
      });

      col += '</div>';
      colsHtml += col;
    });

    WRAP.innerHTML = colsHtml;
    WRAP.style.gap = '8px';

    // Wire click handlers for showModal
    WRAP.addEventListener('click', function(e){
      var card = e.target.closest('[data-org-name]');
      if(!card) return;
      e.stopPropagation();
      var name = card.getAttribute('data-org-name');
      var role = (card.querySelector('[style*="font-size:9.5px"]')||card.querySelector('[style*="font-size:9px"]')||{}).textContent||'';
      var data = (window.ICF_PEOPLE||{})[name]||{};
      if(window.ICF_SHOW_MODAL) window.ICF_SHOW_MODAL(name, data, role.trim());
    });

  }).catch(function(){
    WRAP.innerHTML = '<div style="color:#94a3b8;font-size:13px;text-align:center;padding:20px;">Could not load org chart.</div>';
  });

})();
