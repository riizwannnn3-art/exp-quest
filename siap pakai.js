/* =====================================================
   QUEST XP - JALUR ILMUWAN (FINAL)
   - Naik level: 100 × lvl^1.15
   - Max level 200
   - Inggris/Jepang: 25 XP per unit
   - IPA/Coding: 35 XP per menit
   - Berkebun: 17 XP per menit
   - Quest default klik: 300 XP
   - Ilmuwan Hebat di Level 100
===================================================== */

/* ================= KONFIG ================= */
var XP_DEFAULT = 300;
var XP_REWARD = 500;
var MAX_UNIT = 500;
var GOAL_LV = 100;
var MAX_LV = 200;
var KEY = 'questXp_v6';

var BOBOT = { inggris:25, jepang:25, ipa:35, coding:35, berkebun:17 };
var TIMER = { ipa:35, coding:35, berkebun:17 };

var LABEL = {
  inggris:'🇬🇧 Bahasa Inggris', jepang:'🇯🇵 Bahasa Jepang',
  ipa:'🔬 IPA', coding:'💻 Programming', berkebun:'🌱 Berkebun'
};

/* ================= 200 LEVEL ================= */
var RANGES = [
  [1,10,'Pemula'],[11,20,'Pelajar'],[21,30,'Siswa Rajin'],
  [31,40,'Peneliti Muda'],[41,50,'Asisten Lab'],[51,60,'Sarjana'],
  [61,70,'Analis'],[71,80,'Ilmuwan Muda'],[81,90,'Peneliti'],
  [91,100,'ILMUWAN HEBAT'],[101,115,'Profesor'],[116,130,'Ilmuwan Senior'],
  [131,145,'Master Sains'],[146,160,'Ilmuwan Agung'],
  [161,175,'Ilmuwan Besar'],[176,190,'Ilmuwan Terkemuka'],
  [191,200,'ILMUWAN LEGENDARIS']
];

function emojiFor(lv){
  if(lv<=10)return '🌱'; if(lv<=20)return '📖'; if(lv<=30)return '🎓';
  if(lv<=40)return '🔍'; if(lv<=50)return '🧪'; if(lv<=60)return '📚';
  if(lv<=70)return '🎯'; if(lv<=80)return '🧠'; if(lv<=90)return '🔬';
  if(lv<=100)return '🏆'; if(lv<=115)return '🎖️'; if(lv<=130)return '👑';
  if(lv<=145)return '💠'; if(lv<=160)return '🔱'; if(lv<=175)return '🌌';
  if(lv<=190)return '☄️'; return '👑';
}

var LEVELS = [];
(function build(){
  var total = 0;
  for(var i=1;i<=MAX_LV;i++){
    var need = Math.floor(100 * Math.pow(i, 1.15));
    var pre = 'Ilmuwan';
    for(var r=0;r<RANGES.length;r++){
      if(i>=RANGES[r][0] && i<=RANGES[r][1]){ pre=RANGES[r][2]; break; }
    }
    LEVELS.push({ lvl:i, title:pre+' Lv'+i, emoji:emojiFor(i), xp:total, need:need });
    total += need;
  }
})();

/* ================= HADIAH ================= */
var REWARDS = [
  ['☕','Istirahat santai 20 menit + minum kopi/teh favorit'],
  ['🍫','Makan snack coklat kesukaanmu!'],
  ['🎮','Main game / nonton 30 menit tanpa rasa bersalah'],
  ['🎵','Dengerin 5 lagu favorit sambil santai'],
  ['📚','Baca 1 bab buku fiksi yang kamu suka'],
  ['🚶','Jalan-jalan santai 15 menit keluar rumah'],
  ['🍕','Pesan makanan favoritmu sekali ini!'],
  ['💤','Tidur siang 30 menit (power nap)'],
  ['🧘','Meditasi / peregangan 15 menit'],
  ['🎬','Nonton 1 film / 2 episode series favorit'],
  ['🧋','Beli minuman favoritmu (boba/eskrim dll)'],
  ['🌟','Self-reward: beli sesuatu kecil yang kamu pengen'],
  ['📞','Telepon / chat teman lama buat ngobrol santai'],
  ['🛁','Mandi air hangat + skincare santai'],
  ['🎨','Waktu bebas untuk hobi'],
  ['🎧','Dengarkan album/podcast favorit full'],
  ['🍦','Beli es krim / dessert favorit'],
  ['🎁','Bebas pilih hadiah kecil untuk dirimu sendiri!']
];

