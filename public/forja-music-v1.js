/* FORJA Music: navigation only, no fabricated playlist URLs. */
(function(){'use strict';
const lanes=[['🔥','IGNITION','Alongar e aquecer','35 músicas'],['🏃','ENDURANCE','Correr','35 músicas'],['🏋️','UNBREAKABLE','Malhar','36 músicas']];
const deezerOfficial={IGNITION:'https://link.deezer.com/s/34NenCHxy9ndO5xJf5Wir',ENDURANCE:'https://link.deezer.com/s/34Neo59PYL4m09E2LGUB6',UNBREAKABLE:'https://link.deezer.com/s/34NeorNQ1AHLL0PqHP5br'};
const apps=[['Deezer','https://www.deezer.com/'],['Spotify','https://open.spotify.com/'],['Apple Music','https://music.apple.com/'],['YouTube Music','https://music.youtube.com/']];
function escapeText(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function panel(link=''){
const cards=lanes.map(([emoji,title,subtitle,count])=>`<div class="panel" style="flex:1;min-width:175px"><div style="font-size:32px" aria-hidden="true">${emoji}</div><h3>${title}</h3><p class="muted small">${subtitle} · ${count}</p><p class="small muted"><a class="btn alt" href="${deezerOfficial[title]}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${title} no Deezer">OUVIR NO DEEZER</a></p></div>`).join('');
const players=apps.map(([name,url])=>`<a class="btn alt" target="_blank" rel="noopener noreferrer" href="${url}" aria-label="Abrir ${name}">♫ ${name}</a>`).join('');
return `<section class="panel"><div class="kicker" style="margin:0">FORJA MUSIC</div><h2>TRILHA DE EVOLUÇÃO</h2><p class="muted small">Três ritmos. O seu treino, a sua escolha.</p><div style="display:flex;gap:10px;flex-wrap:wrap">${cards}</div><h3>Escolha seu aplicativo</h3><div class="actions" style="flex-wrap:wrap">${players}</div><p class="small muted">Os botões abrem os aplicativos; playlists específicas ainda não foram vinculadas.</p><label class="small">Sua playlist Deezer<input class="forminput" id="deezerPlaylist" type="url" inputmode="url" autocomplete="url" maxlength="600" value="${escapeText(link)}" placeholder="https://www.deezer.com/playlist/..."></label><div class="actions"><button class="btn alt" data-action="saveDeezer">SALVAR PLAYLIST</button>${link?`<a class="btn alt" href="${escapeText(link)}" target="_blank" rel="noopener noreferrer">ABRIR MINHA PLAYLIST</a>`:''}</div></section>`;
}
window.forjaMusicPanel=panel;
})();
