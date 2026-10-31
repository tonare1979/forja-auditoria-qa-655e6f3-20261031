import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const styles=html.match(/\.forja-ex-summary \.forja-equipment-photo\{([^}]+)\}/);
assert.ok(styles,'CSS da miniatura do exercício deve existir');
assert.match(styles[1],/object-fit:\s*contain\b/,'miniatura deve exibir equipamento inteiro, sem recorte');
assert.doesNotMatch(styles[1],/filter:\s*saturate\(/,'foto não pode ter filtro que distorce a referência');
assert.match(html,/class="forja-ex-summary"/,'cartão de exercício permanece compacto');
console.log('FORJA_EQUIPMENT_THUMB_NO_CROP_PASS');
