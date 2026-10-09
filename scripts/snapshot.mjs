// 잡알리오 데이터를 미리 만들어 snapshot/ 폴더에 JSON으로 저장합니다.
// GitHub Actions(.github/workflows/snapshot.yml)가 실행해서 `data` 브랜치에 올리고,
// 사이트의 서버 함수가 그 파일을 먼저 읽습니다(api/_lib/snapshot.js).
//
//   node scripts/snapshot.mjs jobs institutions   # 매시간
//   node scripts/snapshot.mjs trends              # 하루 한 번 (우리 목록 기업 전부)
//
// 환경변수 DATA_GO_KR_KEY가 필요합니다. 로컬에서는 .env.local을 읽습니다.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 로컬 실행용: .env.local의 키 읽기 (GitHub Actions에서는 Secrets로 들어옵니다)
try {
  for (const line of (await readFile(new URL('../.env.local', import.meta.url), 'utf8')).split(/\r?\n/)) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line);
    if (m && m[2].trim() && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  // 파일이 없으면 환경변수만 씁니다
}

const { buildInstitutions, buildJobs, buildTrend } = await import('../api/_lib/builders.js');
const { COMPANIES } = await import('../src/data/companies.js');

const OUT = new URL('../snapshot/', import.meta.url);

async function save(name, data) {
  const file = new URL(`${name}.json`, OUT);
  await mkdir(dirname(file.pathname.replace(/^\/([A-Za-z]:)/, '$1')), { recursive: true });
  await writeFile(file, JSON.stringify({ generatedAt: new Date().toISOString(), data }));
  console.log(`✓ ${name}`);
}

const tasks = process.argv.slice(2);
if (!tasks.length) {
  console.error('사용법: node scripts/snapshot.mjs jobs institutions trends');
  process.exit(1);
}
if (!process.env.DATA_GO_KR_KEY) {
  // 저장소 Secrets에 키를 넣기 전에는 실패 메일이 매시간 가지 않도록 경고만 남기고 끝냅니다
  console.log('::warning::DATA_GO_KR_KEY가 없어 건너뜀 (Settings > Secrets and variables > Actions에 추가하세요)');
  process.exit(0);
}

let failed = 0;
let codes = {};
for (const task of tasks) {
  try {
    if (task === 'jobs') {
      const jobs = await buildJobs();
      codes = jobs.codes;
      await save('jobs', jobs);
    } else if (task === 'institutions') {
      await save('institutions', await buildInstitutions());
    } else if (task === 'trends') {
      // 기관마다 차례로 (동시에 많이 부르면 공공데이터포털이 끊는 경우가 있어서)
      for (const c of COMPANIES) {
        const code = c.code ?? codes[c.id];
        if (!code) {
          console.log(`- ${c.id}: 기관코드 모름, 건너뜀`);
          continue;
        }
        try {
          await save(`trend/${c.id}`, await buildTrend(code));
        } catch (err) {
          failed++;
          console.error(`✗ trend/${c.id}: ${err.message}`);
        }
      }
    } else {
      throw new Error(`모르는 작업: ${task}`);
    }
  } catch (err) {
    failed++;
    console.error(`✗ ${task}: ${err.message}`);
  }
}
process.exit(failed ? 1 : 0);
