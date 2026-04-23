import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { hermanoRepository } from '@/database/repositories';
import { useAuthStore, REMEMBER_KEY } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem(REMEMBER_KEY) === 'true'
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Guardar el flag antes de setSession para que adaptiveStorage lo lea
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    const { data, error } = await hermanoRepository.login(form.email, form.password);

    if (error || !data) {
      toast.error(error ?? 'Error al iniciar sesión');
      setLoading(false);
      return;
    }

    setSession(data);
    toast.success(`Bienvenido, ${data.hermano.nombre}`);
    navigate(data.hermano.rol === 'admin' ? '/admin/dashboard' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
      <Link to="/" className="font-serif text-[10px] tracking-widest text-secondary uppercase mb-8 no-underline hover:text-secondary/70 transition-colors">
        ← Volver al inicio
      </Link>

      <div className="flex justify-center mb-6">
        <SectionLabel>Acceso a la Hermandad</SectionLabel>
      </div>

      <Card className="w-full max-w-md bg-muted/30 border-secondary/20 rounded-none shadow-none">
        <CardHeader className="text-center border-b border-secondary/10 pb-6">
          <CardTitle className="font-display text-3xl text-primary">Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary/70">Correo electrónico</Label>
              <Input type="email" required autoComplete="email"
                className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary/70">Contraseña</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50 pr-10"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-secondary cursor-pointer"
                />
                <span className="font-body text-[10px] uppercase tracking-widest text-primary/60">
                  Recordar sesión
                </span>
              </label>

              <Link to="/recuperar-password"
                className="font-serif text-[10px] tracking-widest uppercase text-secondary/70 hover:text-secondary no-underline transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <GoldenDivider className="my-2" />

            <Button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-xs tracking-widest uppercase py-6">
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Entrar'}
            </Button>
          </form>

          <p className="text-center font-body text-[11px] text-primary/50 mt-6">
            ¿Aún no eres hermano?{' '}
            <Link to="/registro" className="text-secondary hover:underline">Regístrate aquí</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
