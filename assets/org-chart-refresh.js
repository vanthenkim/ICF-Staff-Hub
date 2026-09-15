/* org-chart-refresh.js
   Fetches the Master Sheet and refreshes department org chart cards:
   1. Greys out / strikes through departed or not-yet-started staff
   2. Updates <img> photo src from Sheet Photo_URL column
   Works on elements with data-person="Name" or data-org-name="Name".
   Include after page content on any page with an org chart.
*/
(function(){
  var SHEET_CSV='https://docs.google.com/spreadsheets/d/1TVyhqGjtqrKeiCfWZBVCdAnMRH34zwcvHILvMRaBCsk/gviz/tq?tqx=out:csv&sheet=Master';

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

  fetch(SHEET_CSV)
    .then(function(r){return r.text();})
    .then(function(csv){
      var rows=parseCSV(csv);
      if(rows.length<2)return;

      var h=rows[0].map(function(x){return x.trim().toLowerCase();});
      var iSort  =h.findIndex(function(x){return x==='sort'||x.includes('#');});
      var iName  =h.indexOf('name');
      var iPhoto =h.findIndex(function(x){return x.includes('photo');});
      var iLeft  =h.findIndex(function(x){return x.includes('left');});
      var iActive=h.findIndex(function(x){return /active/i.test(x);});
      var today  =new Date();today.setHours(0,0,0,0);

      for(var i=1;i<rows.length;i++){
        var r=rows[i];
        if(!r.length||r.every(function(x){return!x.trim();}))continue;
        if(iSort>=0){var n=(r[iSort]||'').trim();if(!n||isNaN(Number(n)))continue;}
        var name=iName>=0?r[iName].trim():'';
        if(!name)continue;

        // Date checks
        var isLeft=false,isNotStarted=false;
        if(iLeft>=0&&(r[iLeft]||'').trim()){
          var ld=new Date(r[iLeft].trim());
          if(!isNaN(ld)&&ld<=today)isLeft=true;
        }
        if(iActive>=0&&(r[iActive]||'').trim()){
          var ad=new Date(r[iActive].trim());
          if(!isNaN(ad)&&ad>today)isNotStarted=true;
        }

        var photo=resolvePhoto(iPhoto>=0?(r[iPhoto]||''):'');

        // Find cards by data-person or data-org-name
        var selector='[data-person="'+name.replace(/"/g,'&quot;')+'"],'
                    +'[data-org-name="'+name.replace(/"/g,'&quot;')+'"]';
        var cards;
        try{cards=document.querySelectorAll(selector);}catch(e){continue;}

        cards.forEach(function(card){
          // Update photo if Sheet has one
          if(photo){
            var img=card.querySelector('img');
            if(img&&img.src!==photo){
              var resolved=new URL(photo,location.href).href;
              if(img.src!==resolved)img.src=resolved;
            }
          }

          // Grey out departed / not-yet-started
          if(isLeft||isNotStarted){
            card.style.opacity='0.4';
            card.style.filter='grayscale(0.6)';
            var nameEl=card.querySelector('[style*="font-weight:500"]');
            if(nameEl)nameEl.style.textDecoration='line-through';
          }
        });
      }
    })
    .catch(function(){});
})();