/* ================= STATE ================= */
var state = { totalXp:0, totalRewards:0, logs:[] };
var timers = {};

/* ================= UTIL ================= */
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fmtD(s){if(!s||s.length<10)return'-';var p=s.split('-');if(p.length<3)return s;var b=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];var i=parseInt(p[1],10)-1;if(i<0||i>11)return s;return p[2]+' '+b[i]+' '+p[0];}
function fmtT(iso){var d=new Date(iso);if(isNaN(d.getTime()))return'--:--';return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function fmtTimer(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}
function fmt(n){return Number(n||0).toLocaleString('id-ID');}
function esc(t){var d=document.createElement('div');d.textContent=String(t==null?'':t);return d.innerHTML;}
function setTxt(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}

/* ================= LEVEL ================= */
function getLv(xp){
  if(xp<0)xp=0;
  var cur=LEVELS[0],next=null;
  for(var i=0;i<LEVELS.length;i++){
    if(xp>=LEVELS[i].xp){cur=LEVELS[i];next=LEVELS[i+1]||null;}else break;
  }
  var inLv=xp-cur.xp,need=cur.need||0,pct=need>0?Math.min(100,(inLv/need)*100):100;
  return {cur:cur,next:next,inLv:inLv,need:need,pct:pct,max:cur.lvl===MAX_LV};
}

/* ================= HITUNG XP ================= */
function hitungXp(text,cat){
  var bobot=BOBOT[cat]||25;
  var m=text.match(/\d+(?:[.,]\d+)?/);
  if(!m)return {xp:XP_DEFAULT,calc:'Default quest: '+fmt(XP_DEFAULT)+' XP'};
  var a=parseFloat(m[0].replace(',','.'));
  if(isNaN(a)||a<=0)return {xp:XP_DEFAULT,calc:'Default quest: '+fmt(XP_DEFAULT)+' XP'};
  var f=Math.min(a,MAX_UNIT);
  var xp=Math.round(f*bobot);if(xp<1)xp=1;
  var c=fmt(f)+' × '+bobot+' XP = '+fmt(xp)+' XP';
  if(a>MAX_UNIT)c+=' (max '+MAX_UNIT+')';
  return {xp:xp,calc:c};
}

/* ================= LOAD / SAVE ================= */
function load(){
  try{
    var s=localStorage.getItem(KEY);
    if(s){
      var p=JSON.parse(s);
      state.totalXp=Math.max(0,Number(p.totalXp)||0);
      state.totalRewards=Math.max(0,Number(p.totalRewards)||0);
      state.logs=Array.isArray(p.logs)?p.logs:[];
    }
  }catch(e){console.error(e);}
}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(state));return true;}
  catch(e){console.error(e);toast('Gagal menyimpan','error');return false;}
}

/* ================= RENDER ================= */
function render(){
  setTxt('dateBadge','📅 '+fmtD(today()));

  var t=today(),tXp=0;
  for(var i=0;i<state.logs.length;i++){
    var l=state.logs[i];
    if(l&&l.time&&l.time.indexOf(t)===0)tXp+=Number(l.xp)||0;
  }

  setTxt('totalXp',fmt(state.totalXp));
  setTxt('todayXp',fmt(tXp));
  setTxt('totalLogs',state.logs.length);
  setTxt('totalRewards',state.totalRewards);
  setTxt('todayCounter','Hari ini: '+fmt(tXp)+' XP');

  var j=getLv(state.totalXp);
  setTxt('levelName',j.cur.emoji+' '+j.cur.title);
  setTxt('levelXpText',j.max?'🎉 LEVEL MAX ('+MAX_LV+')':fmt(j.inLv)+' / '+fmt(j.need)+' XP');

  var pf=document.getElementById('progressFill');
  if(pf)pf.style.width=j.pct+'%';

  renderJourney(j);

  var rb=document.getElementById('redeemBtn');
  if(rb){
    var can=state.totalXp>=XP_REWARD;
    rb.disabled=!can;
    rb.textContent=can?'🎁 Tukar XP jadi Hadiah ('+fmt(XP_REWARD)+' XP)'
      :'🎁 Butuh '+fmt(XP_REWARD)+' XP (kurang '+fmt(XP_REWARD-state.totalXp)+')';
  }
  renderLogs();
}

