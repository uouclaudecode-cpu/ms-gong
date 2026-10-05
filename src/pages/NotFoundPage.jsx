import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-xl font-black">페이지를 찾을 수 없어요</h1>
      <Link to="/" className="btn-primary mt-5">
        홈으로
      </Link>
    </div>
  );
}
