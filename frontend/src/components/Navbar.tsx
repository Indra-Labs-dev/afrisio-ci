import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/images/icon.png";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/dashboard", label: "Dashboard", requireAuth: true },
    { to: "/quiz", label: "Quiz" },
    { to: "/cours", label: "Cours" },
    { to: "/classement", label: "Classement" },
    { to: "/a-propos", label: "À propos" },
    { to: "/contact", label: "Contact" },
  ];

  const visibleLinks = links.filter((link) => !link.requireAuth || isAuthenticated);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="AfriSio CI" className="h-10 w-10" />
          <span className="font-heading text-xl font-bold text-gradient">AfriSio CI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => (
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
          
          <div className="ml-4 flex items-center border-l pl-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profil"
                  className="flex h-9 items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition hover:bg-accent"
                >
                  <User className="h-4 w-4" />
                  {user?.username}
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition"
                  title="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/connexion"
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 hover:bg-accent md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {visibleLinks.map((link) => (
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
            
            <div className="my-2 border-t" />
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/profil"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent flex items-center gap-2"
                >
                  <User className="h-4 w-4" /> Profil
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-destructive hover:bg-destructive/10 flex items-center gap-2 text-left"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium bg-primary text-primary-foreground transition-colors hover:opacity-90 mt-1"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
