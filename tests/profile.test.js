// 내 프로필과 공고 맞추기 (src/lib/profile.js), 우대 조건 찾기 (api/_lib/builders.js prefsOf)
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { prefsOf } from '../api/_lib/builders.js';
import { EMPTY_PROFILE, hasProfile, isGoodMatch, matchJob } from '../src/lib/profile.js';

const job = (over = {}) => ({ ncs: ['경영.회계.사무'], regions: ['울산'], edu: ['학력무관'], prefs: ['local', 'veteran'], ...over });
const me = (over = {}) => ({ ...EMPTY_PROFILE, ...over });

describe('맞는 이유·막히는 이유', () => {
  test('프로필이 비어 있으면 판단하지 않음', () => {
    assert.equal(hasProfile(EMPTY_PROFILE), false);
    assert.deepEqual(matchJob(job(), EMPTY_PROFILE), { score: 0, reasons: [], blockers: [] });
  });
  test('직무·지역·우대가 맞으면 이유가 모두 나옴', () => {
    const m = matchJob(job(), me({ fields: ['경영.회계.사무'], regions: ['울산'], prefs: ['local'] }));
    assert.deepEqual(m.reasons, ['경영·회계·사무 직무', '울산 근무', '지역인재 우대']);
    assert.equal(m.blockers.length, 0);
    assert.equal(isGoodMatch(m), true);
  });
  test('다른 직무·다른 지역이면 막힘', () => {
    const m = matchJob(job(), me({ fields: ['정보통신'], regions: ['서울'] }));
    assert.deepEqual(m.blockers, ['다른 직무', '다른 지역']);
    assert.equal(isGoodMatch(m), false);
  });
  test('학력: 학력무관은 통과, 정해진 학력이 다르면 막힘', () => {
    assert.equal(matchJob(job(), me({ edu: '고졸' })).blockers.length, 0);
    assert.deepEqual(matchJob(job({ edu: ['석사', '박사'] }), me({ edu: '대졸(4년)' })).blockers, ['학력 조건(석사·박사)']);
    assert.deepEqual(matchJob(job({ edu: ['고졸'] }), me({ edu: '고졸' })).reasons, ['고졸 대상']);
  });
  test('공고에 정보가 없으면 그 항목은 따지지 않음', () => {
    const m = matchJob(job({ ncs: [], regions: [] }), me({ fields: ['정보통신'], regions: ['서울'], prefs: ['veteran'] }));
    assert.deepEqual(m.blockers, []);
    assert.deepEqual(m.reasons, ['보훈(취업지원대상자) 우대']);
  });
  test('지역인재 지역을 고르면 근무지가 같을 때만 지역인재 우대', () => {
    assert.deepEqual(matchJob(job(), me({ prefs: ['local'], localRegion: '울산' })).reasons, ['지역인재 우대']);
    assert.deepEqual(matchJob(job(), me({ prefs: ['local'], localRegion: '부산' })).reasons, []);
  });
});

test('공고 글에서 우대 조건 찾기', () => {
  assert.deepEqual(prefsOf({ prefCondCn: '취업지원대상자, 장애인, 자립준비청년, 한국사능력검정시험' }), [
    'veteran', 'disabled', 'selfreliant', 'history',
  ]);
  assert.deepEqual(prefsOf({ prefCondCn: '이전지역 지역인재', aplyQlfcCn: '기초생활수급자 우대' }), ['local', 'lowincome']);
  assert.deepEqual(prefsOf({}), []);
});
