import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/quiz", label: "Quiz" },
    { to: "/cours", label: "Cours" },
    { to: "/classement", label: "Classement" },
    { to: "/a-propos", label: "À propos" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="AfriSio CI" className="h-10 w-10" />
          <span className="font-heading text-xl font-bold text-gradient">AfriSio CI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/profil"
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            👤
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-lg p-2 hover:bg-accent"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {[...links, { to: "/profil", label: "👤 Mon Profil" }].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
