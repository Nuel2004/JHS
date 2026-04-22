import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const WHATSAPP_NUMBER = '34600000000'; // TODO: cambiar al número real

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(
      `Hola, soy ${form.nombre || 'un interesado'}. ${form.mensaje || 'Me gustaría obtener más información sobre la hermandad.'}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`, '_blank');
  };

  const handleEmail = () => {
    const asunto = encodeURIComponent('Contacto desde la web — Hermandad JHS');
    const cuerpo = encodeURIComponent(`Nombre: ${form.nombre}\nEmail: ${form.email}\n\n${form.mensaje}`);
    window.open(`mailto:hermandad@jhsmontijo.es?subject=${asunto}&body=${cuerpo}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <SectionLabel>Hermandad de Montijo</SectionLabel>
      <h1 className="font-display text-5xl text-primary mt-1 mb-2">Contacto</h1>
      <p className="font-body text-sm text-primary/50 mb-2">
        Estamos aquí para ayudarte. Puedes escribirnos o llamarnos.
      </p>
      <GoldenDivider className="justify-start" />

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Formulario */}
        <div>
          <p className="font-serif text-[10px] tracking-widest uppercase text-primary/40 mb-5">
            Escríbenos
          </p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60">Tu nombre</Label>
              <Input className="rounded-none border-secondary/30 bg-background focus-visible:ring-secondary/40"
                value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60">Tu email</Label>
              <Input type="email" className="rounded-none border-secondary/30 bg-background focus-visible:ring-secondary/40"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-primary/60">Mensaje</Label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 text-sm font-body bg-background border border-secondary/30
                           text-primary placeholder:text-primary/30 focus:outline-none focus:ring-1 focus:ring-secondary/40 resize-none"
                value={form.mensaje}
                onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleEmail}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase px-6 py-5 gap-2">
                <Mail size={12} /> Enviar email
              </Button>
              <Button onClick={handleWhatsApp} variant="outline"
                className="border-secondary/40 text-secondary hover:bg-secondary/10 rounded-none font-serif text-[10px] tracking-widest uppercase px-6 py-5 gap-2">
                <MessageCircle size={12} /> WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Info de contacto */}
        <div className="space-y-8">
          <p className="font-serif text-[10px] tracking-widest uppercase text-primary/40">Información</p>

          {[
            { icon: MapPin, label: 'Dirección', value: 'Iglesia de Santiago Apóstol\nMontijo, Badajoz' },
            { icon: Mail, label: 'Email', value: 'hermandad@jhsmontijo.es' },
            { icon: Phone, label: 'Teléfono', value: '+34 600 000 000' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4">
              <div className="w-8 h-8 border border-secondary/30 flex items-center justify-center text-secondary shrink-0 mt-0.5">
                <Icon size={14} />
              </div>
              <div>
                <p className="font-serif text-[10px] tracking-widest uppercase text-primary/35 mb-1">{label}</p>
                <p className="font-body text-sm text-primary/70 whitespace-pre-line">{value}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-6 border-t border-secondary/10">
            <p className="font-body text-xs text-primary/40 italic">
              También puedes pasarte por la sacristía los domingos tras la misa de 12h.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
