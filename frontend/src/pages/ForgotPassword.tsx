import { useState } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "@/components/ui/loaders";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSent(true);
      if (data.dev_token) setDevToken(data.dev_token);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-lg animate-fade-in">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Mot de passe oublié</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {sent ? (
            <div className="py-4 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="font-heading text-lg font-semibold text-primary">Email envoyé !</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.
              </p>
              {devToken && (
                <div className="mt-4 rounded-lg bg-muted p-3 text-left">
                  <p className="mb-1 font-medium text-xs text-muted-foreground">🛠 Token de dev (non visible en prod) :</p>
                  <Link
                    to={`/reinitialiser-mdp?token=${devToken}`}
                    className="break-all text-xs text-primary underline"
                  >
                    Cliquer ici pour réinitialiser
                  </Link>
                </div>
              )}
              <Link
                to="/connexion"
                className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Adresse email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 hover:shadow-lg hover:-translate-y-0.5 duration-200"
                >
                  {loading && <Spinner size="sm" variant="white" />}
                  Envoyer le lien
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link to="/connexion" className="flex items-center justify-center gap-1 hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
