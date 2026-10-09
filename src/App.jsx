// 라우팅
//   /              홈 (My 픽이 없으면 온보딩)   ?c=기업id 한 기업만 · ?picks=a,b 공유받은 픽
//   /calendar      채용 캘린더 (마감일)
//   /saved         찜한 공고
//   /pick          My 픽 공기업 고르기·공유
//   /profile       내 프로필 (나에게 맞는 공고)
//   /company/:id   기업 상세 (공고·뉴스·블로그 후기)
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import CompanyPage from './pages/CompanyPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PickPage from './pages/PickPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SavedPage from './pages/SavedPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="saved" element={<SavedPage />} />
        <Route path="pick" element={<PickPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="company/:id" element={<CompanyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
