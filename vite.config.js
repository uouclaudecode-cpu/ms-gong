import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 로컬 개발(npm run dev)에서도 /api/* 서버 함수가 Vercel과 똑같이 돌게 해 주는 플러그인.
// 배포된 사이트에서는 Vercel이 api/ 폴더를 직접 실행하므로 이 코드는 쓰이지 않습니다.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const match = url.pathname.match(/^\/api\/([a-z-]+)$/);
        if (!match) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.js`);
          req.query = Object.fromEntries(url.searchParams);
          res.status = (code) => ((res.statusCode = code), res);
          res.json = (body) => {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(body));
          };
          await mod.default(req, res);
        } catch (err) {
          server.ssrFixStacktrace(err);
          res.statusCode = 500;
          res.end(String(err.stack ?? err));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // .env.local의 NAVER_CLIENT_ID 등을 서버 함수가 process.env로 읽을 수 있게
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), localApi()],
    server: { port: 5173 },
  };
});
