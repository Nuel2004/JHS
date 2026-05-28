import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { hermanoRepository } from '@/database/repositories';
import { supabaseClient } from '@/database/supabase/Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        toast.error('El enlace ha caducado o no es válido.');
        navigate('/recuperar-password');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await hermanoRepository.actualizarPassword(form.password);
    if (error) {
      toast.error(error ?? 'Error al actualizar la contraseña.');
      setLoading(false);
      return;
    }
    await supabaseClient.auth.signOut();
    toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
    navigate('/login');
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
      <Link
        to="/login"
        className="font-serif text-[10px] tracking-widest text-secondary uppercase mb-8 no-underline hover:text-secondary/70 transition-colors"
      >
        ← Volver al acceso
      </Link>

      <div className="flex justify-center mb-6">
        <SectionLabel>Nueva contraseña</SectionLabel>
      </div>

      <Card className="w-full max-w-md bg-muted/30 border-secondary/20 rounded-none shadow-none">
        <CardHeader className="text-center border-b border-secondary/10 pb-6">
          <CardTitle className="font-display text-3xl text-primary">
            Establece tu contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary/70">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary/70">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  disabled={loading}
                  className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50 pr-10"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <GoldenDivider className="my-2" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-xs tracking-widest uppercase py-6"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Cambiar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
