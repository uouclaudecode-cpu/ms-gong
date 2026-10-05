// 라우팅
//   /              대시보드 (My 픽이 없으면 온보딩)   ?c=기업id 로 한 기업만 보기
//   /pick          My 픽 공기업 고르기
//   /company/:id   기업 상세 (공고·뉴스·블로그 후기)
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import CompanyPage from './pages/CompanyPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PickPage from './pages/PickPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="pick" element={<PickPage />} />
        <Route path="company/:id" element={<CompanyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
