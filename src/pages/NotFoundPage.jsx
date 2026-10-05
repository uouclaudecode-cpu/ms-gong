import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <Link to="/" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
