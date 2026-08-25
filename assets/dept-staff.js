/* dept-staff.js — loads team data from Google Sheet for a department page
   Requires window.ICF_DEPT  (department name, e.g. "Human Resources")
   Requires window.ICF_DEPT_COLOR  (hex accent colour, e.g. "#991b1b")
   Renders into <div id="dept-team-wrap"> and sets window.ICF_PEOPLE for the modal.
*/
(function () {
  var SHEET_ID  = '1TVyhqGjtqrKeiCfWZBVCdAnMRH34zwcvHILvMRaBCsk';
  var SHEET_GID = '609894648';
  var DEPT       = window.ICF_DEPT;
  var EXTRA_DEPTS = window.ICF_DEPT_EXTRA || [];
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
  function parseDate(s) {
    if (!s) return null;
    // Handle Google Sheets JSON date format: Date(year,month,day) where month is 0-indexed
    var m = s.match(/^Date\((\d+),(\d+),(\d+)\)$/);
    if (m) return new Date(+m[1], +m[2], +m[3]);
    var d = new Date(s);
    return isNaN(d) ? null : d;
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
       'Manager','Email','Phone','Telegram','Active_Date','Left_Date','Notes','Photo_URL','Alias'
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
            alias:    cell(r, I.Alias),
            active_date: cell(r, I.Active_Date),
            left:        cell(r, I.Left_Date),
          };
        })
        .filter(function(p){
          // Exclude Director-level staff from extra depts (they're already in the main Executive Director group)
          if (EXTRA_DEPTS.indexOf(p.dept) >= 0 && p.level === 'Director') return false;
          if (!p.name) return false;
          if (p.dept !== DEPT && EXTRA_DEPTS.indexOf(p.dept) < 0) return false;
          var today = new Date(); today.setHours(0,0,0,0);
          // Active_Date: hide if start date is in the future
          if (p.active_date) {
            var ad = parseDate(p.active_date);
            if (ad && ad > today) return false;
          }
          // Left_Date: hide only if departure date is today or in the past
          if (p.left) {
            var ld = parseDate(p.left);
            if (ld && ld <= today) return false;
          }
          return true;
        })
        .sort(function(a,b){ return a.sort - b.sort; });

      /* expose for contact modal */
      window.ICF_PEOPLE = {};
      staff.forEach(function(p){
        window.ICF_PEOPLE[p.name] = {
          role: p.role, email: p.email, phone: p.phone,
          telegram: p.telegram, photo: p.photo, alias: p.alias
        };
        // also index by alias so search can find people by nickname
        if (p.alias) window.ICF_PEOPLE[p.alias] = window.ICF_PEOPLE[p.name];
      });

      /* ── group by group name only (level affects styling, not grouping) ── */
      var LEVEL_ORDER = ['Director','Manager','Leader','Team'];
      var groupMap   = {};   // normalised key → [people]
      var groupLabel = {};   // normalised key → first-seen display name
      var groupOrder = [];   // preserve first-seen order

      staff.forEach(function(p){
        var lv = LEVEL_ORDER.indexOf(p.level) >= 0 ? p.level : 'Team';
        p.level = lv; // normalise
        // For extra-dept staff, group them all under their department name so they appear
        // as one collapsible section (e.g. all Education staff under EDUCATION)
        var groupValue = (EXTRA_DEPTS.indexOf(p.dept) >= 0) ? p.dept : (p.group || '');
        var key = groupValue.trim().toLowerCase(); // normalise key to collapse case/space variants
        if (!groupMap[key]) {
          groupMap[key]   = [];
          groupLabel[key] = groupValue.trim(); // keep first-seen display name
          groupOrder.push(key);
        }
        groupMap[key].push(p);
      });

      // Within each group sort by level (Director first, then Manager, Leader, Team)
      groupOrder.forEach(function(key){
        groupMap[key].sort(function(a, b){
          return LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
        });
      });

      /* ── render helpers ─────────────────────────────────────────────── */
      function renderPerson(p, indent) {
        var lv = p.level;
        var isLead   = !indent && (lv === 'Director' || lv === 'Manager' || lv === 'Leader');
        var sz       = isLead ? '38px' : '36px';
        var pad      = isLead ? '6px 8px' : '4px 8px';
        var margin   = isLead ? '0'       : '-4px 0';
        var bgNormal = isLead ? LIGHT     : '';
        var bgHover  = isLead ? COLOR+'2a': '#f8fafc';
        var border   = isLead ? 'border:1px solid '+COLOR+'33;' : '';

        var inits = esc(initials(p.name));
        var fallback = '<div style="width:'+ sz +';height:'+ sz +';border-radius:50%;'
                     + 'background:'+ LIGHT +';color:'+ COLOR +';font-size:14px;'
                     + 'font-weight:500;display:flex;align-items:center;justify-content:center;'
                     + 'flex-shrink:0;">'+ inits +'</div>';
        var photoHtml;
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

        return '<div data-person="'+ esc(p.name) +'"'
             + ' style="display:flex;align-items:center;gap:10px;cursor:pointer;'
             + 'padding:'+ pad +';margin:'+ margin +';border-radius:8px;'
             + 'background:'+ bgNormal +';'+ border
             + 'transition:background .15s;"'
             + ' onmouseover="this.style.background=\''+ bgHover +'\'"'
             + ' onmouseout="this.style.background=\''+ bgNormal +'\'">'
             + photoHtml
             + '<div>'
             + '<div style="font-weight:500;font-size:13.5px;">'+ esc(p.name) +'</div>'
             + '<div class="muted" style="font-size:12px;">'+ esc(p.role)
             + (p.email ? ' · '+ esc(p.email) : '') +'</div>'
             + '</div></div>';
      }

      /* ── render ─────────────────────────────────────────────────────── */
      var html = '<div class="card" style="margin-bottom:14px;">'
               + '<h3 style="margin:0 0 10px;font-size:15px;">Team</h3>'
               + '<div style="display:flex;flex-direction:column;gap:8px;">';

      var firstSection = true;
      groupOrder.forEach(function(key){
        var people = groupMap[key];
        if (!people.length) return;
        var grp = groupLabel[key];

        // Rename "Management" → "Executive Director" for Director-level groups
        var displayGrp = grp;
        if (key === 'management') displayGrp = 'Executive Director';

        /* group label — collapsible toggle */
        var topPad   = firstSection ? '2px' : '6px';
        var topBorder = firstSection ? '' : 'border-top:1px solid var(--border);';
        html += '<div onclick="(function(btn){var body=btn.nextElementSibling;var ch=btn.querySelector(\'.grp-ch\');if(!body)return;var open=body.getAttribute(\'data-open\')!==\'0\';body.style.display=open?\'none\':\'flex\';body.setAttribute(\'data-open\',open?\'0\':\'1\');ch.style.transform=open?\'rotate(-90deg)\':\'rotate(0deg)\';})(this)"'
              + ' style="font-size:11px;font-weight:500;color:'+ COLOR +';'
              + 'text-transform:uppercase;letter-spacing:.06em;'
              + 'padding:'+ topPad +' 0 4px;'+ topBorder
              + 'cursor:pointer;user-select:none;display:flex;justify-content:space-between;align-items:center;">'
              + '<span>'+ esc(displayGrp) + '</span>'
              + '<span class="grp-ch" style="font-size:10px;color:'+ COLOR +';line-height:1;transition:transform .2s;display:inline-block;">▼</span>'
              + '</div>';
        firstSection = false;

        /* people container — starts expanded */
        html += '<div data-open="1" style="display:flex;flex-direction:column;gap:4px;">';

        /* render people, with Team members indented under their Leader/Manager if Manager column is set */
        var rendered = {};
        people.forEach(function(p){
          if (rendered[p.name]) return;
          var lv = p.level;
          var isLead = (lv === 'Director' || lv === 'Manager' || lv === 'Leader');

          html += renderPerson(p, false);
          rendered[p.name] = true;

          /* if this person is a lead, show direct reports indented below */
          if (isLead) {
            var reports = people.filter(function(sub){
              return !rendered[sub.name] && sub.manager === p.name;
            });
            if (reports.length) {
              html += '<div style="margin-left:16px;border-left:2px solid '+ COLOR +'33;padding-left:8px;display:flex;flex-direction:column;gap:4px;margin-top:2px;margin-bottom:2px;">';
              reports.forEach(function(sub){
                html += renderPerson(sub, true);
                rendered[sub.name] = true;
              });
              html += '</div>';
            }
          }
        });

        /* any remaining (no manager set or manager not in this group) */
        people.forEach(function(p){
          if (!rendered[p.name]) {
            html += renderPerson(p, false);
            rendered[p.name] = true;
          }
        });

        html += '</div>'; /* close people container */
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
