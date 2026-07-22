/* dept-staff.js — loads team data from Google Sheet for a department page
   Requires window.ICF_DEPT  (department name, e.g. "Human Resources")
   Requires window.ICF_DEPT_COLOR  (hex accent colour, e.g. "#991b1b")
   Renders into <div id="dept-team-wrap"> and sets window.ICF_PEOPLE for the modal.
*/
(function () {
  var SHEET_ID  = '1TVyhqGjtqrKeiCfWZBVCdAnMRH34zwcvHILvMRaBCsk';
  var SHEET_GID = '609894648';
  var DEPT  = window.ICF_DEPT;
  var COLOR = window.ICF_DEPT_COLOR || '#1e3a5f';
  var LIGHT = COLOR + '18';   // 10 % tint

  if (!DEPT) return;

  var wrap = document.getElementById('dept-team-wrap');
  if (!wrap) return;

  /* ── helpers ──────────────────────────────────────────────────────────── */
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function initials(name) {
    return String(name||'').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
  }
  function cell(row, idx) {
    return (row.c && row.c[idx] && row.c[idx].v != null) ? String(row.c[idx].v) : '';
  }

  /* ── fetch & parse ────────────────────────────────────────────────────── */
  var url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID
          + '/gviz/tq?tqx=out:json&gid=' + SHEET_GID;

  fetch(url)
    .then(function(r){ return r.text(); })
    .then(function(text){
      var json = JSON.parse(
        text.replace(/^\/\*[^\*]*\*\/\s*[^(]*\(/, '').replace(/\)\s*;?\s*$/, '')
      );

      var cols = json.table.cols.map(function(c){
        return (c.label||c.id||'').trim().split(/\s+/)[0];
      });

      var I = {};
      ['Sort','Department','Name','Role','Group','Level',
       'Manager','Email','Phone','Telegram','Active_Date','Left_Date','Notes','Photo_URL'
      ].forEach(function(k){ I[k] = cols.indexOf(k); });

      var staff = (json.table.rows || [])
        .filter(function(r){ return r && r.c; })
        .map(function(r){
          return {
            sort:     parseInt(cell(r, I.Sort)) || 999,
            dept:     cell(r, I.Department),
            name:     cell(r, I.Name),
            role:     cell(r, I.Role),
            group:    cell(r, I.Group),
            level:    cell(r, I.Level) || 'Team',
            email:    cell(r, I.Email),
            phone:    cell(r, I.Phone),
            telegram: cell(r, I.Telegram).replace(/^@/,''),
            photo:    cell(r, I.Photo_URL),
            left:     cell(r, I.Left_Date),
          };
        })
        .filter(function(p){
          return p.dept === DEPT && !p.left && p.name;
        })
        .sort(function(a,b){ return a.sort - b.sort; });

      /* expose for contact modal */
      window.ICF_PEOPLE = {};
      staff.forEach(function(p){
        window.ICF_PEOPLE[p.name] = {
          role: p.role, email: p.email, phone: p.phone,
          telegram: p.telegram, photo: p.photo
        };
      });

      /* ── group by level then group ──────────────────────────────────── */
      var LEVEL_ORDER = ['Director','Manager','Leader','Team'];
      var sections = {};   // level → { group → [people] }
      LEVEL_ORDER.forEach(function(l){ sections[l] = {}; });

      staff.forEach(function(p){
        var lv = LEVEL_ORDER.indexOf(p.level) >= 0 ? p.level : 'Team';
        if (!sections[lv][p.group]) sections[lv][p.group] = [];
        sections[lv][p.group].push(p);
      });

      /* ── render ─────────────────────────────────────────────────────── */
      var html = '<div class="card" style="margin-bottom:14px;">'
               + '<h3 style="margin:0 0 10px;font-size:15px;">Team</h3>'
               + '<div style="display:flex;flex-direction:column;gap:8px;">';

      var firstSection = true;
      LEVEL_ORDER.forEach(function(lv){
        var groups = sections[lv];
        Object.keys(groups).forEach(function(grp){
          var people = groups[grp];
          if (!people.length) return;

          /* group label */
          var topPad   = firstSection ? '2px' : '6px';
          var topBorder = firstSection ? '' : 'border-top:1px solid var(--border);';
          html += '<div style="font-size:11px;font-weight:500;color:'+ COLOR +';'
                + 'text-transform:uppercase;letter-spacing:.06em;'
                + 'padding:'+ topPad +' 0 4px;'+ topBorder +'">'
                + esc(grp) + '</div>';
          firstSection = false;

          people.forEach(function(p){
            var sz       = (lv === 'Director') ? '40px' : '36px';
            var pad      = (lv === 'Director') ? '6px 8px' : '4px 6px';
            var margin   = (lv === 'Director') ? '0'        : '-4px -6px';
            var bgNormal = (lv === 'Director') ? LIGHT      : '';
            var bgHover  = (lv === 'Director') ? COLOR+'2a' : '#f8fafc';
            var border   = (lv === 'Director') ? 'border:1px solid '+COLOR+'33;' : '';

            /* photo or initials fallback */
            var photoHtml;
            var inits = esc(initials(p.name));
            var fallback = '<div style="width:'+ sz +';height:'+ sz +';border-radius:50%;'
                         + 'background:'+ LIGHT +';color:'+ COLOR +';font-size:14px;'
                         + 'font-weight:500;display:flex;align-items:center;justify-content:center;'
                         + 'flex-shrink:0;">'+ inits +'</div>';
            if (p.photo) {
              photoHtml = '<img src="'+ esc(p.photo) +'" alt="'+ esc(p.name) +'"'
                        + ' style="width:'+ sz +';height:'+ sz +';border-radius:50%;'
                        + 'object-fit:cover;flex-shrink:0;"'
                        + ' onerror="this.outerHTML=\''
                        + fallback.replace(/'/g,"\\'").replace(/"/g,'&quot;')
                        + '\'">';
            } else {
              photoHtml = fallback;
            }

            html += '<div data-person="'+ esc(p.name) +'"'
                  + ' style="display:flex;align-items:center;gap:10px;cursor:pointer;'
                  + 'padding:'+ pad +';margin:'+ margin +';border-radius:8px;'
                  + 'background:'+ bgNormal +';'+ border
                  + 'transition:background .15s;"'
                  + ' onmouseover="this.style.background=\''+ bgHover +'\'"'
                  + ' onmouseout="this.style.background=\''+ bgNormal +'\'">';
            html += photoHtml;
            html += '<div>'
                  + '<div style="font-weight:500;font-size:13.5px;">'+ esc(p.name) +'</div>'
                  + '<div class="muted" style="font-size:12px;">'+ esc(p.role)
                  + (p.email ? ' · '+ esc(p.email) : '') +'</div>'
                  + '</div></div>';
          });
        });
      });

      html += '</div></div>';
      wrap.innerHTML = html;
    })
    .catch(function(err){
      console.error('[dept-staff.js]', err);
      wrap.innerHTML = '<div class="card"><p style="color:#ef4444;font-size:13px;padding:4px 0;margin:0;">'
                     + 'Could not load team data. Check your connection.</p></div>';
    });
})();