function renderJourney(j){
  var goal=LEVELS[GOAL_LV-1];
  var tp=goal?Math.min(100,(state.totalXp/goal.xp)*100):100;
  setTxt('journeyProgress',Math.floor(tp)+'%');
  setTxt('journeyCurrent',j.cur.emoji+' '+j.cur.title);

  var nEl=document.getElementById('journeyNext');
  if(nEl){
    if(j.next&&!j.max){
      var butuh=j.next.xp-state.totalXp;
      nEl.textContent='→ Lv'+j.next.lvl+' (butuh '+fmt(butuh)+' XP)';
    } else nEl.textContent='🎉 Level Max!';
  }

  var map=document.getElementById('journeyMap');
  if(map){
    var s=Math.max(0,j.cur.lvl-4),e2=Math.min(LEVELS.length,s+9);
    if(e2-s<9)s=Math.max(0,e2-9);
    var html='';
    for(var k=s;k<e2;k++){
      var lv=LEVELS[k];
      var cls='jn';
      if(state.totalXp>=lv.xp)cls+=' done';
      if(j.cur.lvl===lv.lvl)cls+=' current';
      html+='<div class="'+cls+'" title="Lv'+lv.lvl+' '+lv.title+' ('+fmt(lv.xp)+' XP)">'+lv.emoji+'</div>';
    }
    map.innerHTML=html;
  }
}

function renderLogs(){
  var list=document.getElementById('logList');
  if(!list)return;
  setTxt('logCounter',state.logs.length);

  if(state.logs.length===0){
    list.innerHTML='<div class="empty">Belum ada aktivitas. Mulai belajar! ✨</div>';
    return;
  }

  var items=state.logs.slice().reverse().slice(0,100);
  var html='';
  for(var i=0;i<items.length;i++){
    var lg=items[i];
    var cc='cat-'+(lg.cat||'inggris');
    var cl=LABEL[lg.cat]||'Lainnya';
    var ds=(lg.time||'').slice(0,10);
    var ts=lg.time?fmtT(lg.time):'';
    var calc=lg.kalkulasi?'<span class="log-cat">🧮 '+esc(lg.kalkulasi)+'</span>':'';
    html+='<div class="log-item '+cc+'">'
        +'<div class="log-info">'
        +'<span class="log-text">'+esc(lg.text)+'</span>'
        +'<span class="log-cat">'+cl+'</span>'
        +calc
        +'<span class="log-time">📅 '+fmtD(ds)+' • '+ts+'</span>'
        +'</div>'
        +'<span class="log-xp">+'+fmt(lg.xp)+' XP</span>'
        +'<button type="button" class="btn-del-log" data-id="'+esc(String(lg.id))+'">✕</button>'
        +'</div>';
  }
  list.innerHTML=html;

  var btns=list.querySelectorAll('.btn-del-log');
  for(var n=0;n<btns.length;n++){
    btns[n].addEventListener('click',function(){delLog(this.getAttribute('data-id'));});
  }
}

/* ================= AKTIVITAS ================= */
function addAct(cat,text,xp,calc){
  state.logs.push({
    id:Date.now()+'_'+Math.random().toString(36).slice(2,7),
    cat:cat,text:text,xp:xp,kalkulasi:calc||'',time:new Date().toISOString()
  });
  state.totalXp+=xp;
  if(save()){render();checkGoal();}
}

