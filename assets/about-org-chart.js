/* about-org-chart.js v1
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

  function sectionLabel(section, col){
    var url = section.page+'#open-orgchart';
    return '<div style="display:flex;align-items:center;gap:5px;margin:8px 0 4px;align-self:flex-start;">'
      +'<div style="background:'+col.lc.replace('ddd6fe','f5f3ff').replace('fca5a5','fef2f2').replace('bfdbfe','eff6ff').replace('fcd34d','fffbeb').replace('6ee7b7','f0fdf4')+';border-radius:5px;padding:2px 8px;font-size:9px;font-weight:500;color:'+col.color+';text-transform:uppercase;letter-spacing:.06em;">'+esc(section.label)+'</div>'
      +'<a href="'+esc(url)+'" onclick="event.preventDefault();if(window.openChartPopup)openChartPopup(\''+url+'\')" style="display:inline-flex;align-items:center;padding:2px 6px;border-radius:5px;font-size:9px;font-weight:500;text-decoration:none;background:'+col.lc.replace('ddd6fe','f5f3ff').replace('fca5a5','fef2f2').replace('bfdbfe','eff6ff').replace('fcd34d','fffbeb').replace('6ee7b7','f0fdf4')+';border:1px solid '+col.lc+';color:'+col.color+';" onmouseover="this.style.opacity=\'0.7\'" onmouseout="this.style.opacity=\'1\'">chart →</a>'
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
        level: level, manager: manager,
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
        col += sectionLabel(sec, colCfg);

        // Collect all non-director people for this section's depts
        var secPeople = [];
        sec.depts.forEach(function(d){
          (byDept[d]||[]).forEach(function(p){
            if(director && p.name===director.name) return; // skip the ED
            if(p.level!=='director') secPeople.push(p);
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
