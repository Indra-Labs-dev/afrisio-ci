import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Message envoyé ✅",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-center font-heading text-4xl font-bold">📬 Contactez-nous</h1>
        <p className="mb-10 text-center text-muted-foreground">
          Une question, une suggestion ou un partenariat ? Écrivez-nous !
        </p>

        <div className="grid gap-8 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            {[
              { icon: "📧", label: "Email", value: "contact@afrisio.ci" },
              { icon: "📱", label: "Téléphone", value: "+225 07 00 00 00" },
              { icon: "📍", label: "Adresse", value: "Abidjan, Côte d'Ivoire" },
            ].map((info) => (
              <div key={info.label} className="flex items-start gap-3">
                <span className="text-xl">{info.icon}</span>
                <div>
                  <div className="text-sm font-medium">{info.label}</div>
                  <div className="text-sm text-muted-foreground">{info.value}</div>
                </div>
              </div>
            ))}
          </div>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Envoyer un message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" required placeholder="Votre nom" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="votre@email.com" />
                </div>
                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input id="subject" required placeholder="Objet du message" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" required rows={4} placeholder="Votre message..." />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Envoi en cours..." : "Envoyer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