function checkGoal(){
  var g=LEVELS[GOAL_LV-1];
  if(!g)return;
  if(state.totalXp>=g.xp&&!localStorage.getItem('goalReached')){
    localStorage.setItem('goalReached','yes');
    var ov=document.getElementById('goalOverlay');
    if(ov)ov.classList.add('active');
  }
}

/* ================= TOAST ================= */
var tTimer;
function toast(msg,type){
  var t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;
  t.className='toast show'+(type?' '+type:'');
  clearTimeout(tTimer);
  tTimer=setTimeout(function(){t.className='toast';},2600);
}

/* ================= TIMER ================= */
function tUpd(cat){
  var el=document.querySelector('.timer-display[data-timer="'+cat+'"]');
  if(!el)return;
  var t=timers[cat];if(!t)return;
  el.textContent=fmtTimer(t.seconds);
  if(t.running)el.classList.add('running');else el.classList.remove('running');
}
function tBtn(cat){
  var c=document.querySelector('.cat-timer[data-cat="'+cat+'"]');
  if(!c)return;
  var t=timers[cat];
  var sB=c.querySelector('.tbtn.start'),pB=c.querySelector('.tbtn.pause'),tB=c.querySelector('.tbtn.stop');
  if(!t||(!t.running&&t.seconds===0)){
    if(sB){sB.style.display='';sB.textContent='▶';}
    if(pB)pB.style.display='none';
    if(tB)tB.style.display='none';
  } else if(t.running){
    if(sB)sB.style.display='none';
    if(pB)pB.style.display='';
    if(tB)tB.style.display='';
  } else {
    if(sB){sB.style.display='';sB.textContent='▶';}
    if(pB)pB.style.display='none';
    if(tB)tB.style.display='';
  }
}
function tick(cat){
  var t=timers[cat];if(!t||!t.running)return;
  t.seconds++;tUpd(cat);
  if(t.seconds%60===0){
    var m=t.seconds/60,xg=TIMER[cat]||35;
    t.pendingXp=(t.pendingXp||0)+xg;
    var add=Math.floor(t.pendingXp);
    if(add>0){
      t.pendingXp-=add;
      addAct(cat,'Timer '+fmtTimer(t.seconds)+' ('+m+' menit)',add,m+' menit × '+xg+' XP = '+fmt(add)+' XP');
      var c=document.querySelector('.cat-timer[data-cat="'+cat+'"]');
      if(c){
        var r=c.getBoundingClientRect();
        var f=document.createElement('div');
        f.className='float-xp';f.textContent='+'+fmt(add)+' XP';
        f.style.left=(r.left+r.width/2-40)+'px';f.style.top=(r.top+20)+'px';
        document.body.appendChild(f);
        setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f);},1300);
      }
      pulseXp();
      toast('+'+fmt(add)+' XP dari '+LABEL[cat]+' ('+m+' menit)','success');
    }
  }
}
function startT(cat){
  if(!timers[cat])timers[cat]={intervalId:null,seconds:0,running:false,pendingXp:0};
  var t=timers[cat];if(t.running)return;
  t.running=true;
  t.intervalId=setInterval(function(){tick(cat);},1000);
  tUpd(cat);tBtn(cat);
  toast('▶ Timer '+LABEL[cat]+' dimulai','success');
}
function pauseT(cat){
  var t=timers[cat];if(!t||!t.running)return;
  t.running=false;
  if(t.intervalId)clearInterval(t.intervalId);
  t.intervalId=null;
  tUpd(cat);tBtn(cat);
  toast('⏸ Timer dijeda','success');
}
function stopT(cat){
  var t=timers[cat];if(!t)return;
  if(t.pendingXp&&t.pendingXp>=1){
    var s=Math.floor(t.pendingXp);
    if(s>0)addAct(cat,'Timer '+fmtTimer(t.seconds)+' (sisa)',s,'Sisa timer = '+fmt(s)+' XP');
  }
  if(t.intervalId)clearInterval(t.intervalId);
  t.running=false;t.intervalId=null;t.seconds=0;t.pendingXp=0;
  tUpd(cat);tBtn(cat);
  toast('⏹ Timer '+LABEL[cat]+' dihentikan','success');
}
function pulseXp(){
  var tx=document.getElementById('totalXp');
  if(tx){tx.classList.remove('pulse');void tx.offsetWidth;tx.classList.add('pulse');}
}

