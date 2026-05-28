import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home", testid: "nav-home-link" },
  { to: "/news", label: "News", testid: "nav-news-link" },
  { to: "/characters", label: "Characters", testid: "nav-characters-link" },
  { to: "/locations", label: "Locations", testid: "nav-locations-link" },
  { to: "/vehicles", label: "Vehicles", testid: "nav-vehicles-link" },
  { to: "/trailers", label: "Trailers", testid: "nav-trailers-link" },
  { to: "/soundtrack", label: "Soundtrack", testid: "nav-soundtrack-link" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050505]/85 backdrop-blur-xl border-b border-white/10"
          : "bg-gradient-to-b from-[#050505]/80 to-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link
          to="/"
          data-testid="nav-logo-link"
          className="flex items-center gap-2 group"
        >
          <div className="relative">
            <span
              className="font-display text-2xl md:text-3xl tracking-[0.04em] text-white leading-none"
              style={{
                background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LEONIDA
            </span>
          </div>
          <span className="font-display text-2xl md:text-3xl tracking-[0.04em] text-white leading-none">
            VICE
          </span>
          <span className="hidden md:inline-block ml-2 text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
            GTA VI Fan Network
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={l.testid}
              className={({ isActive }) =>
                `text-[12px] uppercase tracking-[0.22em] font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          data-testid="nav-menu-toggle"
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div
          data-testid="mobile-nav-panel"
          className="lg:hidden border-t border-white/10 bg-[#050505]/95 backdrop-blur-xl"
        >
          <div className="px-6 py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                data-testid={`mobile-${l.testid}`}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-[0.22em] font-semibold py-2 ${
                    isActive ? "text-[#FF2A6D]" : "text-zinc-300"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
