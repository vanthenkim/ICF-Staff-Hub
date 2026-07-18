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
    // ── Navigation & sidebar (all pages) ──────────────────────────────
    "Home": "ដើម",
    "About ICF": "អំពី ICF",
    "Staff Guidelines": "គោលការណ៍ណែនាំ",
    "Staff Resources": "ធនធានបុគ្គលិក",
    "Staff Tools": "ឧបករណ៍បុគ្គលិក",
    "Training & Development": "ការបណ្តុះបណ្តាល",
    "Training &amp; Development": "ការបណ្តុះបណ្តាល",
    "Medical Hub": "មជ្ឈមណ្ឌលវេជ្ជសាស្ត្រ",
    "Media Center": "មជ្ឈមណ្ឌលប្រព័ន្ធផ្សព្វផ្សាយ",
    "Departments": "នាយកដ្ឋាន",
    "Events & Year Topics": "ព្រឹត្តិការណ៍",
    "Events &amp; Year Topics": "ព្រឹត្តិការណ៍",
    "Quick Actions": "សកម្មភាពរហ័ស",
    "Quick Links": "តំណរហ័ស",
    "Announcements": "សេចក្ដីប្រកាស",
    "Featured Resources": "ធនធានពិសេស",
    "Emergency Contacts": "ទំនាក់ទំនងបន្ទាន់",
    "Important Links": "តំណភ្ជាប់សំខាន់",
    "Staff Contacts": "ទំនាក់ទំនងបុគ្គលិក",
    "Staff Group Telegram": "Telegram ក្រុមបុគ្គលិក",
    "Staff Telegram": "Telegram បុគ្គលិក",
    "Honor a Colleague": "ទទួលស្គាល់សហការី",
    "My Favorites": "សំណព្វរបស់ខ្ញុំ",
    "Tap ♡ on any card to save it here": "ចុច ♡ លើកាតណាមួយ ដើម្បីរក្សាទុក",
    "More": "ច្រើនទៀត",
    // ── Mobile bottom nav ─────────────────────────────────────────────
    "Search": "ស្វែងរក",
    "Resources": "ធនធាន",
    "Tools": "ឧបករណ៍",
    "Training": "បណ្តុះបណ្តាល",
    "Medical": "វេជ្ជសាស្ត្រ",
    "Media": "ប្រព័ន្ធផ្សព្វផ្សាយ",
    "Depts": "នាយក",
    "About": "អំពី",
    "Events": "ព្រឹត្តិការណ៍",
    "Contacts": "ទំនាក់ទំនង",
    // ── Common UI buttons & labels ────────────────────────────────────
    "Open": "បើក",
    "Open file": "បើកឯកសារ",
    "Open form": "បើកទម្រង់",
    "Open PDF": "បើក PDF",
    "Open template": "បើកគំរូ",
    "Open folder": "បើកថត",
    "Download": "ទាញយក",
    "Download form": "ទាញយកទម្រង់",
    "All": "ទាំងអស់",
    "Coming soon": "ឆាប់ៗ",
    "In progress": "កំពុងដំណើរការ",
    "Completed": "រួចរាល់",
    "Current": "បច្ចុប្បន្ន",
    "Required": "ចាំបាច់",
    "Bilingual": "ភាសាទ្វេ",
    "Active": "សកម្ម",
    "Draft": "ព្រាង",
    "Needs Review": "ត្រូវការពិនិត្យ",
    "Archived": "ទុកបណ្ណាសារ",
    "English": "ភាសាអង់គ្លេស",
    "Khmer": "ភាសាខ្មែរ",
    // ── Loading / placeholder states ──────────────────────────────────
    "Loading…": "កំពុងផ្ទុក…",
    "Loading announcements…": "កំពុងផ្ទុក…",
    "Loading events…": "កំពុងផ្ទុក…",
    "Loading staff directory…": "កំពុងផ្ទុករាយឈ្មោះ…",
    "Checking today's menu…": "កំពុងពិនិត្យ…",
    "Checking today's birthdays…": "កំពុងពិនិត្យ…",
    // ── Home page ─────────────────────────────────────────────────────
    "Today's Lunch": "អាហារថ្ងៃត្រង់ថ្ងៃនេះ",
    "Today's Birthdays": "ខួបកំណើតថ្ងៃនេះ",
    "Upcoming Events": "ព្រឹត្តិការណ៍ខាងមុខ",
    // ── Department pages ──────────────────────────────────────────────
    "Team": "ក្រុម",
    "Management": "ការគ្រប់គ្រង",
    "Executive Director": "នាយកប្រតិបត្តិ",
    "What We Do": "អ្វីដែលយើងធ្វើ",
    "What we do": "អ្វីដែលយើងធ្វើ",
    "Resources & Tools": "ធនធាន និងឧបករណ៍",
    "Resources &amp; Tools": "ធនធាន និងឧបករណ៍",
    // ── Staff contacts page ───────────────────────────────────────────
    "All Departments": "នាយកដ្ឋានទាំងអស់",
    "Name": "ឈ្មោះ",
    "Department": "នាយកដ្ឋាន",
    "Email": "អ៊ីមែល",
    "Phone": "លេខទូរស័ព្ទ",
    "Staff Profile": "ប្រវត្តិរូបបុគ្គលិក",
    "No staff found matching your search.": "រកមិនឃើញបុគ្គលិក",
    // ── Quick Actions / Tools page ────────────────────────────────────
    "IT Request": "សំណើ IT",
    "Leave Request": "សំណើច្បាប់ឈប់សម្រាក",
    "Expense Request": "សំណើចំណាយ",
    "Vehicle Request": "សំណើរថយន្ត",
    "Maintenance Request": "សំណើជួសជុល",
    "Media Request": "សំណើប្រព័ន្ធ",
    "Translation Request": "សំណើបកប្រែ",
    "Event Support Request": "សំណើគាំទ្រ",
    "My Recent Requests": "សំណើថ្មីៗ",
    "HR Templates": "ទម្រង់ HR",
    "Finance Forms": "ទម្រង់ហិរញ្ញវត្ថុ",
    // ── About page ────────────────────────────────────────────────────
    "All Staff": "បុគ្គលិកទាំងអស់",
    "Staff": "បុគ្គលិក",
    "Mission": "បេសកកម្ម",
    "Programs": "កម្មវិធី",
    "Our Values": "តម្លៃរបស់យើង",
    "Our Culture": "វប្បធម៌របស់យើង",
    "Founder": "ស្ថាបនិក",
    "Advisory Board": "ក្រុមប្រឹក្សា",
    "Internal Council": "ក្រុមប្រឹក្សាផ្ទៃក្នុង",
    "Board of Directors (BOD)": "ក្រុមប្រឹក្សាភិបាល (BOD)",
    "Directional Leadership Team (DLT)": "ក្រុមដឹកនាំ (DLT)",
    // ── Medical page ──────────────────────────────────────────────────
    "Emergency": "ករណីបន្ទាន់",
    "In an emergency": "ក្នុងករណីបន្ទាន់",
    "Find Help Fast": "ស្វែងរកជំនួយ",
    "Before going to hospital": "មុនពេលទៅមន្ទីរពេទ្យ",
    "Medical Room": "បន្ទប់ពេទ្យ",
    // ── Guidelines / Resources page ───────────────────────────────────
    "Child Protection": "ការការពារកុមារ",
    "Human Resources Guidelines": "គោលការណ៍ HR",
    "Finance Policies": "គោលការណ៍ហិរញ្ញវត្ថុ",
    "Campus": "ទីតាំង",
    "Policy": "គោលការណ៍",
    "Guideline": "ការណែនាំ",
    "Guidelines": "ការណែនាំ",
    // ── Training page ─────────────────────────────────────────────────
    "Training Hub": "មជ្ឈមណ្ឌលបណ្តុះបណ្តាល",
    "Heart": "បេះដូង",
    "Head": "ខ្លឹមសារ",
    "Hands": "ការអនុវត្ត",
    "Communication": "ទំនាក់ទំនង",
    "Culture": "វប្បធម៌",
    // ── Events / Media / Brand pages ──────────────────────────────────
    "Org Chart": "តារាងអង្គការ",
    "Brand Resources": "ធនធានម៉ាក",
    "Event Planner": "ផែនការព្រឹត្តិការណ៍",
    "Staff Birthdays": "ខួបកំណើតបុគ្គលិក",
    "Staff Lunch Menu": "មីនុយអាហារថ្ងៃត្រង់",
    // ── Department names & badges (auto-translated, review recommended) ──
    "Catering Department": "នាយកដ្ឋានម្ហូបអាហារ",
    "Church Department": "នាយកដ្ឋានព្រះវិហារ",
    "Human Resources Department": "នាយកដ្ឋានធនធានមនុស្ស",
    "MarCom Department": "នាយកដ្ឋាន MarCom",
    "Operations Department": "នាយកដ្ឋានប្រតិបត្តិការ",
    "Property Department": "នាយកដ្ឋានទ្រព្យសម្បត្តិ",
    "Social Department": "នាយកដ្ឋានសង្គមកិច្ច",
    "New Campus": "ទីតាំងថ្មី",
    "Donor Care": "ការថែទាំម្ចាស់ជំនួយ",
    "Fundraising": "ការប្រមូលមូលនិធិ",
    "Family Care": "ការថែទាំគ្រួសារ",
    "Education": "អប់រំ",
    "Guest Relations": "ទំនាក់ទំនងភ្ញៀវ",
    "Finance": "ហិរញ្ញវត្ថុ",
    "Human Resources": "ធនធានមនុស្ស",
    "Leadership": "ភាពជាអ្នកដឹកនាំ",
    "Recruitment": "ការជ្រើសរើសបុគ្គលិក",
    "Payroll": "បញ្ជីប្រាក់ខែ",
    "Insurance": "ធានារ៉ាប់រង",
    "Security Team": "ក្រុមសន្តិសុខ",
    "Kitchen Team": "ក្រុមផ្ទះបាយ",
    "Dept Leaders": "ប្រធាននាយកដ្ឋាន",
    "Team Leaders": "ប្រធានក្រុម",
    "Phnom Penh": "ភ្នំពេញ",
    // ── Forms & requests ───────────────────────────────────────────────
    "1-on-1 Form": "ទម្រង់សន្ទនាមួយទល់មួយ",
    "Application Form": "ទម្រង់ពាក្យសុំ",
    "Church Forms": "ទម្រង់ព្រះវិហារ",
    "Commitment Form": "ទម្រង់ការប្តេជ្ញាចិត្ត",
    "GPA Claim": "ការទាមទារ GPA",
    "GPA Claim Form": "ទម្រង់ការទាមទារ GPA",
    "HNS Claim": "ការទាមទារ HNS",
    "HNS Claim Form": "ទម្រង់ការទាមទារ HNS",
    "Human Resources Forms": "ទម្រង់ធនធានមនុស្ស",
    "Interview Form": "ទម្រង់សម្ភាសន៍",
    "NGO Forms": "ទម្រង់ NGO",
    "Open Training Request Form →": "បើកទម្រង់សំណើបណ្តុះបណ្តាល →",
    "Related form": "ទម្រង់ពាក់ព័ន្ធ",
    "Withdrawal Form": "ទម្រង់ដកប្រាក់",
    "Reference": "ឯកសារយោង",
    "Reference Check": "ការត្រួតពិនិត្យប្រវត្តិការងារ",
    // ── Tags, badges & button styles (design system) ──────────────────
    "Amber tag": "ស្លាកលឿង",
    "Blue tag": "ស្លាកខៀវ",
    "Green tag": "ស្លាកបៃតង",
    "Purple tag": "ស្លាកស្វាយ",
    "Red tag": "ស្លាកក្រហម",
    "Slate tag": "ស្លាកប្រផេះ",
    "Tag": "ស្លាក",
    "Green action": "សកម្មភាពបៃតង",
    "Default": "លំនាំដើម",
    "Primary": "ចម្បង",
    "Secondary": "រង",
    "Small": "តូច",
    "Small primary": "ចម្បងតូច",
    "Ghost": "ស្រមោល",
    // ── Status & state words ──────────────────────────────────────────
    "Approved": "បានអនុម័ត",
    "Archive": "ទុកបណ្ណសារ",
    "Ongoing": "កំពុងបន្ត",
    "Online": "អនឡាញ",
    "Overseas": "ក្រៅប្រទេស",
    "Paid": "បង់ប្រាក់រួច",
    "Free": "ឥតគិតថ្លៃ",
    "Sponsored": "ឧបត្ថម្ភ",
    "Khmer translation": "ការបកប្រែជាភាសាខ្មែរ",
    // ── Durations ──────────────────────────────────────────────────────
    "1 day": "1 ថ្ងៃ",
    "1–2 days": "1–2 ថ្ងៃ",
    "1–2 weeks": "1–2 សប្តាហ៍",
    "2–3 hours": "2–3 ម៉ោង",
    "4 members ▾": "4 សមាជិក ▾",
    "4 sessions": "4 សម័យ",
    "4 weeks": "4 សប្តាហ៍",
    "6 weeks": "6 សប្តាហ៍",
    "~6 hours": "~6 ម៉ោង",
    "Half day": "ពាក់កណ្តាលថ្ងៃ",
    "Holidays": "ថ្ងៃឈប់សម្រាក",
    // ── Buttons, links & actions ───────────────────────────────────────
    "Brand Guidelines ↗": "ការណែនាំម៉ាក ↗",
    "Brand assets": "ធនធានម៉ាក",
    "Checklist →": "បញ្ជីត្រួតពិនិត្យ →",
    "Event support →": "ការគាំទ្រព្រឹត្តិការណ៍ →",
    "Form →": "ទម្រង់ →",
    "Go to hospital": "ទៅមន្ទីរពេទ្យ",
    "New event": "ព្រឹត្តិការណ៍ថ្មី",
    "Open font folder": "បើកថតពុម្ពអក្សរ",
    "Open full T&D Webhub →": "បើក T&D Webhub ពេញលេញ →",
    "Open search modal": "បើកប្រអប់ស្វែងរក",
    "Open →": "បើក →",
    "Request design →": "ស្នើសុំការរចនា →",
    "Story library": "បណ្ណាល័យរឿង",
    "Teaching Library": "បណ្ណាល័យមេរៀន",
    "View Full Lunch Menu": "មើលមីនុយពេញលេញ",
    "View hospital warning signs →": "មើលសញ្ញាព្រមានមន្ទីរពេទ្យ →",
    "View in T&D Hub": "មើលនៅក្នុង T&D Hub",
    "← Back": "← ត្រឡប់",
    // ── Search / modal chrome ──────────────────────────────────────────
    "close": "បិទ",
    "navigate": "រុករក",
    "open": "បើក",
    "Redirecting…": "កំពុងបញ្ជូនបន្ត…",
    "This page has moved to": "ទំព័រនេះបានផ្លាស់ទីទៅ",
    // ── Misc ──────────────────────────────────────────────────────────
    "APR Center": "មជ្ឈមណ្ឌល APR",
    "Advisory Board ▾": "ក្រុមប្រឹក្សា ▾",
    "All departments and reporting lines — click to open": "នាយកដ្ឋាន និងខ្សែបញ្ជាទាំងអស់ — ចុចដើម្បីបើក",
    "Allowances": "ប្រាក់ឧបត្ថម្ភ",
    "Associate Pastor": "សហគ្រូគង្វាល",
    "Baby Gift": "អំណោយទារក",
    "Develop People": "អភិវឌ្ឍន៍មនុស្ស",
    "Framework": "ក្របខណ្ឌ",
    "Funeral Fund": "មូលនិធិបុណ្យសព",
    "ICF Cambodia · Full Org Chart 2026": "ICF កម្ពុជា · តារាងអង្គការពេញលេញ 2026",
    "ICF Center": "មជ្ឈមណ្ឌល ICF",
    "ICF Kitchen": "ផ្ទះបាយ ICF",
    "ICF Movement ▾": "ចលនា ICF ▾",
    "Impact 2025/26": "ផលប៉ះពាល់ 2025/26",
    "Impact Report 2026": "របាយការណ៍ផលប៉ះពាល់ 2026",
    "Improvement Plan": "ផែនការកែលម្អ",
    "Life Cycle": "វដ្តជីវិត",
    "Our values": "តម្លៃរបស់យើង",
    "Panel Hospitals": "មន្ទីរពេទ្យដៃគូ",
    "Panel Hospitals (HNS)": "មន្ទីរពេទ្យដៃគូ (HNS)",
    "Sermon series": "ស៊េរីអធិប្បាយ",
    "System": "ប្រព័ន្ធ",
    "Updated May 2025": "បានធ្វើបច្ចុប្បន្នភាព ឧសភា 2025",
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
      el.textContent = (lang === 'km') ? 'EN' : 'KH';
    });
    try { localStorage.setItem('icf-lang', lang); } catch (e) {}
  }

  // Init from saved preference — always call applyLang so the button label is correct
  let savedLang = 'en';
  try { savedLang = localStorage.getItem('icf-lang') || 'en'; } catch (e) {}
  document.addEventListener('DOMContentLoaded', () => applyLang(savedLang));

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

  // ---------- User avatar ----------
  (function setUserAvatar() {
    const el = document.getElementById('user-avatar');
    if (!el) return;
    try {
      const cookie = document.cookie.split('; ').find(r => r.startsWith('icf_user='));
      if (!cookie) return;
      const b64 = cookie.split('=').slice(1).join('=');
      const email = atob(b64); // e.g. vivian.stumpf@icf-cambodia.com
      const local = email.split('@')[0];     // vivian.stumpf
      const parts = local.split('.');
      const initials = parts.map(p => p.charAt(0).toUpperCase()).join('').slice(0, 2);
      // Try photo first: assets/people/firstname-lastname.jpg
      const photoPath = 'assets/people/' + parts.join('-') + '.jpg';
      const img = new Image();
      img.onload = function() {
        el.style.cssText += ';background-image:url(' + photoPath + ');background-size:cover;background-position:center;color:transparent;font-size:0;';
      };
      img.onerror = function() {
        el.textContent = initials;
      };
      img.src = photoPath;
      el.title = email;
    } catch(e) {}
  })();

  // ---------- Hero greeting + date ----------
  (function setHeroDate() {
    const now = new Date();
    const hour = now.getHours();
    // Read first name from icf_user cookie (base64-encoded email, set by auth-callback)
    let name = 'Friend';
    try {
      const cookie = document.cookie.split('; ').find(r => r.startsWith('icf_user='));
      if (cookie) {
        const email = atob(cookie.split('=').slice(1).join('=')); // e.g. vivian.stumpf@icf-cambodia.com
        const first = email.split('@')[0].split('.')[0];
        if (first) name = first.charAt(0).toUpperCase() + first.slice(1);
      }
    } catch(e) {}

    const greet = hour < 5 ? 'Good evening' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const greetEl = document.getElementById('hero-greeting');
    if (greetEl) greetEl.textContent = `${greet}, ${name} 👋`;

    const dateEl = document.getElementById('hero-date');
    if (dateEl) {
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      dateEl.textContent = `${day} · ${date}`;
    }
  })();

  // ---------- Year Planner — Upcoming Events (list view, next 2 weeks) ----------
  // Pulls from the same published Google Sheet as the Year Planner's "2 weeks"
  // tab on events.html, filtered to the same date window (Monday of this week
  // through the following Sunday), just rendered as a flat list instead of a
  // grid. Keep PLANNER_TABS in sync with events.html when a new year's tab
  // is added there.
  (function loadUpcomingEvents() {
    const container = document.getElementById('gcal-events');
    if (!container) return;

    const SHEET_ID = '1VMcwMqWxRDnLZ6QTGel33aNVHLlNtqZf_HnwtCanALA';
    const PLANNER_TABS = [
      { year: 2026, gid: '324796546' },
    ];
    function csvUrlFor(gid) {
      return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
    }

    const MONTHS           = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const DAYS             = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTH_NAMES_FULL = ['january','february','march','april','may','june','july','august','september','october','november','december'];
    const VALID_OTHER_CODES = ['LA', 'BA', 'AC', 'BN', 'MT', 'GU', 'OT'];
    const CAL_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>`;

    const CAT_META = {
      'all-staff': { label: 'All staff', color: '#2563EB' },
      'church':    { label: 'Church',    color: '#9333EA' },
      'social':    { label: 'Social',    color: '#059669' },
    };
    const SUBCAT_META = {
      LA: { label: 'Leadership Academy', color: '#0891B2' },
      BA: { label: 'Business Academy',   color: '#6366F1' },
      AC: { label: 'Learning Center',    color: '#EA580C' },
      BN: { label: 'Business Network',   color: '#475569' },
      MT: { label: 'Mission Team',       color: '#D97706' },
      GU: { label: 'Guests',             color: '#DB2777' },
      OT: { label: 'Other',              color: '#64748B' },
    };
    function metaFor(ev) {
      if (ev.category === 'others') return SUBCAT_META[ev.subCategory] || SUBCAT_META.OT;
      return CAT_META[ev.category] || SUBCAT_META.OT;
    }

    // ---- CSV grid parsing (mirrors the Year Planner's month-block layout on events.html) ----
    function parseCSV(text) {
      const rows = [];
      let row = [], field = '', inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
          if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; } }
          else field += c;
          continue;
        }
        if (c === '"') { inQuotes = true; continue; }
        if (c === ',') { row.push(field); field = ''; continue; }
        if (c === '\r') continue;
        if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
        field += c;
      }
      if (field.length || row.length) { row.push(field); rows.push(row); }
      return rows;
    }
    function cellAt(rows, r, c) {
      if (r < 0 || r >= rows.length) return '';
      const row = rows[r];
      if (c < 0 || c >= row.length) return '';
      return (row[c] || '').trim();
    }

    const TIME_RANGE_RE  = /^(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)\s*[-–]\s*(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)$/;
    const TIME_SINGLE_RE = /^(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)$/;
    function extractTime(text) {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        for (let i = 0; i < lines.length; i++) {
          const rangeMatch = lines[i].match(TIME_RANGE_RE);
          if (rangeMatch) {
            const title = lines.filter((_, idx) => idx !== i).join(' ').trim();
            return { startTime: rangeMatch[1].trim(), endTime: rangeMatch[2].trim(), title };
          }
          const singleMatch = lines[i].match(TIME_SINGLE_RE);
          if (singleMatch) {
            const title = lines.filter((_, idx) => idx !== i).join(' ').trim();
            return { startTime: singleMatch[1].trim(), endTime: null, title };
          }
        }
      }
      const joined = lines.join(' ');
      const rangePrefix = joined.match(/^(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)\s*[-–]\s*(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)\s+(.*)$/);
      if (rangePrefix) return { startTime: rangePrefix[1].trim(), endTime: rangePrefix[2].trim(), title: rangePrefix[3].trim() };
      const singlePrefix = joined.match(/^(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)\s+(.*)$/);
      if (singlePrefix) return { startTime: singlePrefix[1].trim(), endTime: null, title: singlePrefix[2].trim() };
      return { startTime: null, endTime: null, title: joined };
    }

    function findMonthInText(text) {
      const lower = text.toLowerCase();
      for (let i = 0; i < MONTH_NAMES_FULL.length; i++) {
        if (new RegExp('\\b' + MONTH_NAMES_FULL[i] + '\\b', 'i').test(lower)) return i;
      }
      return -1;
    }

    function parsePlannerCSV(csvText, year) {
      const rows = parseCSV(csvText);
      let headerRowIdx = -1;
      const anchorCols = [];
      for (let r = 0; r < rows.length; r++) {
        const cols = [];
        for (let c = 0; c < rows[r].length; c++) {
          if ((rows[r][c] || '').trim().toUpperCase().includes('ALL STAFF/PUBLIC HOLIDAY')) cols.push(c);
        }
        if (cols.length) { headerRowIdx = r; anchorCols.push(...cols); break; }
      }
      if (headerRowIdx === -1) throw new Error('Could not locate category header row in sheet');

      const rawEntries = [];
      for (const anchor of anchorCols) {
        const dayCol = anchor - 2, wdayCol = anchor - 1, allStaffCol = anchor, churchCol = anchor + 1, socialCol = anchor + 2, othersCol = anchor + 3, othersTagCol = anchor + 4;
        const headerBlob = [cellAt(rows, headerRowIdx, dayCol), cellAt(rows, headerRowIdx, wdayCol), cellAt(rows, headerRowIdx, allStaffCol)].join(' ');
        const monthIndex = findMonthInText(headerBlob);
        if (monthIndex === -1) continue;
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        for (let d = 1; d <= daysInMonth; d++) {
          const rowIdx = headerRowIdx + d;
          const date = new Date(Date.UTC(year, monthIndex, d));
          const allStaffText = cellAt(rows, rowIdx, allStaffCol);
          const churchText    = cellAt(rows, rowIdx, churchCol);
          const socialText    = cellAt(rows, rowIdx, socialCol);
          const othersText    = cellAt(rows, rowIdx, othersCol);
          const othersTagText = cellAt(rows, rowIdx, othersTagCol);

          if (allStaffText) { const t = extractTime(allStaffText); rawEntries.push({ date, category: 'all-staff', subCategory: null, text: allStaffText, title: t.title, startTime: t.startTime, endTime: t.endTime }); }
          if (churchText)    { const t = extractTime(churchText);    rawEntries.push({ date, category: 'church',    subCategory: null, text: churchText,    title: t.title, startTime: t.startTime, endTime: t.endTime }); }
          if (socialText)    { const t = extractTime(socialText);    rawEntries.push({ date, category: 'social',    subCategory: null, text: socialText,    title: t.title, startTime: t.startTime, endTime: t.endTime }); }

          if (othersText) {
            const tagRaw = othersTagText.trim().toUpperCase();
            let key  = VALID_OTHER_CODES.includes(tagRaw) ? tagRaw : null;
            let rest = othersText;
            if (!key) {
              const match = othersText.match(/^\[(LA|BA|AC|BN|MT|GU|OT)\]\s*([\s\S]*)$/i);
              if (match) { key = match[1].toUpperCase(); rest = match[2].trim() || othersText; }
            }
            if (!key) key = 'OT';
            const t = extractTime(rest);
            rawEntries.push({ date, category: 'others', subCategory: key, text: rest, title: t.title, startTime: t.startTime, endTime: t.endTime });
          }
        }
      }

      const groups = new Map();
      for (const entry of rawEntries) {
        const key = `${entry.category}|${entry.subCategory || ''}|${entry.text.toLowerCase()}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(entry);
      }

      // Same-text entries only merge into one spanning event if they're close
      // together in time — mirrors the Year Planner's own merge rule so the
      // two views never disagree about what counts as "one event".
      const MAX_SPAN_GAP_DAYS = 9;
      function toEvent(first, last) {
        return {
          start: first.date.toISOString().slice(0, 10),
          end:   last.date.toISOString().slice(0, 10),
          category: first.category,
          subCategory: first.subCategory,
          title: first.title,
          startTime: first.startTime,
          endTime: first.endTime,
        };
      }
      const events = [];
      for (const [, entries] of groups) {
        entries.sort((a, b) => a.date - b.date);
        let runFirst = entries[0], runLast = entries[0];
        for (let i = 1; i < entries.length; i++) {
          const gapDays = (entries[i].date - runLast.date) / 86400000;
          if (gapDays <= MAX_SPAN_GAP_DAYS) { runLast = entries[i]; }
          else { events.push(toEvent(runFirst, runLast)); runFirst = entries[i]; runLast = entries[i]; }
        }
        events.push(toEvent(runFirst, runLast));
      }
      events.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
      return events;
    }

    function parseISODate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
    function addDays(d, n) { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r; }
    function todayUTC() { const n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); }

    // Same "Add to calendar" quick-add link the planner uses.
    function gcalUrl(ev) {
      const meta = metaFor(ev);
      const title = encodeURIComponent(ev.title);
      const details = encodeURIComponent(meta.label);
      const startCompact = ev.start.replace(/-/g, '');
      const toCompactTime = t => { const [h, m] = t.split(':'); return `${(h || '0').padStart(2, '0')}${(m || '0').padStart(2, '0')}00`; };
      let dates;
      if (ev.startTime) {
        const startHM = toCompactTime(ev.startTime);
        let endDateCompact = ev.end.replace(/-/g, '');
        let endHM = ev.endTime ? toCompactTime(ev.endTime) : null;
        if (!endHM) {
          const [h, m] = ev.startTime.split(':').map(Number);
          endHM = `${String((h + 1) % 24).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
          if (h === 23) endDateCompact = addDays(parseISODate(ev.end), 1).toISOString().slice(0, 10).replace(/-/g, '');
        }
        dates = `${startCompact}T${startHM}/${endDateCompact}T${endHM}`;
      } else {
        const endPlusOne = addDays(parseISODate(ev.end), 1).toISOString().slice(0, 10).replace(/-/g, '');
        dates = `${startCompact}/${endPlusOne}`;
      }
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&ctz=Asia%2FPhnom_Penh`;
    }

    function renderGroup(dateStr, events) {
      const d       = parseISODate(dateStr);
      const day     = d.getUTCDate();
      const mon     = MONTHS[d.getUTCMonth()];
      const weekday = DAYS[d.getUTCDay()];

      const rows = events.map(ev => {
        const meta = metaFor(ev);
        const time = ev.startTime ? `${ev.startTime}${ev.endTime ? '–' + ev.endTime : ''}` : 'All day';

        return `<div class="gcal-event-row">
          <div class="gcal-event-row__info">
            <span class="gcal-event-row__title">${ev.title || '(No title)'}</span>
            <span class="gcal-event-row__time"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${meta.color};margin-right:6px;"></span>${time} · ${meta.label}</span>
          </div>
          <a class="gcal-add-btn" href="${gcalUrl(ev)}" target="_blank" rel="noopener" title="Add to your calendar">
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

    async function loadOneTab(tab) {
      const ctrl = new AbortController();
      const tid  = setTimeout(() => ctrl.abort(), 8000);
      try {
        const resp = await fetch(csvUrlFor(tab.gid), { cache: 'no-cache', signal: ctrl.signal });
        clearTimeout(tid);
        if (!resp.ok) throw new Error('fetch failed ' + resp.status);
        const csvText = await resp.text();
        return parsePlannerCSV(csvText, tab.year);
      } catch (e) {
        clearTimeout(tid);
        console.error('Upcoming Events: failed to load', tab.year, 'tab', e);
        return [];
      }
    }

    (async function load() {
      try {
        const results = await Promise.all(PLANNER_TABS.map(loadOneTab));
        const allEvents = results.flat();
        if (allEvents.length === 0) throw new Error('no events loaded from any tab');

        // Same window as the Year Planner's "2 weeks" tab: Monday of the
        // current week through the following Sunday (14 days total).
        const today     = todayUTC();
        const dow       = today.getUTCDay();
        const start     = addDays(today, dow === 0 ? -6 : 1 - dow);
        const end       = addDays(start, 13);
        const startISO  = start.toISOString().slice(0, 10);
        const endISO    = end.toISOString().slice(0, 10);

        const upcoming = allEvents
          .filter(ev => ev.end >= startISO && ev.start <= endISO)
          .sort((a, b) => {
            if (a.start !== b.start) return a.start < b.start ? -1 : 1;
            return (a.startTime || '').localeCompare(b.startTime || '');
          });

        if (upcoming.length === 0) {
          container.innerHTML = '<div class="gcal-loading">No events in the next 2 weeks.</div>';
          return;
        }

        const groups = {};
        upcoming.forEach(ev => {
          groups[ev.start] = groups[ev.start] || [];
          groups[ev.start].push(ev);
        });
        container.innerHTML = Object.keys(groups).sort().map(k => renderGroup(k, groups[k])).join('');
      } catch (e) {
        container.innerHTML = '<div class="gcal-error">Could not load events. Make sure the Year Planner sheet is shared as "Anyone with the link".</div>';
      }
    })();
  })();

  // ---------- Favorites ----------
  (function initFavorites() {
    const STORAGE_KEY = 'icf-favorites';
    const HEART_SVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`;

    function loadFavs() {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Migrate old format { label, href } → new format { key, label, links }
        let changed = false;
        const migrated = raw.map(f => {
          if (f.key && f.links) return f; // already new format
          if (f.label && f.href) {
            changed = true;
            return {
              key: f.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
              label: f.label,
              links: [{ label: 'Open', href: f.href }]
            };
          }
          return null;
        }).filter(Boolean);
        if (changed) try { localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); } catch(e) {}
        return migrated;
      } catch(e) { return []; }
    }
    function saveFavs(favs) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favs)); } catch(e) {}
    }

    // ---- Render sidebar favorites nav link ----
    const FAV_HEART = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
    function renderSidebarFavs() {
      const favs = loadFavs();
      const count = favs.length;
      const badge = count > 0 ? `<span class="nav__fav-count">${count}</span>` : '';
      const isFavPage = location.pathname.endsWith('favorites.html');

      // Desktop sidebar: single nav link
      const nav = document.querySelector('.sidebar .nav');
      if (nav) {
        let existing = nav.querySelector('.fav-section');
        if (existing) existing.remove();
        const link = document.createElement('a');
        link.className = 'nav__item fav-section' + (isFavPage ? ' is-active' : '');
        link.href = 'favorites.html';
        link.innerHTML = `<span class="icon">${FAV_HEART}</span>My Favorites${badge}`;
        const ql = Array.from(nav.querySelectorAll('.nav__group-label')).find(el => el.textContent.trim() === 'Quick Links');
        if (ql) nav.insertBefore(link, ql);
        else nav.appendChild(link);
      }

      // Mobile sidesheet: replace sidesheet-favs content with a nav link
      const sidesheetFavs = document.getElementById('sidesheet-favs');
      if (sidesheetFavs) {
        const prev = sidesheetFavs.previousElementSibling;
        if (prev && prev.classList.contains('nav__group-label')) prev.style.display = 'none';
        sidesheetFavs.innerHTML = '';
        const link = document.createElement('a');
        link.className = 'nav__item' + (isFavPage ? ' is-active' : '');
        link.href = 'favorites.html';
        link.innerHTML = `<span class="icon">${FAV_HEART}</span>My Favorites${badge}`;
        sidesheetFavs.appendChild(link);
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
      // Anchor cards (dept, hc-card etc.) use their href directly
      const href = card.getAttribute('href');
      if (href) return href;
      // Non-anchor cards: use a stable slug from the title
      const title = card.querySelector('h3,h4,[class*="title"]');
      return title ? title.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : null;
    }

    function getCardLinks(card) {
      // Anchor cards open via their own href
      const href = card.getAttribute('href');
      if (href) return [{ label: 'Open', href }];
      // Non-anchor cards: collect ALL action buttons
      const actions = card.querySelectorAll('.resource__actions a[href], .guideline__actions a[href]');
      if (actions.length) return Array.from(actions).map(a => ({ label: a.textContent.trim() || 'Open', href: a.getAttribute('href') }));
      return [];
    }

    function initCardHearts() {
      const favs    = loadFavs();
      const favKeys = favs.map(f => f.key);

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
            const idx = favs.findIndex(f => f.key === key);
            const isFav = idx > -1;

            if (isFav) { favs.splice(idx, 1); } else { favs.push({ key, label: labelText, links: getCardLinks(card) }); }

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

  // ---------- Support / Feedback Button ----------
  (function initSupportButton() {
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeohbdvZIaTm-UaTRCc1euMFMyRq_ppwks5CESQ_url3M7oDQ/viewform?usp=publish-editor';

    const ICON = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

    function makeBtn() {
      const btn = document.createElement('button');
      btn.onclick = () => window.open(FORM_URL, '_blank');
      btn.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;border:none;cursor:pointer;background:linear-gradient(135deg,#2563EB,#1d4ed8);color:#fff;border-radius:10px;padding:9px 12px;font-size:14px;font-weight:500;font-family:inherit;margin-top:10px;text-align:left;box-sizing:border-box;';
      btn.innerHTML = `<span style="display:flex;">${ICON}</span>Feedback &amp; Support`;
      return btn;
    }

    const nav = document.querySelector('.sidebar .nav');
    if (nav) nav.appendChild(makeBtn());
    const ssNav = document.querySelector('.sidesheet .nav');
    if (ssNav) ssNav.appendChild(makeBtn());
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

  // ---------- Jump-to-search (⌘K, mobile "Search" button) ----------
  // Search now lives inline in the top bar (live results as you type),
  // so these just get you there and drop the cursor in.
  function focusTopbarSearch() {
    const input = document.getElementById('topbar-search-input');
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.focus();
  }
  document.querySelectorAll('[data-action="open-search"]').forEach(b => {
    b.addEventListener('click', focusTopbarSearch);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      focusTopbarSearch();
    }
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

  // ---------- Search matching / ranking ----------
  // Broad match: a hit can come from anywhere in the title or group text,
  // but results are scored so the closest match (exact title, then
  // starts-with, then whole-word, then plain substring) rises to the top.
  function normalizeSearchText(s) {
    return (s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '');
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function scoreSearchHit(item, query) {
    const title = normalizeSearchText(item.t);
    const group = normalizeSearchText(item.g);
    const haystack = title + ' ' + group;
    const q = normalizeSearchText(query).trim();
    if (!q) return 0;

    if (title === q) return 100;
    if (title.startsWith(q)) return 90;

    const wb = new RegExp('\\b' + escapeRegExp(q) + '\\b');
    if (wb.test(title)) return 80;
    if (title.includes(q)) return 65;
    if (group.startsWith(q)) return 55;
    if (wb.test(group)) return 50;
    if (group.includes(q)) return 40;

    // Multi-word queries: broad match anywhere, ranked by how many words hit
    // and whether they land on whole words rather than mid-word fragments.
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      const foundCount = words.filter(w => haystack.includes(w)).length;
      if (foundCount === words.length) {
        let bonus = 0;
        words.forEach(w => {
          const wwb = new RegExp('\\b' + escapeRegExp(w) + '\\b');
          if (wwb.test(haystack)) bonus += 3;
        });
        return 25 + bonus;
      }
      if (foundCount > 0) return 10 + foundCount * 3;
    }

    return 0;
  }

  function searchIndex(query, limit) {
    const q = (query || '').trim();
    if (!q) return limit ? INDEX.slice(0, limit) : INDEX.slice();
    const ranked = INDEX
      .map(item => ({ item, score: scoreSearchHit(item, q) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.item.t.localeCompare(b.item.t))
      .map(x => x.item);
    return limit ? ranked.slice(0, limit) : ranked;
  }

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


  // ---------- Live inline search (top bar — no modal) ----------
  // Same behavior everywhere it's used: type, see grouped results appear
  // right below the field, click outside or Esc to dismiss.
  function initInlineSearch(inputId, resultsId) {
    const input   = document.getElementById(inputId);
    const results = document.getElementById(resultsId);
    if (!input || !results) return;

    function renderInline(q) {
      const query = q.trim();
      if (!query) { results.hidden = true; return; }

      const hits = searchIndex(query, 12);

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
    input.addEventListener('focus', e => { if (e.target.value.trim()) renderInline(e.target.value); });

    // Close when clicking outside
    document.addEventListener('click', e => {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.hidden = true;
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { results.hidden = true; input.blur(); }
    });
  }

  initInlineSearch('topbar-search-input', 'topbar-search-results');

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
