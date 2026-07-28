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

  /* ── step-by-step guide data (keyed by card title) ───────────────── */
  var STEPS = {
    'I want to develop a staff member': {
      subtitle: 'Where to start, how to assess, choose focus areas, build a plan and follow through.',
      cat: 'develop people',
      items: [
        { title: 'Start with a simple 1:1 conversation', desc: 'Ask: where is this person growing? Where are they stuck? What does their role need from them in 6 months?' },
        { title: 'Assess growth needs with the SDF lens', desc: 'Use the Staff Development Assessment Form. Look at character, skill and leadership — combine your observation with their self-assessment.' },
        { title: 'Choose 2–3 focus areas', desc: "Don't try to grow everything at once. Pick the 2–3 areas that matter most for the role and the season." },
        { title: 'Build a simple Individual Development Plan', desc: 'Use the IDP form. Each focus area gets one practical action and a review date.' },
        { title: 'Follow up monthly', desc: 'Plan a 30-minute monthly check-in. Celebrate progress, name what is hard, adjust the plan. The Monthly Reflection Guide helps.' },
        { title: 'Connect training with real work', desc: "Always link a training back to a real situation in the staff member's work this month." }
      ]
    },
    'I want to build a development plan': {
      subtitle: 'A 6–12 month plan with focus areas, goals, action steps and a review rhythm.',
      cat: 'develop people',
      items: [
        { title: 'Open the IDP form', desc: "Use the Individual Development Plan (IDP) form — it is the standard tool for every staff member's growth plan." },
        { title: 'Pick a horizon you can see', desc: '6 months is great for new staff, 12 months for emerging leaders. For long-term potential, sketch a 3-year outline too.' },
        { title: 'Write goals and action steps', desc: 'For each focus area: 1 outcome and 2–3 concrete actions. Make them SMART — specific, measurable, achievable, relevant, time-bound.' },
        { title: 'Agree on a review rhythm', desc: 'Monthly check-ins, quarterly review. Put the dates in the calendar now, not later.' },
        { title: 'Track progress', desc: 'Use the Staff Progress Tracker so nothing gets lost between conversations.' }
      ]
    },
    'I want to coach a staff member': {
      subtitle: 'A simple coaching rhythm using listening, growth and accountability questions.',
      cat: 'develop people',
      items: [
        { title: 'Open with listening questions', desc: "Tell me what's going well. What's hard right now? What's draining you? What's giving you energy?" },
        { title: 'Move to growth questions', desc: "What do you most want to grow in? What would 'better' look like in 3 months? What's one small step?" },
        { title: 'Follow up on last time', desc: "What did you try since last time? What worked? What didn't? What did you learn?" },
        { title: 'Close with accountability questions', desc: "Who else needs to know? When will you do it? How will I know it's done?" },
        { title: 'Keep notes', desc: 'Use the Coaching Template to record agreements and topics — it makes the next conversation twice as good.' }
      ]
    },
    'I want to run the Annual Performance Review (APR)': {
      subtitle: 'The yearly conversation to celebrate progress, name growth and set goals — step by step.',
      cat: 'develop people',
      items: [
        { title: 'Schedule 2 weeks ahead', desc: "Book the APR conversation early and share the forms, so both sides can prepare without pressure. Check the APR timeline for the season's deadlines." },
        { title: 'Staff fills the self-reflection', desc: 'Send the Questionnaire / self-reflection sheet. Read it carefully before the conversation.' },
        { title: 'You prepare the leader review', desc: 'Fill the Appraisal Review Form. Follow the APR Flow for Leaders — it walks you through the whole process.' },
        { title: 'Hold the conversation (60–90 min)', desc: 'Open with care and specific encouragement. Listen more than you speak in the first half. Be clear AND kind on areas to grow.' },
        { title: 'Agree on 2–3 goals', desc: 'Not 10. Connect them to the Individual Development Plan.' },
        { title: 'Follow up through the year', desc: "Monthly check-ins keep the APR alive — it's a rhythm, not a one-off event." }
      ]
    },
    'I want to give feedback': {
      subtitle: 'Clear, kind, specific and forward-looking — feedback as a gift.',
      cat: 'communicate & feedback',
      items: [
        { title: 'Be clear AND kind', desc: 'Vague feedback is unkind. Cruel feedback is not love. Aim for both clarity and kindness.' },
        { title: 'Use a simple structure', desc: "Context → specific observation → impact → what I'd love to see next → their response." },
        { title: 'Make it concrete', desc: "'In yesterday's meeting, when X happened, I noticed Y. The impact was Z. I'd love to see…'" },
        { title: 'Give encouraging feedback too', desc: 'Feedback is not only correction. Specific, honest encouragement builds people faster than criticism ever will.' },
        { title: 'Teach your team to receive feedback', desc: "A feedback culture has two sides — use the 'Receiving Feedback' material with your team." }
      ]
    },
    'I want to handle a difficult conversation': {
      subtitle: 'Prepare well, stay respectful and clear, and follow up.',
      cat: 'communicate & feedback',
      items: [
        { title: 'Prepare in writing', desc: "Write down: the facts, the impact, what you want from this conversation, and your own emotion. Don't go in cold." },
        { title: 'Open with care, name the issue clearly', desc: 'Open with care → name the issue clearly → listen fully → ask their view → agree on next steps.' },
        { title: 'Soft on the person, clear on the issue', desc: 'Slow down, breathe, restate when needed. Respect and clarity are not opposites.' },
        { title: "Don't break the silence culture", desc: "Unspoken issues grow. 'Break the Silence' shows why speaking up early — kindly — protects people and the team." },
        { title: 'Follow up within 24 hours', desc: 'Always follow up in writing. Keep agreements small and specific.' }
      ]
    },
    'I want to resolve a conflict in my team': {
      subtitle: 'Understand the conflict, get both sides talking, and lead them to a workable agreement.',
      cat: 'communicate & feedback',
      items: [
        { title: 'Act early', desc: 'Conflicts escalate in levels. The earlier you step in, the more options everyone still has.' },
        { title: 'Understand before you mediate', desc: 'Talk to each person separately first. Listen for interests behind the positions — what does each person actually need?' },
        { title: 'Bring them together', desc: 'Set ground rules: one speaks, the other listens and repeats back what they heard. Facts first, feelings second, solutions last.' },
        { title: 'Lead to a workable agreement', desc: 'Small, concrete, written. Who does what by when? When do we check in again?' },
        { title: 'Follow up', desc: 'A conflict is resolved when cooperation works again — not when the meeting ends. Check in after 1–2 weeks.' }
      ]
    },
    'I want to understand different personalities': {
      subtitle: 'Not everyone communicates like you. DISC helps you reach each person on your team.',
      cat: 'communicate & feedback',
      items: [
        { title: 'Learn the four DISC styles', desc: 'Dominant, Influencing, Steady, Conscientious — each style hears, decides and works differently.' },
        { title: 'Spot the styles on your team', desc: 'Who needs the big picture? Who needs details? Who needs time? Who needs energy? Use the overview sheet.' },
        { title: 'Adapt how you communicate', desc: 'Same message, different delivery: direct and short for D, enthusiastic for I, personal and patient for S, precise for C.' },
        { title: 'Use it for delegation and feedback', desc: 'Personality shapes how people receive feedback and take on tasks. Match your approach and watch resistance drop.' }
      ]
    },
    'I want to run good 1:1s and team meetings': {
      subtitle: "Meetings people don't dread: clear purpose, clear rhythm, clear follow-up.",
      cat: 'lead the team',
      items: [
        { title: 'Give every meeting a purpose', desc: "Information, decision, or development? If you can't name the purpose, cancel the meeting." },
        { title: 'Keep a steady 1:1 rhythm', desc: "30 minutes, every 2–4 weeks, their agenda first. Ask: what's going well, what's hard, where do you need me?" },
        { title: 'Prepare an agenda — even a small one', desc: '3 points sent in advance beat 10 points invented in the room. End every topic with: who does what by when?' },
        { title: 'Start well', desc: 'A short check-in or opener changes the whole atmosphere. Two minutes of connection buy you an hour of honesty.' },
        { title: 'Write down decisions', desc: 'Short notes, shared after the meeting. Undocumented decisions get re-discussed forever.' }
      ]
    },
    'I want to delegate a task': {
      subtitle: 'Delegate or die: hand over real responsibility — without losing quality.',
      cat: 'lead the team',
      items: [
        { title: 'Choose what to delegate', desc: 'If someone else can do it 70% as well as you, delegate it. Keep only what truly needs you.' },
        { title: 'Choose the right person', desc: "Delegation is development: pick someone the task will stretch, not just someone who is free." },
        { title: 'Hand over the outcome, not the method', desc: "Describe what 'done' looks like, the deadline, and the boundaries. Let them choose the path." },
        { title: 'Agree on check-in points', desc: "Not control — support. Short check-ins at 30% and 70% catch problems while they're still small." },
        { title: 'Let them own the credit', desc: "When it succeeds, it's their win. When it fails, you debrief together. That's how people grow into leaders." }
      ]
    },
    'I want to solve a problem with my team': {
      subtitle: "A structured way from 'we have a problem' to a decision everyone carries.",
      cat: 'lead the team',
      items: [
        { title: 'Define the real problem', desc: "Write it as one sentence. Half of all 'problems' dissolve or change once they're precisely named." },
        { title: 'Collect facts before opinions', desc: 'What do we know? What do we assume? Separate the two — most bad decisions come from confusing them.' },
        { title: 'Generate options together', desc: 'Brainstorm without judging first. Quantity before quality; evaluation comes in a second round.' },
        { title: 'Decide and commit', desc: 'Pick the option, name an owner and a date. A decision without an owner is a wish.' },
        { title: 'Review what you learned', desc: "After it's done: what worked, what didn't, what will we do differently next time?" }
      ]
    },
    'I want to set goals with my team': {
      subtitle: 'SMART goals that people actually remember — and reach.',
      cat: 'lead the team',
      items: [
        { title: 'Connect goals to purpose', desc: 'People commit to goals they understand. Always answer: why does this goal matter for our mission?' },
        { title: 'Make them SMART', desc: "Specific, Measurable, Achievable, Relevant, Time-bound. 'Do better' is a hope; 'reduce response time to 24h by March' is a goal." },
        { title: 'Let the team shape them', desc: 'Goals set with people beat goals set for people. Co-created goals need no enforcement.' },
        { title: 'Keep them visible', desc: '3–5 goals max, reviewed in every team meeting. A goal nobody mentions for a month is already dead.' },
        { title: 'Celebrate reached goals', desc: 'Closure matters. Celebrate, learn, then set the next one.' }
      ]
    },
    'I want to build trust & motivation in my team': {
      subtitle: 'Trust is built in small moments — appreciation, honesty and consistency.',
      cat: 'lead the team',
      items: [
        { title: 'Go first', desc: 'Trust starts with the leader: admit mistakes, ask for feedback, keep your word. Vulnerability from the top makes honesty safe for everyone.' },
        { title: 'Build trustful relationships deliberately', desc: 'Know your people beyond their tasks. Regular personal check-ins are not lost time — they are the foundation everything else stands on.' },
        { title: 'Appreciate specifically and often', desc: "Generic praise is noise. 'You handled that parent conversation with so much patience' builds people. Catch people doing things right." },
        { title: 'Protect the team from fear', desc: "In trusting teams, people can say 'I made a mistake', 'I need help', 'I disagree' — without fear. Guard that safety fiercely." },
        { title: 'Stay consistent', desc: 'Trust grows slowly and dies fast. Consistency between your words and actions is the whole game.' }
      ]
    },
    'I want to know my leadership style': {
      subtitle: 'Six styles, one you — learn when to direct, coach, support or step back.',
      cat: 'grow as a leader',
      items: [
        { title: 'Learn the six styles', desc: "Goleman's styles — directive, visionary, affiliative, democratic, pacesetting, coaching — each has a right moment and a wrong one." },
        { title: 'Find your default', desc: "Which style do you fall back on under pressure? That's your default — useful to know, dangerous to overuse." },
        { title: 'Match the style to the situation', desc: 'New staff need direction, experienced staff need coaching, a crisis needs decisiveness, a tired team needs care.' },
        { title: 'Ask your team', desc: "The bravest step: ask 2–3 people which of your behaviours helps them most — and which doesn't." }
      ]
    },
    'I want to grow my emotional intelligence': {
      subtitle: "Self-awareness, self-management, empathy — the leader's real superpower.",
      cat: 'grow as a leader',
      items: [
        { title: 'Start with self-awareness', desc: "Name what you feel while you feel it. A leader who doesn't notice their own frustration leads with it anyway." },
        { title: 'Manage yourself before others', desc: 'The pause between trigger and reaction is where leadership happens. Breathe, then choose.' },
        { title: 'Practice empathy deliberately', desc: 'In every hard conversation ask yourself: what is this person feeling, and what do they need right now?' },
        { title: 'Use EQ in your leading', desc: 'Feedback, conflict, motivation — every leadership tool works better with emotional intelligence behind it.' }
      ]
    },
    'I want to manage my time & priorities': {
      subtitle: 'Lead your calendar, or it will lead you.',
      cat: 'grow as a leader',
      items: [
        { title: 'Decide what only you can do', desc: 'List your tasks. Mark what truly needs you as the leader — develop people, set direction, make key decisions. The rest is delegation material.' },
        { title: 'Plan the week, not the day', desc: "Block time for your priorities first — 1:1s, thinking, preparation. What isn't in the calendar doesn't happen." },
        { title: 'Batch the small stuff', desc: 'Messages and admin in 2–3 fixed slots a day, not every 5 minutes. Protect your focus blocks.' },
        { title: 'Review weekly', desc: 'Regularly ask: what moved the mission forward? What stole time? Adjust the week accordingly.' }
      ]
    }
  };

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
      if (item.steps) {
        if (STEPS[item.title]) {
          html += '<button onclick="ICF_TD.showSteps(this.dataset.t)" data-t="' + esc(item.title) + '" '
                + 'style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:500;color:' + p.c + ';white-space:nowrap;cursor:pointer;transition:background .15s,border-color .15s;" '
                + 'onmouseover="this.style.background=\'' + p.bg + '\';this.style.borderColor=\'' + p.bd + '\'" '
                + 'onmouseout="this.style.background=\'#f1f5f9\';this.style.borderColor=\'#e2e8f0\'">'
                + item.steps + ' Steps ▾</button>';
        } else {
          html += badge(item.steps + ' Steps');
        }
      }
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

  /* ── steps modal ──────────────────────────────────────────────────── */
  var _modalReady = false;
  function injectModal() {
    if (_modalReady) return;
    _modalReady = true;
    var el = document.createElement('div');
    el.id = 'td-steps-modal';
    el.setAttribute('style', 'display:none;position:fixed;inset:0;z-index:9999;'
      + 'background:rgba(15,23,42,.55);align-items:center;justify-content:center;'
      + 'padding:16px;box-sizing:border-box;backdrop-filter:blur(2px);');
    el.innerHTML =
      '<div id="td-steps-inner" style="background:#fff;border-radius:16px;max-width:520px;'
      + 'width:100%;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);">'
      + '<div id="td-steps-head" style="padding:20px 20px 0;position:sticky;top:0;'
      + 'background:#fff;border-radius:16px 16px 0 0;z-index:1;"></div>'
      + '<div id="td-steps-body" style="padding:10px 20px 24px;display:flex;'
      + 'flex-direction:column;gap:8px;"></div>'
      + '</div>';
    el.addEventListener('click', function(e) { if (e.target === el) hideSteps(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') hideSteps(); });
    document.body.appendChild(el);
  }

  function showSteps(title) {
    var d = STEPS[title];
    if (!d) return;
    injectModal();
    var p = pal(d.cat);
    document.getElementById('td-steps-head').innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;'
      + 'padding-bottom:14px;border-bottom:1.5px solid ' + p.bd + ';">'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="font-size:10px;font-weight:700;color:' + p.c + ';text-transform:uppercase;'
      + 'letter-spacing:.07em;margin-bottom:5px;">' + esc(d.cat) + '</div>'
      + '<div style="font-weight:700;font-size:18px;color:#1e293b;line-height:1.3;margin-bottom:5px;">'
      + esc(title) + '</div>'
      + (d.subtitle ? '<div style="font-size:12.5px;color:#64748b;line-height:1.5;">'
        + esc(d.subtitle) + '</div>' : '')
      + '</div>'
      + '<button onclick="ICF_TD.hideSteps()" style="background:none;border:none;cursor:pointer;'
      + 'padding:2px 6px;color:#94a3b8;font-size:24px;line-height:1;flex-shrink:0;margin-top:-4px;'
      + 'border-radius:6px;transition:background .15s;" '
      + 'onmouseover="this.style.background=\'#f1f5f9\'" onmouseout="this.style.background=\'none\'">'
      + '&times;</button>'
      + '</div>';
    var bHTML = '';
    d.items.forEach(function(s, i) {
      bHTML += '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;'
             + 'padding:12px 14px;display:flex;gap:12px;align-items:flex-start;">'
             + '<div style="min-width:28px;width:28px;height:28px;border-radius:50%;'
             + 'background:' + p.bg + ';border:1.5px solid ' + p.bd + ';color:' + p.c + ';'
             + 'font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;">'
             + (i + 1) + '</div>'
             + '<div style="min-width:0;">'
             + '<div style="font-weight:600;font-size:13.5px;color:#1e293b;margin:0 0 3px;">'
             + esc(s.title) + '</div>'
             + '<div style="font-size:12.5px;color:#475569;line-height:1.5;margin:0;">'
             + esc(s.desc) + '</div>'
             + '</div></div>';
    });
    document.getElementById('td-steps-body').innerHTML = bHTML;
    var m = document.getElementById('td-steps-modal');
    m.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function hideSteps() {
    var m = document.getElementById('td-steps-modal');
    if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
  }

  window.ICF_TD = { showSteps: showSteps, hideSteps: hideSteps };

})();
