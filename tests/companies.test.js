// 기업 목록이 지켜야 할 약속 (src/data/companies.js, src/data/institutions.js)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { COMPANIES, SECTORS } from '../src/data/companies.js';
import { cleanInstName, dynamicCompany, parseDynamicId } from '../src/data/institutions.js';

test('id·이름·기관코드가 겹치지 않음', () => {
  for (const key of ['id', 'name', 'code']) {
    const values = COMPANIES.map((c) => c[key]).filter(Boolean);
    assert.equal(new Set(values).size, values.length, `${key} 중복`);
  }
});

test('필수 항목과 형식', () => {
  for (const c of COMPANIES) {
    assert.match(c.id, /^[a-z]+$/, `${c.name} id`);
    assert.ok(SECTORS.includes(c.sector), `${c.name} 분야 '${c.sector}'`);
    assert.ok(c.short && c.hq && c.emoji, `${c.name} 약칭·본사·아이콘`);
    if (c.code) assert.match(c.code, /^C\d{4}$/, `${c.name} 기관코드`);
    // 자회사 이름은 그 기업 이름(약칭)을 품고 있어야 걸러낼 의미가 있음
    for (const e of c.excludes ?? []) assert.ok(e.includes(c.short) || e.includes(c.name.slice(0, 4)), `${c.name} excludes '${e}'`);
  }
});

test('목록 밖 기관 id', () => {
  assert.equal(parseDynamicId('x-C0021'), 'C0021');
  assert.equal(parseDynamicId('kepco'), null);
  assert.equal(parseDynamicId('x-../etc'), null);
  assert.equal(cleanInstName('한국수력원자력(주)'), '한국수력원자력');
  assert.equal(dynamicCompany('C0021', '국립공원공단').id, 'x-C0021');
});
