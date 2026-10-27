/* FORJA Music. Approved visual direction: three lanes and four services. No invented playlist links. */
(function(){'use strict';
const lanes=[
 {id:'IGNITION',title:'Alongamento e aquecimento',hint:'Músicas mais leves para começar e preparar o corpo.',icon:'♧',tone:'warm',deezer:'https://link.deezer.com/s/34NenCHxy9ndO5xJf5Wir'},
 {id:'ENDURANCE',title:'Corrida',hint:'Ritmo e consistência para o seu cardio e para ir mais longe.',icon:'🏃',tone:'run',deezer:'https://link.deezer.com/s/34Neo59PYL4m09E2LGUB6'},
 {id:'UNBREAKABLE',title:'Musculação',hint:'Foco, intensidade e energia para os seus treinos de força.',icon:'🏋',tone:'strength',deezer:'https://link.deezer.com/s/34NeorNQ1AHLL0PqHP5br'}
];
const apps=[{name:'Deezer',logo:'▥'},{name:'Spotify',logo:'◉',url:'https://open.spotify.com/'},{name:'Apple Music',logo:'♫',url:'https://music.apple.com/'},{name:'YouTube Music',logo:'▶',url:'https://music.youtube.com/'}];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=`<style>
.forja-music-approved{margin:14px 0;padding:16px;border:1px solid #3c4930;border-radius:20px;background:linear-gradient(135deg,#121811,#1b2119);color:#f8faf4}
.forja-music-approved h2{font-weight:900;letter-spacing:.01em;margin:0 0 4px;font-size:clamp(18px,5vw,26px)}
.forja-music-approved .fma-intro{color:#b7bcb4;line-height:1.5;margin:10px 0 16px}
.forja-music-approved .fma-lane{border:1px solid #354035;border-radius:17px;background:#171d17;margin:12px 0;padding:12px}
.forja-music-approved .fma-head{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.forja-music-approved .fma-icon{flex:0 0 64px;height:64px;border-radius:14px;display:grid;place-items:center;font-size:35px;color:#fff;background:linear-gradient(135deg,#ffab3b,#f04a29)}
.forja-music-approved .fma-run{background:linear-gradient(135deg,#3fdd66,#087d5b)}.forja-music-approved .fma-strength{background:linear-gradient(135deg,#c77aff,#6327c9)}
.forja-music-approved .fma-title{font-weight:800;font-size:17px}.forja-music-approved .fma-hint{font-size:13px;color:#b5bbb2}
.forja-music-approved .fma-players{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.forja-music-approved .fma-player{display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 5px;text-decoration:none!important;color:#f4f4f2!important;border:1px solid #485046;border-radius:11px;font-size:12px;font-weight:700;background:#101610;min-width:0}
.forja-music-approved .fma-logo{font-size:19px;color:#bbf247}
@media(min-width:600px){.forja-music-approved .fma-players{grid-template-columns:repeat(4,minmax(0,1fr))}}
</style>`;
function panel(){
const cards=lanes.map(l=>`<section class="fma-lane"><div class="fma-head"><div class="fma-icon fma-${l.tone}" aria-hidden="true">${l.icon}</div><div><div class="fma-title">${l.title}</div><div class="fma-hint">${l.hint}</div></div></div><div class="fma-players">${apps.map(a=>`<a class="fma-player" href="${esc(a.name==='Deezer'?l.deezer:a.url)}" target="_blank" rel="noopener noreferrer" aria-label="${a.name==='Deezer'?'Ouvir playlist '+l.id+' no Deezer':'Abrir '+a.name+' (playlist específica ainda não vinculada)'}"><span class="fma-logo" aria-hidden="true">${a.logo}</span>${a.name}</a>`).join('')}</div></section>`).join('');
return css+`<section class="forja-music-approved"><h2>♧ SUA TRILHA DE EVOLUÇÃO</h2><div class="fma-hint">FORJA · Música e motivação</div><p class="fma-intro">Três playlists oficiais para diferentes momentos do seu treino.</p>${cards}</section>`;
}
window.forjaMusicPanel=panel;
})();