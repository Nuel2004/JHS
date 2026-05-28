import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { hermanoRepository } from '@/database/repositories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Loader2, MailCheck } from 'lucide-react';

export default function RecuperarPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await hermanoRepository.recuperarPassword(email);
    setLoading(false);
    if (error) {
      toast.error('No se pudo enviar el correo. Inténtalo de nuevo.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
      <Link
        to="/login"
        className="font-serif text-[10px] tracking-widest text-secondary uppercase mb-8 no-underline hover:text-secondary/70 transition-colors"
      >
        ← Volver al acceso
      </Link>

      <div className="flex justify-center mb-6">
        <SectionLabel>Recuperar contraseña</SectionLabel>
      </div>

      <Card className="w-full max-w-md bg-muted/30 border-secondary/20 rounded-none shadow-none">
        <CardHeader className="text-center border-b border-secondary/10 pb-6">
          <CardTitle className="font-display text-3xl text-primary">
            {sent ? 'Correo enviado' : 'Recuperar acceso'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <MailCheck size={40} className="text-secondary" />
              <p className="font-body text-sm text-primary/70">
                Hemos enviado un enlace de recuperación a{' '}
                <span className="text-primary font-medium">{email}</span>.
                Revisa tu bandeja de entrada y también la carpeta de spam.
              </p>
              <GoldenDivider className="w-full my-2" />
              <Link
                to="/login"
                className="font-serif text-[10px] tracking-widest uppercase text-secondary/70 hover:text-secondary no-underline transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-primary/70">
                  Correo electrónico
                </Label>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <GoldenDivider className="my-2" />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-xs tracking-widest uppercase py-6"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : 'Enviar enlace'}
              </Button>

              <p className="text-center font-body text-[11px] text-primary/50">
                ¿Recuerdas tu contraseña?{' '}
                <Link to="/login" className="text-secondary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