/* ================= KLIK KARTU ================= */
function onKartu(e){
  var card=e.currentTarget;
  var cat=card.getAttribute('data-cat');
  if(!cat)return;

  var inp=document.getElementById('customInput');
  var txt=inp?inp.value.trim():'';
  var sel=document.getElementById('customCat');

  var xp,calc,textLog;
  if(txt){
    var h=hitungXp(txt,cat);
    xp=h.xp;calc=h.calc;textLog=txt;
    if(inp)inp.value='';
    if(sel)sel.value=cat;
  } else {
    xp=XP_DEFAULT;
    calc='Quest selesai: '+fmt(XP_DEFAULT)+' XP';
    textLog='Selesai: '+LABEL[cat];
  }

  var f=document.createElement('div');
  f.className='float-xp';f.textContent='+'+fmt(xp)+' XP';
  f.style.left=(e.clientX-40)+'px';f.style.top=(e.clientY-20)+'px';
  document.body.appendChild(f);
  setTimeout(function(){if(f.parentNode)f.parentNode.removeChild(f);},1300);

  pulseXp();
  addAct(cat,textLog,xp,calc);
  toast('+'+fmt(xp)+' XP • '+calc,'success');
}

/* ================= HAPUS LOG ================= */
function delLog(id){
  var idx=-1;
  for(var i=0;i<state.logs.length;i++){
    if(String(state.logs[i].id)===String(id)){idx=i;break;}
  }
  if(idx===-1)return;
  var lg=state.logs[idx];
  if(!confirm('Hapus aktivitas ini?\nXP akan dikurangi '+fmt(lg.xp)+' XP.'))return;
  state.totalXp=Math.max(0,state.totalXp-(Number(lg.xp)||0));
  state.logs.splice(idx,1);
  save();render();
  toast('🗑️ Aktivitas dihapus');
}

/* ================= TAMBAH CUSTOM ================= */
function addCustom(){
  var inp=document.getElementById('customInput');
  var sel=document.getElementById('customCat');
  if(!inp||!sel)return;
  var txt=inp.value.trim();
  if(!txt){toast('⚠️ Tulis dulu quest-mu!','error');inp.focus();return;}
  var cat=sel.value;
  var h=hitungXp(txt,cat);
  inp.value='';inp.focus();
  addAct(cat,txt,h.xp,h.calc);
  pulseXp();
  toast('+'+fmt(h.xp)+' XP • '+h.calc,'success');
}

/* ================= REDEEM ================= */
function redeem(){
  if(state.totalXp<XP_REWARD){toast('⚠️ Butuh '+fmt(XP_REWARD)+' XP!','error');return;}
  var r=REWARDS[Math.floor(Math.random()*REWARDS.length)];
  state.totalXp-=XP_REWARD;
  state.totalRewards+=1;
  save();render();
  setTxt('rewardEmoji',r[0]);
  setTxt('rewardText',r[1]);
  var ov=document.getElementById('modalOverlay');
  if(ov)ov.classList.add('active');
}
function closeModal(){
  var ov=document.getElementById('modalOverlay');
  if(ov)ov.classList.remove('active');
}

