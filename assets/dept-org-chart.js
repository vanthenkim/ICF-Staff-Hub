/* dept-org-chart.js v2
   Dynamically renders department org chart columns from the Master Sheet.
   Supports 2-tier hierarchy: a Manager who heads a group can have other
   group heads reporting to them, shown as sub-columns below.

   Config (set on page before this script):
     window.ICF_DEPT        — department name (required, matches Sheet Department column)
     window.ICF_DEPT_EXTRA  — array of extra dept names to include (optional)
     window.ICF_DEPT_COLOR  — hex color for the department (required)
     window.ICF_ORG_ROOT    — name of the static root person to exclude from columns
   Target: <div id="<dept-slug>-chart-cols"> must exist in the page.
*/
(function(){
  var SHEET='https://docs.google.com/spreadsheets/d/1TVyhqGjtqrKeiCfWZBVCdAnMRH34zwcvHILvMRaBCsk/gviz/tq?tqx=out:csv&sheet=Master';
  var DEPT=window.ICF_DEPT||'';
  var EXTRA=window.ICF_DEPT_EXTRA||[];
  var COLOR=window.ICF_DEPT_COLOR||'#475569';
  var ROOT=window.ICF_ORG_ROOT||'';
  if(!DEPT)return;

  // Derive container ID slug from dept name
  var slug=DEPT.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
  var container=document.getElementById(slug+'-chart-cols');
  if(!container)return;

  // Width constants
  var COL_W=185;
  var COL_GAP=8;
  var COL_TOTAL=COL_W+COL_GAP; // 193

  // Color palette per base color
  var PALETTES={
    '#5b21b6':{l:'#f5f3ff',m:'#ede9fe',t:'#3b0764',a:'#7c3aed',c:'#c4b5fd',lb:'#c4b5fd'},
    '#065f46':{l:'#f0fdf4',m:'#d1fae5',t:'#064e3b',a:'#059669',c:'#6ee7b7',lb:'#6ee7b7'},
    '#991b1b':{l:'#fef2f2',m:'#fecaca',t:'#7f1d1d',a:'#dc2626',c:'#fca5a5',lb:'#fca5a5'},
    '#1d4ed8':{l:'#eff6ff',m:'#bfdbfe',t:'#1e3a8a',a:'#2563eb',c:'#93c5fd',lb:'#93c5fd'},
    '#b45309':{l:'#fffbeb',m:'#fde68a',t:'#78350f',a:'#d97706',c:'#fde68a',lb:'#fcd34d'},
  };
  var pl=PALETTES[COLOR]||{l:'#f8fafc',m:'#e2e8f0',t:'#1e293b',a:COLOR,c:'#cbd5e1',lb:'#cbd5e1'};

  function parseCSV(csv){
    var rows=[],row=[],cur='',inQ=false;
    for(var i=0;i<csv.length;i++){
      var c=csv[i];
      if(c==='"'){inQ=!inQ;continue;}
      if(c===','&&!inQ){row.push(cur);cur='';continue;}
      if((c==='\n'||c==='\r')&&!inQ){
        if(c==='\r'&&csv[i+1]==='\n')i++;
        row.push(cur);rows.push(row);row=[];cur='';continue;
      }
      cur+=c;
    }
    if(cur||row.length){row.push(cur);rows.push(row);}
    return rows;
  }

  function resolvePhoto(url){
    if(!url||!url.trim())return'';
    url=url.trim();
    if(url.startsWith('https://staff-icf-cambodia.com/'))return url.replace('https://staff-icf-cambodia.com/','');
    var m=url.match(/[?&]id=([^&]+)/)||url.match(/\/file\/d\/([^/]+)/);
    return m?'https://lh3.googleusercontent.com/d/'+m[1]+'=s400':url;
  }

  function initials(name){
    return name.split(' ').filter(Boolean).slice(0,2).map(function(w){return w[0].toUpperCase();}).join('');
  }

  function avatar(person,size){
    var e=function(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');};
    if(person.photo)return'<img src="'+e(person.photo)+'" style="width:'+size+'px;height:'+size+'px;border-radius:50%;object-fit:cover;object-position:top;flex-shrink:0;">';
    return'<div style="width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+pl.m+';display:flex;align-items:center;justify-content:center;font-weight:500;font-size:'+(size<40?11:13)+'px;color:'+pl.a+';flex-shrink:0;">'+initials(person.name)+'</div>';
  }

  function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');}

  function managerCard(person){
    return'<div data-person="'+esc(person.name)+'" style="display:flex;align-items:center;gap:10px;cursor:pointer;background:'+pl.l+';border-radius:10px;padding:10px 12px;transition:background .15s,box-shadow .15s;" onmouseover="this.style.background=\''+pl.m+'\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,.1)\'" onmouseout="this.style.background=\''+pl.l+'\';this.style.boxShadow=\'none\'">'
      +avatar(person,44)
      +'<div><div style="font-weight:500;font-size:12.5px;color:'+pl.t+';">'+esc(person.name)+'</div>'
      +'<div style="font-size:11px;color:'+pl.a+';">'+esc(person.role)+'</div></div></div>';
  }

  function staffCard(person){
    return'<div data-person="'+esc(person.name)+'" style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#fff;border:1px solid '+pl.m+';border-left:3px solid '+pl.lb+';border-radius:8px;padding:7px 10px;transition:background .15s;" onmouseover="this.style.background=\''+pl.l+'\'" onmouseout="this.style.background=\'#fff\'">'
      +avatar(person,32)
      +'<div><div style="font-weight:500;font-size:11.5px;color:#1f2937;">'+esc(person.name)+'</div>'
      +'<div style="font-size:10.5px;color:#6b7280;">'+esc(person.role)+'</div></div></div>';
  }

  // Leaf column (no sub-groups)
  function buildCol(label,head,staff){
    var inner='';
    if(head)inner+=managerCard(head);
    if(staff.length){
      inner+='<div style="margin-top:6px;margin-left:18px;border-left:2px solid '+pl.c+';padding-left:10px;display:flex;flex-direction:column;gap:5px;">';
      staff.forEach(function(s){inner+=staffCard(s);});
      inner+='</div>';
    }
    return'<div style="display:flex;flex-direction:column;align-items:center;">'
      +'<div style="width:2px;height:16px;background:'+pl.c+';"></div>'
      +'<div style="width:'+COL_W+'px;box-sizing:border-box;display:flex;flex-direction:column;gap:0;background:#fff;border:1.5px solid #e2e8f0;border-top:3px solid '+pl.a+';border-radius:10px;padding:12px 10px;">'
      +'<div style="font-size:9px;font-weight:500;color:'+pl.a+';text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">'+esc(label)+'</div>'
      +inner+'</div></div>';
  }

  // Count leaf columns in a subtree (for bar width calculation)
  function countLeaves(g,childrenOf){
    var ch=childrenOf[g]||[];
    if(!ch.length)return 1;
    return ch.reduce(function(s,cg){return s+countLeaves(cg,childrenOf);},0);
  }

  // Build a node that may have sub-columns
  function buildNode(g,groups,childrenOf){
    var members=groups[g];
    // Pick head: highest-level person (Manager > Leader > Team)
    function lvlRank(l){return l==='Manager'?3:l==='Leader'?2:l==='Team'?1:0;}
    var head=null,bestRank=-1;
    members.forEach(function(m){var r=lvlRank(m.level);if(r>bestRank){bestRank=r;head=m;}});
    if(!head)head=members[0];
    var directStaff=members.filter(function(m){return m!==head;});
    var children=childrenOf[g]||[];

    if(!children.length){
      // Leaf node: simple column
      return buildCol(g,head,directStaff);
    }

    // Intermediate node: manager card + sub-columns below
    var manHtml=managerCard(head);
    if(directStaff.length){
      manHtml+='<div style="margin-top:6px;margin-left:18px;border-left:2px solid '+pl.c+';padding-left:10px;display:flex;flex-direction:column;gap:5px;">';
      directStaff.forEach(function(s){manHtml+=staffCard(s);});
      manHtml+='</div>';
    }

    var subHtml='';
    children.forEach(function(cg){subHtml+=buildNode(cg,groups,childrenOf);});
    var leaves=children.reduce(function(s,cg){return s+countLeaves(cg,childrenOf);},0);
    var subBarW=Math.max(leaves*COL_TOTAL-COL_GAP,COL_W);

    return'<div style="display:flex;flex-direction:column;align-items:center;">'
      +'<div style="width:2px;height:16px;background:'+pl.c+';"></div>'
      +'<div style="min-width:'+COL_W+'px;box-sizing:border-box;background:#fff;border:1.5px solid #e2e8f0;border-top:3px solid '+pl.a+';border-radius:10px;padding:12px 10px;">'
        +'<div style="font-size:9px;font-weight:500;color:'+pl.a+';text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">'+esc(g)+'</div>'
        +manHtml
      +'</div>'
      +'<div style="width:2px;height:12px;background:'+pl.c+';"></div>'
      +(leaves>1?'<div style="width:'+subBarW+'px;border-top:2px solid '+pl.c+';"></div>':'')
      +'<div style="display:flex;gap:'+COL_GAP+'px;align-items:flex-start;">'+subHtml+'</div>'
    +'</div>';
  }

  fetch(SHEET)
    .then(function(r){return r.text();})
    .then(function(csv){
      var rows=parseCSV(csv);
      if(rows.length<2)return;
      var h=rows[0].map(function(x){return x.trim().toLowerCase();});
      var iSort =h.findIndex(function(x){return x==='sort'||x.includes('#');});
      var iName =h.indexOf('name');
      var iRole =h.findIndex(function(x){return x.includes('role');});
      var iDept =h.findIndex(function(x){return x==='department'||x==='dept';});
      var iGrp  =h.findIndex(function(x){return x==='group'||x.startsWith('sub');});
      var iPhoto=h.findIndex(function(x){return x.includes('photo');});
      var iLeft =h.findIndex(function(x){return x.includes('left');});
      var iActive=h.findIndex(function(x){return/active/i.test(x);});
      var iMgr  =h.indexOf('manager');
      var iLevel=h.indexOf('level');
      var today=new Date();today.setHours(0,0,0,0);

      var depts=[DEPT].concat(EXTRA);
      var people=[];

      for(var i=1;i<rows.length;i++){
        var r=rows[i];
        if(!r.length||r.every(function(x){return!x.trim();}))continue;
        if(iSort>=0){var sv=(r[iSort]||'').trim();if(!sv||isNaN(Number(sv)))continue;}
        var dept=iDept>=0?(r[iDept]||'').trim():'';
        if(depts.indexOf(dept)<0)continue;
        var name=iName>=0?r[iName].trim():'';
        if(!name)continue;
        if(ROOT&&name===ROOT)continue;
        var level=iLevel>=0?(r[iLevel]||'').trim():'';
        if(level==='Director')continue;
        if(iLeft>=0&&(r[iLeft]||'').trim()){var ld=new Date(r[iLeft].trim());if(!isNaN(ld)&&ld<=today)continue;}
        if(iActive>=0&&(r[iActive]||'').trim()){var ad=new Date(r[iActive].trim());if(!isNaN(ad)&&ad>today)continue;}
        people.push({
          name:name,
          role:iRole>=0?(r[iRole]||'').trim():'',
          photo:resolvePhoto(iPhoto>=0?(r[iPhoto]||''):''),
          group:iGrp>=0?(r[iGrp]||'').trim():'',
          manager:iMgr>=0?(r[iMgr]||'').trim():'',
          level:iLevel>=0?(r[iLevel]||'').trim():'',
        });
      }
      if(!people.length)return;

      // Group by Group column, preserving Sheet order
      var groupOrder=[],groups={};
      people.forEach(function(person){
        var g=person.group||'Team';
        if(!groups[g]){groups[g]=[];groupOrder.push(g);}
        groups[g].push(person);
      });

      // Find head of each group (highest-level, Sheet order as tiebreak)
      function lvlRank(l){return l==='Manager'?3:l==='Leader'?2:l==='Team'?1:0;}
      function getHead(members){
        var head=null,best=-1;
        members.forEach(function(m){var r=lvlRank(m.level);if(r>best){best=r;head=m;}});
        return head||members[0];
      }

      // Build head→group map
      var headToGroup={};
      groupOrder.forEach(function(g){
        var h=getHead(groups[g]);
        if(h)headToGroup[h.name]=g;
      });

      // Classify: which groups are sub-groups of another group?
      var childrenOf={}; // parentGroup → [childGroup, ...]
      var isChild={};    // groupName → true if it's a sub-group

      groupOrder.forEach(function(g){
        var head=getHead(groups[g]);
        if(!head)return;
        var mgr=head.manager;
        if(mgr&&headToGroup[mgr]&&headToGroup[mgr]!==g){
          var parent=headToGroup[mgr];
          if(!childrenOf[parent])childrenOf[parent]=[];
          childrenOf[parent].push(g);
          isChild[g]=true;
        }
      });

      // Top-level groups: not classified as children of another group
      var topGroups=groupOrder.filter(function(g){return!isChild[g];});

      // Build HTML for all top-level nodes
      var colsHtml='';
      topGroups.forEach(function(g){colsHtml+=buildNode(g,groups,childrenOf);});

      // Top horizontal bar width: sum of leaf counts across top groups
      var totalLeaves=topGroups.reduce(function(s,g){return s+countLeaves(g,childrenOf);},0);
      var barW=Math.max(totalLeaves*COL_TOTAL-COL_GAP,COL_W);

      var html='<div style="width:2px;height:16px;background:'+pl.c+';"></div>'
              +(totalLeaves>1?'<div style="width:'+barW+'px;border-top:2px solid '+pl.c+';"></div>':'')
              +'<div style="display:flex;gap:'+COL_GAP+'px;align-items:flex-start;">'+colsHtml+'</div>';
      container.innerHTML=html;
    })
    .catch(function(){});
})();
