import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "@/App.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { FloatingShareButton } from "./components/ShareWidget";
import Home from "./pages/Home";
import News from "./pages/News";
import Article from "./pages/Article";
import Characters from "./pages/Characters";
import CharacterDetail from "./pages/CharacterDetail";
import Locations from "./pages/Locations";
import LocationDetail from "./pages/LocationDetail";
import Vehicles from "./pages/Vehicles";
import Arsenal from "./pages/Arsenal";
import Markets from "./pages/Markets";
import Intel from "./pages/Intel";
import Trailers from "./pages/Trailers";
import Soundtrack from "./pages/Soundtrack";
import NotFound from "./pages/NotFound";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

function App() {
  return (
    <div className="App min-h-screen bg-[#050505] text-white">
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<Article />} />
            <Route path="/characters" element={<Characters />} />
            <Route path="/characters/:slug" element={<CharacterDetail />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/locations/:slug" element={<LocationDetail />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/arsenal" element={<Arsenal />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/intel" element={<Intel />} />
            <Route path="/trailers" element={<Trailers />} />
            <Route path="/soundtrack" element={<Soundtrack />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <FloatingShareButton />
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
