/* training-hub.js — loads Training & Development content from a Google Sheet
   Requires: window.ICF_TD_SHEET_ID  (Google Sheet ID)
             window.ICF_TD_SHEET_GID (sheet tab GID, default '0')
   Renders into: <div id="td-feed">
   Search wired to: <input id="td-search">

   Sheet columns (row 1 = headers):
     A Sort | B Category | C Type | D Title | E Description
     F Steps | G Resources | H Duration | I Availability
     J Link | K Link_Label | L Tags | M Color | N Active
*/
(function () {
  var SHEET_ID  = window.ICF_TD_SHEET_ID  || '';
  var SHEET_GID = window.ICF_TD_SHEET_GID || '0';

  var feed  = document.getElementById('td-feed');
  var searchEl = document.getElementById('td-search');
  var countEl  = document.getElementById('td-count');

  if (!SHEET_ID) {
    feed.innerHTML = '<div class="card"><p style="color:#ef4444;font-size:13px;margin:0;">⚠ Training Sheet ID not configured. Set <code>window.ICF_TD_SHEET_ID</code> in training.html.</p></div>';
    return;
  }

  /* ── colour palette per category ─────────────────────────────────── */
  var PALETTE = {
    'develop people':         { c:'#059669', bg:'#f0fdf4', bd:'#86efac' },
    'communicate & feedback': { c:'#2563eb', bg:'#eff6ff', bd:'#bfdbfe' },
    'lead the team':          { c:'#7c3aed', bg:'#f5f3ff', bd:'#c4b5fd' },
    'grow as a leader':       { c:'#d97706', bg:'#fffbeb', bd:'#fde68a' },
    'trainings':              { c:'#0891b2', bg:'#ecfeff', bd:'#a5f3fc' },
    'apr':                    { c:'#dc2626', bg:'#fef2f2', bd:'#fca5a5' },
    'training request':       { c:'#475569', bg:'#f8fafc', bd:'#cbd5e1' }
  };
  function pal(cat) {
    return PALETTE[(cat || '').toLowerCase().trim()] || { c:'#475569', bg:'#f8fafc', bd:'#e2e8f0' };
  }

  /* ── category icons ───────────────────────────────────────────────── */
  var ICONS = {
    'develop people':
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    'communicate & feedback':
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'lead the team':
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'grow as a leader':
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    'trainings':
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
    'apr':
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    'training request':
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
  };
  function icon(cat) { return ICONS[(cat||'').toLowerCase().trim()] || ''; }

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── state ────────────────────────────────────────────────────────── */
  var allItems  = [];
  var catOrder  = [];
  var catMap    = {};

  /* ── fetch ────────────────────────────────────────────────────────── */
  var url = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID
          + '/gviz/tq?tqx=out:json&gid=' + SHEET_GID;

  feed.innerHTML = '<div style="padding:28px 0;text-align:center;color:#94a3b8;font-size:14px;">Loading…</div>';

  fetch(url)
    .then(function(r) { return r.text(); })
    .then(function(text) {
      var json = JSON.parse(
        text.replace(/^\/\*[^\*]*\*\/\s*[^(]*\(/, '').replace(/\)\s*;?\s*$/, '')
      );

      /* map header labels → column indices */
      var cols = json.table.cols.map(function(c) {
        return (c.label || c.id || '').trim();
      });
      var I = {};
      ['Sort','Category','Type','Title','Description','Steps','Resources',
       'Duration','Availability','Link','Link_Label','Tags','Color','Active','Extra_Links'
      ].forEach(function(k) { I[k] = cols.indexOf(k); });

      function cell(row, idx) {
        return (row.c && row.c[idx] && row.c[idx].v != null)
          ? String(row.c[idx].v).trim() : '';
      }

      allItems = (json.table.rows || [])
        .filter(function(r) { return r && r.c; })
        .map(function(r) {
          return {
            sort:         parseInt(cell(r, I.Sort)) || 999,
            cat:          cell(r, I.Category),
            type:         cell(r, I.Type) || 'Guide',
            title:        cell(r, I.Title),
            desc:         cell(r, I.Description),
            steps:        cell(r, I.Steps),
            resources:    cell(r, I.Resources),
            duration:     cell(r, I.Duration),
            availability: cell(r, I.Availability),
            link:         cell(r, I.Link),
            linkLabel:    cell(r, I.Link_Label) || 'Open →',
            tags:         cell(r, I.Tags),
            active:       cell(r, I.Active).toLowerCase(),
            extraLinks:   cell(r, I.Extra_Links)
          };
        })
        .filter(function(p) { return p.active === 'yes' && p.title && p.cat && p.link; })
        .sort(function(a, b) { return a.sort - b.sort; });

      /* group by category, preserving first-seen order */
      allItems.forEach(function(item) {
        if (!catMap[item.cat]) {
          catMap[item.cat] = [];
          catOrder.push(item.cat);
        }
        catMap[item.cat].push(item);
      });

      render('');

      /* wire search */
      if (searchEl) {
        searchEl.addEventListener('input', function() {
          render(this.value.trim().toLowerCase());
        });
      }
    })
    .catch(function(err) {
      console.error('[training-hub.js]', err);
      feed.innerHTML = '<div class="card"><p style="color:#ef4444;font-size:13px;padding:4px 0;margin:0;">Content could not be loaded. Please check your connection.</p></div>';
    });

  /* ── render ───────────────────────────────────────────────────────── */
  function render(query) {
    var html = '';
    var total = 0;

    catOrder.forEach(function(catKey) {
      var items = catMap[catKey];
      var filtered = query
        ? items.filter(function(item) {
            var hay = (item.title + ' ' + item.desc + ' ' + item.tags + ' ' + item.cat).toLowerCase();
            return hay.indexOf(query) >= 0;
          })
        : items;

      if (!filtered.length) return;
      total += filtered.length;

      var p = pal(catKey);

      /* section header */
      html += '<div class="td-section" style="margin-bottom:28px;">';
      html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid ' + p.bd + ';">';
      html += '<span style="color:' + p.c + ';display:flex;align-items:center;">' + (icon(catKey) || '') + '</span>';
      html += '<h2 style="margin:0;font-size:16px;font-weight:700;color:#1e293b;">' + esc(catKey) + '</h2>';
      html += '<span style="margin-left:auto;font-size:12px;color:#94a3b8;">' + filtered.length + ' ' + (filtered.length === 1 ? 'item' : 'items') + '</span>';
      html += '</div>';

      /* card grid */
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:12px;">';
      filtered.forEach(function(item) {
        html += card(item, p);
      });
      html += '</div></div>';
    });

    if (query && !total) {
      html = '<div class="card" style="text-align:center;padding:36px 20px;color:#94a3b8;">'
           + 'No results for "' + esc(query) + '"</div>';
    }

    feed.innerHTML = html || '<div class="card" style="padding:24px;color:#94a3b8;font-size:14px;">No content found.</div>';

    if (countEl) {
      countEl.textContent = total + ' ' + (total === 1 ? 'item' : 'items');
    }
  }

  /* ── file type helper ────────────────────────────────────────────── */
  function fileLabel(url, fallback) {
    if (!url) return fallback;
    var u = url.toLowerCase();
    if (u.indexOf('.pptx') >= 0 || u.indexOf('.ppt') >= 0) return 'Download Presentation';
    if (u.indexOf('.pdf')  >= 0) return 'Download PDF';
    if (u.indexOf('.docx') >= 0 || u.indexOf('.doc') >= 0) return 'Download Document';
    return fallback;
  }

  /* ── parse Extra_Links: "Label|URL||Label|URL" ────────────────────── */
  function parseExtra(str) {
    if (!str) return [];
    return str.split('||').map(function(e) {
      var i = e.indexOf('|');
      if (i < 0) return null;
      return { label: e.slice(0, i).trim(), url: e.slice(i + 1).trim() };
    }).filter(function(e) { return e && e.label && e.url; });
  }

  /* ── single card ──────────────────────────────────────────────────── */
  function card(item, p) {
    var isGuide    = item.type.toLowerCase() === 'guide';
    var isTraining = item.type.toLowerCase() === 'training';
    var extras     = parseExtra(item.extraLinks);

    /* auto-detect better download label */
    var dlLabel = (item.linkLabel === 'Download Guide' || item.linkLabel === 'Open →')
      ? fileLabel(item.link, item.linkLabel)
      : item.linkLabel;

    var html = '<div style="background:#fff;border:1.5px solid ' + p.bd
             + ';border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;'
             + 'gap:8px;transition:box-shadow .15s,border-color .15s;"'
             + ' onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,.08)\';this.style.borderColor=\'' + p.c + '40\'"'
             + ' onmouseout="this.style.boxShadow=\'\';this.style.borderColor=\'' + p.bd + '\'">';

    /* type label */
    html += '<div style="font-size:10px;font-weight:700;color:' + p.c
          + ';text-transform:uppercase;letter-spacing:.07em;">'
          + esc(item.cat) + ' &middot; ' + esc(item.type) + '</div>';

    /* title */
    html += '<div style="font-weight:600;font-size:14px;color:#1e293b;line-height:1.4;">'
          + esc(item.title) + '</div>';

    /* description */
    if (item.desc) {
      html += '<div style="font-size:12.5px;color:#64748b;line-height:1.5;flex:1;">'
            + esc(item.desc) + '</div>';
    }

    /* meta + action row */
    html += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;">';

    /* badges */
    if (isGuide) {
      if (item.steps)     html += badge(item.steps + ' Steps');
      if (item.resources) html += badge(item.resources + ' Documents');
    }
    if (isTraining && item.duration) html += badge(item.duration);
    if (item.availability) {
      var av  = item.availability.toLowerCase();
      var avc = av === 'free' ? p.c : av === 'paid' ? '#dc2626' : '#d97706';
      var avb = av === 'free' ? p.bg : av === 'paid' ? '#fef2f2' : '#fffbeb';
      html += '<span style="background:' + avb + ';color:' + avc + ';border:1px solid ' + p.bd
            + ';border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;">'
            + esc(item.availability) + '</span>';
    }

    /* primary download button */
    html += '<span style="margin-left:auto;">';
    html += '<a href="' + esc(item.link) + '" target="_blank" rel="noopener"'
          + ' style="display:inline-flex;align-items:center;gap:4px;padding:5px 12px;'
          + 'background:' + p.c + ';color:#fff;border-radius:8px;font-size:12px;font-weight:500;'
          + 'text-decoration:none;white-space:nowrap;transition:opacity .15s;"'
          + ' onmouseover="this.style.opacity=\'.82\'" onmouseout="this.style.opacity=\'1\'">'
          + esc(dlLabel) + '</a>';
    html += '</span>';

    html += '</div>';

    /* ── extra links: collapsible ─────────────────────────────────── */
    if (extras.length) {
      html += '<details style="margin-top:2px;">'
            + '<summary style="cursor:pointer;font-size:11.5px;font-weight:600;color:' + p.c
            + ';list-style:none;display:flex;align-items:center;gap:5px;user-select:none;">'
            + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"'
            + ' style="transition:transform .2s;" class="td-chevron"><polyline points="6 9 12 15 18 9"/></svg>'
            + extras.length + ' more document' + (extras.length > 1 ? 's' : '') + '</summary>'
            + '<div style="margin-top:8px;display:flex;flex-direction:column;gap:5px;">';
      extras.forEach(function(e) {
        var exLabel = fileLabel(e.url, e.label);
        html += '<a href="' + esc(e.url) + '" target="_blank" rel="noopener"'
              + ' style="display:flex;align-items:center;justify-content:space-between;'
              + 'padding:6px 10px;background:' + p.bg + ';border:1px solid ' + p.bd
              + ';border-radius:8px;font-size:12px;font-weight:500;color:' + p.c
              + ';text-decoration:none;"'
              + ' onmouseover="this.style.opacity=\'.75\'" onmouseout="this.style.opacity=\'1\'">'
              + '<span>' + esc(exLabel) + '</span>'
              + '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
              + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>'
              + '<polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
              + '</a>';
      });
      html += '</div></details>';
    }

    html += '</div>';
    return html;
  }

  function badge(text) {
    return '<span style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;'
         + 'padding:2px 8px;font-size:11px;font-weight:500;color:#475569;white-space:nowrap;">'
         + esc(text) + '</span>';
  }

})();