/* ================= EXPORT / IMPORT ================= */
function expB(){
  try{
    var data=JSON.stringify(state,null,2);
    var blob=new Blob([data],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    var d=new Date();
    a.href=url;
    a.download='quest-xp-backup-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'.json';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
    toast('⬇️ Backup berhasil diunduh','success');
  }catch(e){console.error(e);toast('❌ Gagal ekspor','error');}
}
function impB(file){
  if(!file)return;
  var rd=new FileReader();
  rd.onload=function(ev){
    try{
      var p=JSON.parse(ev.target.result);
      if(typeof p!=='object'||p===null)throw new Error('bad');
      state.totalXp=Math.max(0,Number(p.totalXp)||0);
      state.totalRewards=Math.max(0,Number(p.totalRewards)||0);
      state.logs=Array.isArray(p.logs)?p.logs:[];
      save();render();
      toast('⬆️ Backup berhasil diimpor','success');
    }catch(e){console.error(e);toast('❌ File backup tidak valid!','error');}
  };
  rd.onerror=function(){toast('❌ Gagal baca file','error');};
  rd.readAsText(file);
}

/* ================= RESET ================= */
function resetAll(){
  if(!confirm('Yakin reset SEMUA data?'))return;
  state={totalXp:0,totalRewards:0,logs:[]};
  localStorage.removeItem('goalReached');
  save();render();
  toast('🗑️ Semua data direset');
}

/* ================= BIND ================= */
function bind(id,ev,fn){var el=document.getElementById(id);if(el)el.addEventListener(ev,fn);}

/* ================= INIT ================= */
function init(){
  try{
    load();render();

    var cards=document.querySelectorAll('.cat:not(.cat-timer)');
    for(var i=0;i<cards.length;i++)cards[i].addEventListener('click',onKartu);

    var tb=document.querySelectorAll('.tbtn');
    for(var j=0;j<tb.length;j++){
      tb[j].addEventListener('click',function(e){
        e.stopPropagation();
        var act=this.getAttribute('data-action'),cat=this.getAttribute('data-cat');
        if(!act||!cat)return;
        if(act==='start'){
          var t=timers[cat];
          if(t&&!t.running&&t.seconds>0){
            t.running=true;
            t.intervalId=setInterval(function(){tick(cat);},1000);
            tUpd(cat);tBtn(cat);
            toast('▶ Timer dilanjutkan','success');
          } else startT(cat);
        } else if(act==='pause'){pauseT(cat);}
        else if(act==='stop'){
          if(confirm('Hentikan timer '+LABEL[cat]+'?'))stopT(cat);
        }
      });
    }

    var list=['ipa','coding','berkebun'];
    for(var k=0;k<list.length;k++){
      var c=list[k];
      timers[c]={intervalId:null,seconds:0,running:false,pendingXp:0};
      tUpd(c);tBtn(c);
    }

    bind('addBtn','click',addCustom);
    bind('redeemBtn','click',redeem);
    bind('closeModal','click',closeModal);
    bind('exportBtn','click',expB);
    bind('resetBtn','click',resetAll);
    bind('importBtn','click',function(){
      var fi=document.getElementById('importFile');
      if(fi)fi.click();
    });
    bind('closeGoal','click',function(){
      var g=document.getElementById('goalOverlay');
      if(g)g.classList.remove('active');
    });

    var inp=document.getElementById('customInput');
    if(inp)inp.addEventListener('keypress',function(e){
      if(e.key==='Enter'){e.preventDefault();addCustom();}
    });

    var mo=document.getElementById('modalOverlay');
    if(mo)mo.addEventListener('click',function(e){
      if(e.target.id==='modalOverlay')closeModal();
    });

    var go=document.getElementById('goalOverlay');
    if(go)go.addEventListener('click',function(e){
      if(e.target.id==='goalOverlay')e.target.classList.remove('active');
    });

    var fi=document.getElementById('importFile');
    if(fi)fi.addEventListener('change',function(e){
      if(e.target.files&&e.target.files[0]){
        impB(e.target.files[0]);
        e.target.value='';
      }
    });

    checkGoal();

    window.addEventListener('beforeunload',function(){
      for(var c in timers)if(timers[c].intervalId)clearInterval(timers[c].intervalId);
      save();
    });

    document.addEventListener('visibilitychange',function(){
      if(document.hidden){
        for(var c in timers)if(timers[c].running)pauseT(c);
      }
    });

    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){
        closeModal();
        var g=document.getElementById('goalOverlay');
        if(g)g.classList.remove('active');
      }
    });

  }catch(e){
    console.error('Init error:',e);
    toast('❌ Error: '+e.message,'error');
  }
}

/* ================= JALANKAN ================= */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();