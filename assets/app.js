/* ICF Cambodia Staff Hub - shared app behavior */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

(function () {
  // ---------- Language toggle (EN ↔ KH) ----------
  // Dictionary of EN → KH for common chrome / nav labels.
  // Keys are matched case-sensitively against text-node content (trimmed).
  const KH = {
    "Home": "ដើម",
    "About ICF": "អំពី ICF",
    "Staff Resources": "ធនធានបុគ្គលិក",
    "Staff Tools": "ឧបករណ៍បុគ្គលិក",
    "Training & Development": "ការបណ្តុះបណ្តាល",
    "Training &amp; Development": "ការបណ្តុះបណ្តាល",
    "Medical Hub": "មជ្ឈមណ្ឌលវេជ្ជសាស្ត្រ",
    "Media Center": "មជ្ឈមណ្ឌលប្រព័ន្ធផ្សព្វផ្សាយ",
    "Departments": "នាយកដ្ឋាន",
    "Events & Year Topics": "ព្រឹត្តិការណ៍",
    "Quick Actions": "សកម្មភាពរហ័ស",
    "Announcements": "សេចក្ដីប្រកាស",
    "Featured Resources": "ធនធានពិសេស",
    "Emergency Contacts": "ទំនាក់ទំនងបន្ទាន់",
    "Important Links": "តំណភ្ជាប់សំខាន់",
    "Search": "ស្វែងរក",
    "Resources": "ធនធាន",
    "Tools": "ឧបករណ៍",
    "Training": "បណ្តុះបណ្តាល",
    "Medical": "វេជ្ជសាស្ត្រ",
    "Media": "ប្រព័ន្ធផ្សព្វផ្សាយ",
    "Depts": "នាយក",
    "About": "អំពី",
    "Events": "ព្រឹត្តិការណ៍",
    "All Staff": "បុគ្គលិកទាំងអស់",
    "Training Hub": "មជ្ឈមណ្ឌលបណ្តុះបណ្តាល",
    "Brand Resources": "ធនធានម៉ាក",
    "Event Planner": "ផែនការព្រឹត្តិការណ៍",
    "Staff Contacts": "ទំនាក់ទំនងបុគ្គលិក",
    "Staff Telegram": "Telegram បុគ្គលិក",
    "IT Request": "សំណើ IT",
    "Leave Request": "សំណើច្បាប់ឈប់សម្រាក",
    "HR Templates": "ទម្រង់ HR",
    "Finance Forms": "ទម្រង់ហិរញ្ញវត្ថុ",
    "Child Protection": "ការការពារកុមារ",
    "Org Chart": "តារាងអង្គការ",
    "Open file": "បើកឯកសារ",
    "Open form": "បើកទម្រង់",
    "Open PDF": "បើក PDF",
    "Open template": "បើកគំរូ",
    "Open folder": "បើកថត",
    "English": "ភាសាអង់គ្លេស",
    "Khmer": "ភាសាខ្មែរ",
    "Active": "សកម្ម",
    "Draft": "ព្រាង",
    "Needs Review": "ត្រូវការពិនិត្យ",
    "Archived": "ទុកបណ្ណាសារ",
    "Quick Links": "តំណរហ័ស",
  };
  const EN_BACKUP = new WeakMap();

  function walkAndSwap(root, toKH) {
    const ignored = new Set(['SCRIPT','STYLE','SVG','PATH','INPUT','TEXTAREA','CODE','PRE']);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.parentNode || ignored.has(node.parentNode.tagName)) return NodeFilter.FILTER_REJECT;
        const t = node.nodeValue && node.nodeValue.trim();
        if (!t) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = walker.nextNode())) {
      const trimmed = n.nodeValue.trim();
      if (toKH) {
        if (KH[trimmed]) {
          if (!EN_BACKUP.has(n)) EN_BACKUP.set(n, n.nodeValue);
          n.nodeValue = n.nodeValue.replace(trimmed, KH[trimmed]);
        }
      } else {
        if (EN_BACKUP.has(n)) {
          n.nodeValue = EN_BACKUP.get(n);
        }
      }
    }
  }

  function applyLang(lang) {
    const html = document.documentElement;
    if (lang === 'km') {
      html.setAttribute('lang','km');
      walkAndSwap(document.body, true);
    } else {
      html.setAttribute('lang','en');
      walkAndSwap(document.body, false);
    }
    document.querySelectorAll('.lang-toggle__label').forEach(el => {
      el.textContent = (lang === 'km') ? 'KH' : 'EN';
    });
    try { localStorage.setItem('icf-lang', lang); } catch (e) {}
  }

  // Init from saved preference
  let savedLang = 'en';
  try { savedLang = localStorage.getItem('icf-lang') || 'en'; } catch (e) {}
  if (savedLang === 'km') {
    // Defer until DOM/body is fully parsed
    document.addEventListener('DOMContentLoaded', () => applyLang('km'));
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="toggle-lang"]');
    if (!btn) return;
    const current = document.documentElement.getAttribute('lang') === 'km' ? 'km' : 'en';
    applyLang(current === 'km' ? 'en' : 'km');
  });

  // ---------- Mobile "More" sidesheet ----------
  (function initMobileMore() {
    const sidesheet = document.getElementById('sidesheet');
    if (!sidesheet) return;

    function open() { sidesheet.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    function close() { sidesheet.classList.remove('is-open'); document.body.style.overflow = ''; }

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="open-menu"]')) { open(); return; }
      if (e.target.closest('[data-action="close-menu"]')) { close(); return; }
      if (sidesheet.classList.contains('is-open') && !e.target.closest('.sidesheet__panel')) { close(); }
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  })();

  // ---------- Hero greeting + date ----------
  (function setHeroDate() {
    const now = new Date();
    const hour = now.getHours();
    const name = 'John Doe'; // TODO: replace with logged-in user name

    const greet = hour < 5 ? '🌙 Good evening' : hour < 12 ? '☀️ Good morning' : hour < 17 ? '🌤️ Good afternoon' : '🌙 Good evening';
    const greetEl = document.getElementById('hero-greeting');
    if (greetEl) greetEl.textContent = `${greet}, ${name}!`;

    const dateEl = document.getElementById('hero-date');
    if (dateEl) {
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      dateEl.textContent = `${day} · ${date}`;
    }
  })();

  // ---------- Google Calendar — Upcoming Events ----------
  (function loadCalendarEvents() {
    const container = document.getElementById('gcal-events');
    if (!container) return;

    const CAL_ID     = 'c_19ec41b02565b57079243e9f170fa26c692c37bb0b44fccd89efd12c9971e6d9@group.calendar.google.com';
    const API_KEY    = 'AIzaSyBmEJXC-jKF9jSup7cRKF23XKOC1mdUK60';
    const maxResults = container.dataset.max || 6;
    const now        = new Date().toISOString();
    const url        = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events`
                     + `?key=${API_KEY}&timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;

    const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DAYS    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const CAL_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>`;

    function addUrl(event) {
      const start    = event.start.dateTime || event.start.date;
      const isAllDay = !event.start.dateTime;
      const sp = isAllDay
        ? (event.start.date || '').replace(/-/g,'')
        : new Date(start).toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      const endRaw = event.end && (event.end.dateTime || event.end.date);
      const ep = endRaw
        ? (event.end.dateTime
            ? new Date(event.end.dateTime).toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z'
            : (event.end.date || '').replace(/-/g,''))
        : sp;
      return `https://calendar.google.com/calendar/render?action=TEMPLATE`
        + `&text=${encodeURIComponent(event.summary || '')}`
        + `&dates=${sp}/${ep}`
        + (event.location    ? `&location=${encodeURIComponent(event.location)}`       : '')
        + (event.description ? `&details=${encodeURIComponent(event.description)}`     : '');
    }

    function dateKey(event) {
      return (event.start.date || (event.start.dateTime || '').slice(0, 10));
    }

    function renderGroup(dateStr, events) {
      const d       = new Date(dateStr + 'T00:00:00');
      const day     = d.getDate();
      const mon     = MONTHS[d.getMonth()];
      const weekday = DAYS[d.getDay()];

      const rows = events.map(ev => {
        const isAllDay = !ev.start.dateTime;
        let time = isAllDay ? 'All day' : new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (ev.location) time += ' · ' + ev.location;

        return `<div class="gcal-event-row">
          <div class="gcal-event-row__info">
            <span class="gcal-event-row__title">${ev.summary || '(No title)'}</span>
            <span class="gcal-event-row__time">${time}</span>
          </div>
          <a class="gcal-add-btn" href="${addUrl(ev)}" target="_blank" rel="noopener" title="Add to your calendar">
            ${CAL_SVG} Add to calendar
          </a>
        </div>`;
      }).join('');

      return `<div class="gcal-item gcal-item--group">
        <div class="gcal-date">
          <div class="gcal-date__day">${day}</div>
          <div class="gcal-date__mon">${mon}</div>
          <div class="gcal-date__wday">${weekday.slice(0,3)}</div>
        </div>
        <div class="gcal-divider"></div>
        <div class="gcal-info" style="flex:1;">
          ${rows}
        </div>
      </div>`;
    }

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.items || data.items.length === 0) {
          container.innerHTML = '<div class="gcal-loading">No upcoming events found.</div>';
          return;
        }
        // Group by date
        const groups = {};
        data.items.forEach(ev => {
          const key = dateKey(ev);
          groups[key] = groups[key] || [];
          groups[key].push(ev);
        });
        container.innerHTML = Object.keys(groups).sort().map(k => renderGroup(k, groups[k])).join('');
      })
      .catch(() => {
        container.innerHTML = '<div class="gcal-error">Could not load events. Make sure the calendar is public and the API key is valid.</div>';
      });
  })();

  // ---------- Favorites ----------
  (function initFavorites() {
    const STORAGE_KEY = 'icf-favorites';
    const HEART_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

    function loadFavs() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; }
    }
    function saveFavs(favs) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favs)); } catch(e) {}
    }

    // ---- Render sidebar favorites section ----
    function renderSidebarFavs() {
      const nav = document.querySelector('.sidebar .nav');
      if (!nav) return;

      // Remove existing rendered section
      const existing = nav.querySelector('.fav-section');
      if (existing) existing.remove();

      const favs = loadFavs();

      const section = document.createElement('div');
      section.className = 'fav-section';

      const label = document.createElement('div');
      label.className = 'nav__group-label';
      label.style.marginTop = '12px';
      label.textContent = 'My Favorites';
      section.appendChild(label);

      if (favs.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'nav__fav-empty';
        empty.textContent = 'Tap ♡ on any card to save it here';
        section.appendChild(empty);
      } else {
        favs.forEach(fav => {
          const a = document.createElement('a');
          a.className = 'nav__fav-item';
          a.href = fav.href;
          a.innerHTML = `${HEART_SVG}<span>${fav.label}</span>`;
          section.appendChild(a);
        });
      }

      // Insert after Quick Links group label
      const quickLinks = Array.from(nav.querySelectorAll('.nav__group-label'))
        .find(el => el.textContent.trim() === 'Quick Links');
      if (quickLinks) {
        // Insert before Quick Links
        nav.insertBefore(section, quickLinks);
      } else {
        nav.appendChild(section);
      }
    }

    // ---- Add heart buttons to all card types ----
    const CARD_DEFS = [
      { sel: 'a.hc-card',        labelSel: '.hc-card__label' },
      { sel: '.resource',         labelSel: '.resource__title', insertInto: '.resource__top' },
      { sel: 'a.dept',            labelSel: '.dept__name' },
      { sel: '.course',           labelSel: '.course__title' },
      { sel: '.tool',             labelSel: '.tool__title' },
      { sel: '.event',            labelSel: '.event__title' },
      { sel: '.media-tile',       labelSel: '.media-tile__title' },
      { sel: '.announce__item',   labelSel: 'h4' },
    ];

    function getCardKey(card) {
      // Use href for anchor cards, otherwise a slug of the title
      const href = card.getAttribute('href');
      if (href) return href;
      const title = card.querySelector('h3,h4,[class*="title"]');
      return title ? title.textContent.trim().toLowerCase().replace(/\s+/g, '-') : null;
    }

    function initCardHearts() {
      const favs    = loadFavs();
      const favKeys = favs.map(f => f.href);

      CARD_DEFS.forEach(({ sel, labelSel, insertInto }) => {
        document.querySelectorAll(sel).forEach(card => {
          if (card.querySelector('.card-fav-btn')) return;

          const labelEl   = card.querySelector(labelSel);
          const labelText = labelEl ? labelEl.textContent.trim() : '';
          const key       = getCardKey(card);
          if (!key) return;

          const btn = document.createElement('button');
          btn.className = 'card-fav-btn' + (favKeys.includes(key) ? ' is-fav' : '');
          btn.setAttribute('aria-label', 'Bookmark');
          btn.innerHTML = HEART_SVG;

          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            let favs = loadFavs();
            const idx = favs.findIndex(f => f.href === key);
            const isFav = idx > -1;

            if (isFav) { favs.splice(idx, 1); } else { favs.push({ label: labelText, href: key }); }

            saveFavs(favs);
            renderSidebarFavs();

            document.querySelectorAll('.card-fav-btn').forEach(b => {
              const parent = b.closest(CARD_DEFS.map(d => d.sel).join(','));
              if (parent && getCardKey(parent) === key) {
                b.classList.toggle('is-fav', !isFav);
              }
            });
          });

          // Insert into a specific sub-container if defined, otherwise append to card root
          const target = insertInto ? card.querySelector(insertInto) : card;
          (target || card).appendChild(btn);
        });
      });
    }

    renderSidebarFavs();
    initCardHearts();

    // Expose for pages that inject cards dynamically (e.g. resources.html)
    window.initCards = function() {
      renderSidebarFavs();
      initCardHearts();
    };
  })();

  // ---------- Mobile sidesheet ----------
  const menuBtn = document.querySelector('[data-action="open-menu"]');
  const sheet = document.querySelector('#sidesheet');
  if (menuBtn && sheet) {
    menuBtn.addEventListener('click', () => sheet.classList.add('is-open'));
    sheet.addEventListener('click', (e) => {
      if (e.target === sheet || e.target.closest('[data-action="close-menu"]')) {
        sheet.classList.remove('is-open');
      }
    });
  }

  // ---------- Search modal ----------
  const searchBtn = document.querySelectorAll('[data-action="open-search"]');
  const searchModal = document.querySelector('#search-modal');
  const searchInput = document.querySelector('#search-modal input');
  const searchResults = document.querySelector('#search-results');

  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add('is-open');
    setTimeout(() => searchInput && searchInput.focus(), 50);
  }
  function closeSearch() {
    searchModal && searchModal.classList.remove('is-open');
  }
  searchBtn.forEach(b => b.addEventListener('click', openSearch));
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') closeSearch();
  });

  // ---------- Search index (real docs from Resources Public + Webhubs) ----------
  const INDEX = [
    // Child protection
    { t: 'Child Protection Policy 2024 (English)', g: 'Child Protection', h: 'Resources%20Public/5-%20Child%20Protection%20%26%20Information%20Sharing/Child%20Protection%20Policy%202024%20-%20English.pdf', i: 'shield' },
    { t: 'Child Protection Policy 2024 (Khmer)',   g: 'Child Protection', h: 'Resources%20Public/5-%20Child%20Protection%20%26%20Information%20Sharing/Child%20Protection%20Policy%202024.pdf', i: 'shield' },
    { t: 'Implementation – Child Protection',      g: 'Child Protection', h: 'Resources%20Public/5-%20Child%20Protection%20%26%20Information%20Sharing/Implementation%20-%20Child%20Protection%20Policy%20.pdf', i: 'shield' },
    { t: 'Information Sharing & Communication',    g: 'Child Protection', h: 'Resources%20Public/5-%20Child%20Protection%20%26%20Information%20Sharing/Information%20Sharing%20and%20Communication%20Guidelines%20%28Khmer-English%29.pdf', i: 'shield' },
    { t: 'Consent Form · Information Gathering',   g: 'Child Protection', h: 'Resources%20Public/5-%20Child%20Protection%20%26%20Information%20Sharing/Consent%20Form%20Information%20Gathering.pdf', i: 'file' },
    { t: 'Self-Declaration Form',                  g: 'Child Protection', h: 'Resources%20Public/5-%20Child%20Protection%20%26%20Information%20Sharing/Self%20Declaration%20Form%20English_Khmer%20V2%20IN%20PROCESS%20%28Khmer-English%29.pdf', i: 'file' },
    { t: 'Social Media Policy',                    g: 'Child Protection', h: 'Resources%20Public/5-%20Child%20Protection%20%26%20Information%20Sharing/Social%20Media%20Policy.pdf', i: 'message' },

    // Guidelines
    { t: 'Code of Conduct (English)',              g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/2_COD%20OF%20CONDUCT/ICF%20Code%20of%20Conduct_ENG.pdf', i: 'file' },
    { t: 'Code of Conduct (Khmer)',                g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/2_COD%20OF%20CONDUCT/ICF%20Code%20of%20Conduct_KH.pdf', i: 'file' },
    { t: 'Communication Guideline',                g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/3_COMMUNICATION%20GUIDELINE/COMMUNICATION%20GUIDELINE-EN.pdf', i: 'message' },
    { t: 'Relationship Guideline (EN)',            g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/7_RELATIONSHIP%20GUIDELINE/RELATIONSHIP%20GUIDELINE_EN.pdf', i: 'file' },
    { t: 'Phone Allowance Guideline',              g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/5_PHONE%20ALLOWANCE%20GUIDLINE/Phone%20Allowance%20Guideline%20%281%29.pdf', i: 'file' },
    { t: 'Training Commitment Form',               g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/10_TRAINING%20COMMITMENT/HR-TRAINING%20COMMITMENT%20FORM-Latest.pdf', i: 'graduation' },
    { t: 'Shared Hour Request Form',               g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/8_SHARE%20HOUR%20FORM/Shared%20Hour%20Request%20Form.pdf', i: 'calendar' },
    { t: 'Relationship Guideline (KH)',            g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/7_RELATIONSHIP%20GUIDELINE/RELATIONSHIP%20GUIDELINE_KH.pdf', i: 'file' },
    { t: 'Phone Allowance Guideline (KH)',         g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/5_PHONE%20ALLOWANCE%20GUIDLINE/Khmer%20Phone%20Allowance%20Guideline.pdf', i: 'file' },
    { t: 'Local Volunteers Commitment Form',       g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/13_LOCAL%20VOLUNTEERS/Commitment%20Agreement%20Form.docx', i: 'file' },
    { t: 'Local Volunteers (English)',             g: 'HR Guidelines', h: 'Resources%20Public/3_%20GUIDELINES%20/13_LOCAL%20VOLUNTEERS/Archive/ENGL_Local%20Volunteer%20Committment%20Form.pdf', i: 'file' },
    { t: 'Campus Guideline 2024',                  g: 'Campus',        h: 'Resources%20Public/3_%20GUIDELINES%20/9_CAMPUS%20GUIDELINE/CAMPUS%20GUIDELINE_EN.pdf', i: 'map' },
    { t: 'Kitchen Policy 2024',                    g: 'Campus',        h: 'Resources%20Public/3_%20GUIDELINES%20/14_KITCHEN%20GUIDELINE/ICF_%20Kitchen%20Policy%202024_EN.pdf', i: 'file' },
    { t: 'Baby Gift Guideline',                    g: 'Allowances',    h: 'Resources%20Public/3_%20GUIDELINES%20/1_EMPLOYMENT%20GUIDLINE/KH%20%26%20Eng%20ICF_BABY%20GIFT%202025.pdf', i: 'file' },
    { t: 'Funeral Fund Guideline',                 g: 'Allowances',    h: 'Resources%20Public/3_%20GUIDELINES%20/1_EMPLOYMENT%20GUIDLINE/Kh%20%26%20Eng%20ICF_FUNERAL%20FUND.docx.pdf', i: 'file' },
    { t: 'Child Education Allowance Guideline',    g: 'Allowances',    h: 'Resources%20Public/3_%20GUIDELINES%20/6_CHILD%20ALLOWANCE%20%26%20FORMS/Child%20Education%20Allowance%20Guideline.docx.pdf', i: 'file' },
    { t: 'Child School Allowance Form',            g: 'Allowances',    h: 'Resources%20Public/3_%20GUIDELINES%20/6_CHILD%20ALLOWANCE%20%26%20FORMS/Child%20School%20Allowance%20Form%20KH-EN%20%281%29%20%281%29.pdf', i: 'file' },
    { t: 'Lunch Form',                             g: 'Allowances',    h: 'Resources%20Public/3_%20GUIDELINES%20/6_CHILD%20ALLOWANCE%20%26%20FORMS/Lunch%20Form/Request%20Lunch%20Form%20KH-EN.pdf', i: 'file' },
    { t: 'Child Allowance Guideline (KH)',         g: 'Allowances', h: 'Resources%20Public/3_%20GUIDELINES%20/6_CHILD%20ALLOWANCE%20%26%20FORMS/Khmer%20Child%20Allowance%20Guideline.pdf', i: 'file' },

    // Employee life cycle
    { t: 'Employment Contract Template (EN)',      g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/1_WORKING%20CONTRACT%20TEMPLATE/Template%20Employment%20Contract.docx%20%281%29.docx', i: 'file' },
    { t: 'Employment Contract Template (KH)',      g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/1_WORKING%20CONTRACT%20TEMPLATE/Khmer%20Template%20Employment%20Contract.docx%20-%20Copy.pdf', i: 'file' },
    { t: 'Probation Evaluation Form (EN)',         g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/2_PROBATION%20EVALUATION%20FORM/Probation%20Evaluation%20Form.ENG.docx', i: 'file' },
    { t: 'Annual Performance Review Form (EN)',    g: 'Performance Review',  h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/3_RETENTION%20FORM/Annual%20Performance%20Review/Annual%20Appraisal%20Review%20Form_ENG%202024.docx', i: 'check' },
    { t: 'Annual Performance Review Form (KH)',    g: 'Performance Review',  h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/3_RETENTION%20FORM/Annual%20Performance%20Review/Annual%20Appraisal%20Review%20Form_KH%202024.docx', i: 'check' },
    { t: 'Performance Review Guideline',           g: 'Performance Review',  h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/3_RETENTION%20FORM/Annual%20Performance%20Review/Guideline%20Performance%20Review.pdf', i: 'check' },
    { t: 'Staff Transfer Form',                    g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/3_RETENTION%20FORM/Staff%20Transfer/Staff%20Transfer%20Form%20.docx', i: 'file' },
    { t: 'Warning Letter (EN)',                    g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/4_WARNING%20TEMPLATE/1.%20Warning%20Letter.pdf', i: 'file' },
    { t: 'Resignation Form',                       g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/5_RESIGNATION%20FORM/Resignation%20Form%20KH-EN-V1%20%281%29.pdf', i: 'file' },
    { t: 'Promotion Form',                         g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/6_PROMOTION%20FORM/%20Promotion%20Form_Update.docx', i: 'file' },
    { t: 'Trainee Evaluation Form',                g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/7_TRAINEE%20EVALUATION%20FORM/Trainee%20Review%20Form.docx', i: 'file' },
    { t: 'Probation Evaluation Form (KH)',         g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/2_PROBATION%20EVALUATION%20FORM/Probation%20Evaluationg%20Form.KH.docx', i: 'file' },
    { t: 'Improvement Plan Form',                  g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/2_PROBATION%20EVALUATION%20FORM/Improvement%20Plan%20Form.docx', i: 'file' },
    { t: 'Employee of the Month Guideline',        g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/3_RETENTION%20FORM/Employee%20of%20the%20Month%20Guideline%20/Employee%20of%20The%20Month%20Guideline.pdf', i: 'file' },
    { t: 'Warning Letter (KH)',                    g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/4_WARNING%20TEMPLATE/1.%20Khmer%20Warning%20Letter.pdf', i: 'file' },
    { t: 'One-on-One Discussion Form',             g: 'Employee Life Cycle', h: 'Resources%20Public/2_%20EMPLOYEE%20LIFE%20CYCLE/4_WARNING%20TEMPLATE/One%20On%20One%20Discussion%20Form%20KH-EN.pdf', i: 'file' },

    // Recruitment
    { t: 'Recruitment Workflow',                   g: 'Recruitment', h: 'Resources%20Public/1_RECRUITMENT/1_RECRUITMENT%20GUIDELINE%20/ICF-%20Recruitment%20Workflow.pdf', i: 'check' },
    { t: 'Hiring Request',                         g: 'Recruitment', h: 'Resources%20Public/1_RECRUITMENT/2_REQUEST%20NEW%20STAFF%20TEMPLATE/2%20-%20Hiring%20Request-%20HR-ICF-2019.docx', i: 'file' },
    { t: 'Job Description Template 2026',          g: 'Recruitment', h: 'Resources%20Public/1_RECRUITMENT/2_REQUEST%20NEW%20STAFF%20TEMPLATE/1%20-%20Job%20Description-HR-ICF-New%20templete-2026.docx', i: 'file' },
    { t: 'Interview Form',                         g: 'Recruitment', h: 'Resources%20Public/1_RECRUITMENT/3_INTERVIEW%20%26%20REFERENCE%20CHECK%20FORM/Interview%20Form-ICF-HR-2019%20-%20Copy.docx', i: 'file' },
    { t: 'Reference Check',                        g: 'Recruitment', h: 'Resources%20Public/1_RECRUITMENT/3_INTERVIEW%20%26%20REFERENCE%20CHECK%20FORM/Reference%20check-ICF-HR-2019.docx', i: 'file' },
    { t: 'Capture Success Profile (2026)',         g: 'Recruitment', h: 'Resources%20Public/1_RECRUITMENT/2_REQUEST%20NEW%20STAFF%20TEMPLATE/3%20-%20Capture%20Success%20Profile%20From-2026_.docx', i: 'file' },
    { t: 'Referral Rock Star',                     g: 'Recruitment', h: 'Resources%20Public/1_RECRUITMENT/4_REFERRAL%20ROCKSTAR%20FORM/Referral%20Rock%20Star.pdf', i: 'file' },
    { t: 'Holidays Calendar 2026',                 g: 'Calendars',   h: 'Resources%20Public/1_RECRUITMENT/HOLIDAYS%20CALENDAR%202026.pdf', i: 'calendar' },
    { t: 'Payroll Calendar 2026',                  g: 'Calendars',   h: 'Resources%20Public/1_RECRUITMENT/PAYROLL%20CALENDAR%202026.pdf', i: 'calendar' },

    // Finance
    { t: 'Financial Policy & Procedures (V3)',     g: 'Finance', h: 'Resources%20Public/1-%20Finance/3-%20Finance%20Policy/Financial%20Policy%20and%20Procedures_Eng_V3.pdf', i: 'dollar' },
    { t: 'Travel Expense Policy 2025',             g: 'Finance', h: 'Resources%20Public/1-%20Finance/3-%20Finance%20Policy/Travel%20Expense%20Policy%20For%20Staff-2025.pdf', i: 'dollar' },
    { t: 'Finance Refresher Training (Sep 2025)',  g: 'Finance', h: 'Resources%20Public/1-%20Finance/2-%20Finance%20Policy%20Training/3-%20Refresher%20Training%2019-Sep-2025/Refresher%20Training%20Finance%20Policy.pdf', i: 'graduation' },
    { t: 'Finance Forms · NGO',                    g: 'Finance', h: 'Resources%20Public/1-%20Finance/1-%20Finance%20Forms/1-%20NGO', i: 'dollar' },
    { t: 'Finance Forms · Church',                 g: 'Finance', h: 'Resources%20Public/1-%20Finance/1-%20Finance%20Forms/2-%20CHURCH', i: 'dollar' },

    // Insurance / Pension
    { t: 'ICF Retirement & NSSF Guideline',        g: 'Insurance & Pension', h: 'Resources%20Public/3_%20GUIDELINES%20/4_ICF%20RETIREMENT%20PLAN%20%26%20PENSION%20PLAN/ICF%20Retirement%20%26%20NSSF%20Pension%20Guideline%20.docx%20%281%29.pdf', i: 'shield' },
    { t: 'NSSF Insurance (folder)',                g: 'Insurance & Pension', h: 'Resources%20Public/4_INSURANCE/NSSF%20INSURANCE', i: 'shield' },
    { t: 'Phillip Insurance (folder)',             g: 'Insurance & Pension', h: 'Resources%20Public/4_INSURANCE/PHILLIP%20INSURANCE%20', i: 'shield' },

    // Medical Webhub
    { t: 'Common Cold',                            g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/Common%20Cold.docx', i: 'medical' },
    { t: 'Eye Infection',                          g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/Eye%20Infection.docx/Eye%20Infection.docx.pdf', i: 'medical' },
    { t: 'First Aid · Sprains',                    g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/First%20Aid%20Sprains.docx/First%20aid%20Sprains.docx.pdf', i: 'medical' },
    { t: 'Open Wounds and Cuts',                   g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/Open%20Wounds%20and%20Cuts.docx/Open%20wounds%20and%20cuts.docx.pdf', i: 'medical' },
    { t: 'Nose Bleeding',                          g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/Nose%20Bleeding.docx/Nouse%20Bleeding%20.pdf', i: 'medical' },
    { t: 'Mouth & Gum Infection',                  g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/Mouth%20and%20Guminfection.docx/Mouth%20and%20Guminfection.docx.pdf', i: 'medical' },
    { t: 'When to use Cold or Heat',               g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/When%20to%20use%20Cold%20and%20heat.%20Docx/when%20to%20use%20cold%20or%20heat.docx.pdf', i: 'medical' },
    { t: 'Preventing Hemorrhoids',                 g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/How%20to%20Prevent%20Hemorrhoids.Docx/How%20to%20Prevent%20Hemorrhoids.docx.pdf', i: 'medical' },
    { t: 'Feeling Weak',                           g: 'Medical', h: 'Medical%20Webhub/Ressource%20Center/Feeling%20Weak.%20Docx/Feeling%20weak_%20It%E2%80%99s%20not%20always%20%E2%80%9ELow%20red%20blood%20Cells%E2%80%9C.docx.pdf', i: 'medical' },

    // Brand & Media
    { t: 'ICF Corporate Design Guide',             g: 'Brand & Media', h: 'Resources%20Public/1_RECRUITMENT/ICF%20Corporate%20Design%20-%20Updated%20May%202025%20-%20EN.pdf', i: 'palette' },
    { t: 'ICF Cambodia Logo (Primary)',            g: 'Brand & Media', h: 'Resources%20Public/4-%20Graphic%20Resources/01%20Logo/00%20ICF%20Main%20Logo/ICF%20Cambodia%20Logo/01%20Primary', i: 'image' },
    { t: 'ICF Main Logo',                          g: 'Brand & Media', h: 'Resources%20Public/4-%20Graphic%20Resources/01%20Logo/00%20ICF%20Main%20Logo/ICF%20Main%20Logo', i: 'image' },
    { t: 'ICF Kids Logo',                          g: 'Brand & Media', h: 'media.html', i: 'image' },
    { t: 'ICF Youth Logo',                         g: 'Brand & Media', h: 'media.html', i: 'image' },
    { t: 'ICF Siem Reap Logo',                     g: 'Brand & Media', h: 'media.html', i: 'image' },
    { t: 'Leadership Academy Logo',                g: 'Brand & Media', h: 'media.html', i: 'image' },
    { t: 'Money Boss Club Logo',                   g: 'Brand & Media', h: 'media.html', i: 'image' },
    { t: 'Sponsorship Logos',                      g: 'Brand & Media', h: 'media.html', i: 'image' },
    { t: 'Discover Course Logo',                   g: 'Brand & Media', h: 'media.html', i: 'image' },
    { t: 'Flama Semicondensed Font',               g: 'Brand & Media', h: 'Resources%20Public/4-%20Graphic%20Resources/Flama-Semicondensed%20Font', i: 'palette' },

    // Training & Development Webhub
    { t: 'T&D Webhub — Develop People',            g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/develop', i: 'graduation' },
    { t: 'T&D Webhub — Framework (Heart Head Hands)', g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/framework', i: 'graduation' },
    { t: 'T&D Webhub — Training Directory',        g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/training', i: 'graduation' },
    { t: 'T&D Webhub — Teaching Directory',        g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/teaching', i: 'book' },
    { t: 'T&D Webhub — APR Center',                g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/apr', i: 'check' },
    { t: 'T&D Webhub — Training Request',          g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/request', i: 'file' },
    { t: 'T&D Webhub — Templates & Forms',         g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/templates', i: 'file' },
    { t: 'T&D Webhub — Devotionals',               g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Training%20%26%20Development%20Webhub/index.html#/devotionals', i: 'book' },
    { t: 'Self-paced Library — Culture',           g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Resources/Culture', i: 'graduation' },
    { t: 'Self-paced Library — Communication',     g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Resources/Communication', i: 'message' },
    { t: 'Self-paced Library — Leadership Styles', g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Resources/Leadership%20Styles', i: 'graduation' },
    { t: 'Self-paced Library — Delegate or die',   g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Resources/Delegate%20or%20die', i: 'graduation' },
    { t: 'Self-paced Library — Money Boss',        g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Resources/Money%20Boss%20for%20New%20Staff', i: 'dollar' },
    { t: 'Self-paced Library — Spiritual',         g: 'Training & Development', h: 'Training%20%26%20Development%20Webhub/Resources/Spiritual', i: 'book' },
    { t: 'AKAS HRIS · Onboarding (EN)',            g: 'Training & Development', h: 'Resources%20Public/5_AKAS-HRIS/Akas_Onboarding_Video_English.mov', i: 'graduation' },
    { t: 'AKAS HRIS · Onboarding (KH)',            g: 'Training & Development', h: 'Resources%20Public/5_AKAS-HRIS/Akas_Onboarding_Video_Khmer.mp4', i: 'graduation' },
    { t: 'English Class Program',                  g: 'Training & Development', h: 'Resources%20Public/8_ENGLSIH%20CLASS%20PROGRAM/HR_Staff%20Development_English%20Class%20Program.pdf', i: 'globe' },

    // Org chart / About
    { t: 'Org Chart · Social Department 2026',     g: 'About ICF', h: 'Resources%20Public/7-%20Organigram/2026/Org%20Chart%20Social%20Department%202026.pdf', i: 'users' },
    { t: 'About ICF Cambodia',                     g: 'About ICF', h: 'about.html', i: 'users' },

    // Internal pages
    { t: 'Staff Resources',                        g: 'Hub pages', h: 'resources.html', i: 'file' },
    { t: 'Staff Tools',                            g: 'Hub pages', h: 'tools.html', i: 'wrench' },
    { t: 'Training & Development',                 g: 'Hub pages', h: 'training.html', i: 'graduation' },
    { t: 'Medical Hub',                            g: 'Hub pages', h: 'medical.html', i: 'medical' },
    { t: 'Media Center',                           g: 'Hub pages', h: 'media.html', i: 'image' },
    { t: 'Departments',                            g: 'Hub pages', h: 'departments.html', i: 'users' },
    { t: 'Events & Year Topics',                   g: 'Hub pages', h: 'events.html', i: 'calendar' },
    { t: 'HR Department',                          g: 'Hub pages', h: 'department-hr.html', i: 'users' },
  ];

  function iconFor(name) {
    const ic = {
      calendar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
      cpu: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>',
      shield: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      image: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
      palette: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 10 10c0 2-2 3-4 3h-3a2 2 0 0 0 0 4z"/></svg>',
      dollar: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></svg>',
      truck: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="13" height="11" rx="1"/><path d="M14 9h4l3 4v4h-7z"/><circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>',
      book: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      graduation: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
      medical: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-3 1.5-6 0-9-3 0-6 0-7.5 1.5C10 5 7 5 4 5c-1.5 3-1.5 6 0 9 3 0 6 0 7.5-1.5C13 14 16 14 19 14z"/></svg>',
      globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
      users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
      map: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>',
      message: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
      file: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
      wrench: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    };
    return ic[name] || ic.file;
  }

  function render(query) {
    if (!searchResults) return;
    const q = (query || '').trim().toLowerCase();
    const hits = q
      ? INDEX.filter(x =>
          x.t.toLowerCase().includes(q) ||
          x.g.toLowerCase().includes(q))
      : INDEX.slice(0, 8);

    const groups = {};
    hits.forEach(h => {
      groups[h.g] = groups[h.g] || [];
      groups[h.g].push(h);
    });

    let html = '';
    if (hits.length === 0) {
      html = `<div class="search-modal__group-label">No matches</div>
              <div style="padding:14px;color:var(--text-muted);font-size:13.5px;">Try “leave”, “logo”, “budget”, “SOP”, or “medical”.</div>`;
    } else {
      Object.keys(groups).forEach(g => {
        html += `<div class="search-modal__group-label">${g}</div>`;
        groups[g].forEach(item => {
          // Open external docs / folders in a new tab; keep hub pages in same window.
          const isExternal = /^(Resources%20Public|Training%20%26%20Development%20Webhub|Medical%20Webhub)/.test(item.h);
          const tgt = isExternal ? ' target="_blank" rel="noopener"' : '';
          html += `<a class="search-modal__hit" href="${item.h}"${tgt}>
            <span class="icon">${iconFor(item.i)}</span>
            <span>
              <p class="search-modal__hit__title">${item.t}</p>
              <p class="search-modal__hit__sub">${item.g}</p>
            </span>
          </a>`;
        });
      });
    }
    searchResults.innerHTML = html;
  }

  if (searchInput) {
    render('');
    searchInput.addEventListener('input', e => render(e.target.value));
  }

  // ---------- Inline hero search (no modal) ----------
  (function initInlineSearch() {
    const input   = document.getElementById('inline-search-input');
    const results = document.getElementById('inline-search-results');
    if (!input || !results) return;

    function iconFor(name) {
      const ic = {
        calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
        shield:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        dollar:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></svg>',
        graduation:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/></svg>',
        file:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
        users:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
        image:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>',
        medical:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-3 1.5-6 0-9-3 0-6 0-7.5 1.5C10 5 7 5 4 5c-1.5 3-1.5 6 0 9 3 0 6 0 7.5-1.5C13 14 16 14 19 14z"/></svg>',
      };
      return ic[name] || ic.file;
    }

    function renderInline(q) {
      const query = q.trim().toLowerCase();
      if (!query) { results.hidden = true; return; }

      const hits = INDEX.filter(x =>
        x.t.toLowerCase().includes(query) || x.g.toLowerCase().includes(query)
      ).slice(0, 12);

      if (hits.length === 0) {
        results.innerHTML = `<div class="inline-results__empty">No results for "<strong>${q}</strong>"</div>`;
      } else {
        const groups = {};
        hits.forEach(h => { groups[h.g] = groups[h.g] || []; groups[h.g].push(h); });
        results.innerHTML = Object.keys(groups).map(g => {
          const items = groups[g].map(item => {
            const isExt = /^(Resources%20Public|Training%20%26|Medical%20Webhub)/.test(item.h);
            const tgt = isExt ? ' target="_blank" rel="noopener"' : '';
            return `<a class="inline-results__hit" href="${item.h}"${tgt}>
              <span class="inline-results__hit__icon">${iconFor(item.i)}</span>
              <span>
                <div class="inline-results__hit__title">${item.t}</div>
                <div class="inline-results__hit__sub">${item.g}</div>
              </span>
            </a>`;
          }).join('');
          return `<div class="inline-results__group">${g}</div>${items}`;
        }).join('');
      }
      results.hidden = false;
    }

    input.addEventListener('input', e => renderInline(e.target.value));

    // Close when clicking outside
    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.hidden = true;
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { results.hidden = true; input.blur(); }
    });
  })();

  // Quick action filter pills (resources & departments)
  document.querySelectorAll('[data-filter-group]').forEach(group => {
    const pills = group.querySelectorAll('.pill');
    const grid  = document.querySelector(group.dataset.target);
    if (!grid) return;
    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => x.classList.remove('is-active'));
      p.classList.add('is-active');
      const cat = p.dataset.cat;
      grid.querySelectorAll('[data-cat]').forEach(item => {
        if (cat === 'all' || item.dataset.cat.split(' ').includes(cat)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }));
  });
})();
