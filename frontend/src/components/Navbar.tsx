import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/images/icon.png";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useSounds } from "@/hooks/useSounds";
import { LogOut, User, Sun, Moon, Volume2, VolumeX } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => {
    return localStorage.getItem("afrisio-sounds") !== "false";
  });
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleSounds, click } = useSounds();

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

  const handleSoundToggle = () => {
    const next = toggleSounds();
    setSoundOn(next);
    click();
  };

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

          {/* Controls: Sound + Theme + Auth */}
          <div className="ml-4 flex items-center gap-2 border-l pl-4">
            {/* Sound toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundOn ? "Désactiver les sons" : "Activer les sons"}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 animate-scale-in" />
              ) : (
                <Moon className="h-4 w-4 animate-scale-in" />
              )}
            </button>

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

        {/* Mobile controls + toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="rounded-lg p-2 hover:bg-accent"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-card p-4 md:hidden animate-fade-in">
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

            {/* Sound toggle (mobile) */}
            <button
              onClick={handleSoundToggle}
              className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent flex items-center gap-2 text-left"
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {soundOn ? "Désactiver les sons" : "Activer les sons"}
            </button>

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
