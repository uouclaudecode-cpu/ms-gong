// D-Day, 새 공고, 신입/경력, 공고 링크, 캘린더 링크
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { hireTypeOf } from '../api/_lib/builders.js';
import { CAREERS, isNewJob, stageOf } from '../src/lib/apply.js';
import { addDays, byDeadline, formatKoreanDate, getDday } from '../src/lib/dday.js';
import { googleCalendarUrl, jobLink } from '../src/lib/links.js';

const TODAY = '2026-10-09';

describe('D-Day', () => {
  test('라벨과 색 구분', () => {
    assert.deepEqual(getDday('2026-10-09', TODAY), { days: 0, label: 'D-Day', tone: 'urgent' });
    assert.equal(getDday('2026-10-12', TODAY).label, 'D-3');
    assert.equal(getDday('2026-10-12', TODAY).tone, 'urgent');
    assert.equal(getDday('2026-10-16', TODAY).tone, 'soon');
    assert.equal(getDday('2026-10-30', TODAY).tone, 'normal');
    assert.equal(getDday('2026-10-08', TODAY).tone, 'closed');
    assert.equal(getDday(null, TODAY).label, '상시');
  });
  test('날짜 계산·표시', () => {
    assert.equal(addDays(3, TODAY), '2026-10-12');
    assert.equal(addDays(-9, TODAY), '2026-09-30');
    assert.equal(formatKoreanDate('2026-10-09'), '10월 9일 (금)');
  });
  test('마감 순 정렬: 남은 것 → 상시 → 지난 것', () => {
    const d = (n) => ({ deadline: n === null ? null : addDays(n) });
    const sorted = [d(-2), d(null), d(5), d(1)].sort(byDeadline).map((j) => j.deadline && getDday(j.deadline).days);
    assert.deepEqual(sorted, [1, 5, null, -2]);
  });
});

describe('새 공고·신입/경력·지원 단계', () => {
  test('어제·오늘 시작한 공고만 NEW', () => {
    assert.equal(isNewJob({ startsAt: '2026-10-09' }, TODAY), true);
    assert.equal(isNewJob({ startsAt: '2026-10-08' }, TODAY), true);
    assert.equal(isNewJob({ startsAt: '2026-10-07' }, TODAY), false);
    assert.equal(isNewJob({}, TODAY), false);
  });
  test('신입 가능 = 신입·신입+경력', () => {
    const test = (key, career) => CAREERS.find((c) => c.key === key).test({ career });
    assert.equal(test('new', '신입'), true);
    assert.equal(test('new', '신입+경력'), true);
    assert.equal(test('new', '경력'), false);
    assert.equal(test('exp', '신입'), false);
  });
  test('단계가 없거나 이상하면 지원 예정', () => {
    assert.equal(stageOf({}).key, 'planned');
    assert.equal(stageOf({ status: 'nope' }).key, 'planned');
    assert.equal(stageOf({ status: 'docs' }).label, '서류 합격');
  });
  test('잡알리오 고용형태 대표값', () => {
    assert.equal(hireTypeOf({ hireTypeNmLst: '정규직' }), '정규직');
    assert.equal(hireTypeOf({ hireTypeNmLst: '비정규직,청년인턴(체험형)' }), '인턴');
    assert.equal(hireTypeOf({ hireTypeNmLst: '정규직,무기계약직,비정규직' }), '정규직');
    assert.equal(hireTypeOf({ hireTypeNmLst: '비정규직' }), '비정규직');
    assert.equal(hireTypeOf({}), '비정규직');
  });
});

describe('공고 링크', () => {
  const job = { url: 'https://job.alio.go.kr/recruitview.do?idx=305858' };
  const mobile = 'https://job.alio.go.kr/mobile2021/recruit/recruitView.do?idx=305858';
  const withUA = (ua, fn) => {
    const prev = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', { value: { userAgent: ua }, configurable: true });
    try {
      return fn();
    } finally {
      if (prev) Object.defineProperty(globalThis, 'navigator', prev);
      else delete globalThis.navigator;
    }
  };

  test('PC는 PC 공고, 휴대폰은 모바일 공고', () => {
    assert.equal(withUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129', () => jobLink(job)), job.url);
    assert.equal(withUA('Mozilla/5.0 (Linux; Android 14) Chrome/129 Mobile', () => jobLink(job)), mobile);
    assert.equal(withUA('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', () => jobLink(job)), mobile);
  });
  test('잡알리오 공고 주소가 아니면 그대로', () => {
    const other = { url: 'https://job.alio.go.kr/recruit.do' };
    assert.equal(withUA('Android', () => jobLink(other)), other.url);
  });
  test('구글 캘린더: 마감일 하루 종일 + 모바일 공고 주소', () => {
    const u = new URL(googleCalendarUrl({ title: '신입 채용', deadline: '2026-10-31', url: job.url, companyName: '한국전력공사' }));
    assert.equal(u.searchParams.get('dates'), '20261031/20261101');
    assert.equal(u.searchParams.get('text'), '[마감] 한국전력공사 신입 채용');
    assert.ok(u.searchParams.get('details').includes(mobile));
  });
});
