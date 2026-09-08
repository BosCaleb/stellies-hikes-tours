import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import HikesList from './components/HikesList.jsx';
import ToursList from './components/ToursList.jsx';
import DetailPage from './components/DetailPage.jsx';
import About from './components/About.jsx';
import BookingPage from './components/BookingPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hikes" element={<HikesList />} />
          <Route path="/hikes/:id" element={<DetailPage type="hike" />} />
          <Route path="/tours" element={<ToursList />} />
          <Route path="/tours/:id" element={<DetailPage type="tour" />} />
          <Route path="/about" element={<About />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/book/:type/:id" element={<BookingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
