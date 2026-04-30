import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SYSTEM_PROMPT = `Eres el asistente virtual de la Cofradía Jesús Salvador de los Hombres de Montijo (Badajoz, Extremadura), conocida popularmente como «La Burrita». Responde en español, de forma breve, cordial y cercana. Si no sabes algo con certeza, dilo con honestidad.

INFORMACIÓN OFICIAL DE LA COFRADÍA:

Nombre completo: Cofradía Jesús Salvador de los Hombres
Apodo popular: «La Burrita»
Localidad: Montijo, Badajoz, Extremadura
Sede canónica: Parroquia de San Pedro Apóstol de Montijo

CRONOLOGÍA:
• 1981 – Organización de la cofradía y primera salida de la procesión de la «Burrita», impulsada por el párroco y Luis Vega Moreno.
• 1987 – Constitución de la primera Junta de Gobierno, fijación del hábito nazareno actual e inicio del proceso estatutario.
• 1991 – Reestreno del paso de madera.
• 1998 – Restauración de la imagen titular por Luis Peña Maldonado (imaginero extremeño de Llerena).
• 1999 – Aprobación de los primeros estatutos según fuentes históricas locales.
• 2000 – Primeras elecciones tras la aprobación estatutaria.
• 2006 – XXV aniversario. La cofradía comienza a alternar su salida entre la Parroquia de San Pedro Apóstol y la Parroquia de San Gregorio Ostiense.
• 2015 – Representación del musical «Jesucristo Superstar».
• 2017 – Peregrinación a Fátima.
• 2018 – Cena solidaria a beneficio de Manos Unidas (organizada por el proyecto «Jóvenes»).
• 2019 – Aprobación oficial de los estatutos actualizados por la Archidiócesis de Mérida-Badajoz (Decreto Prot. 2019/438, firmado el 3 de mayo de 2019 por el arzobispo Celso Morga Iruzubieta).
• 2021 – Apoyo técnico al streaming de la Semana Santa parroquial.
• 2023 – Campaña del Kilo a beneficio de Cáritas Montijo.

IMAGEN Y PATRIMONIO:
• Imagen titular: «Jesús Salvador de los Hombres» (popularmente «Jesús en la Burrita»).
• Autoría: Talleres El Arte Cristiano de Olot (Girona), obra seriada en escayola, probablemente de la década de 1960.
• Restaurada en 1998 por Luis Peña Maldonado.
• Custodiada en la Ermita de Jesús de Montijo.
• Paso de madera de líneas rectas (una sola altura en los respiraderos). Faldones de terciopelo verde desde el año 2000. Llamador dorado incorporado en 2006.

PROCESIÓN Y CULTO:
• La cofradía abre los desfiles procesionales de la Semana Santa de Montijo el Domingo de Ramos.
• Es la única procesión de Montijo integrada dentro de la liturgia del Domingo de Ramos.
• Desde 2006 alterna el recorrido entre San Gregorio → San Pedro y San Pedro → San Gregorio.

ACTIVIDAD SOCIAL Y CARITATIVA:
• Proyecto «Jóvenes» con actividades durante todo el año.
• Campaña del Kilo (Adviento/Navidad) a beneficio de Cáritas Montijo.
• Cenas solidarias y acciones con Manos Unidas.
• Peregrinaciones.
• Apoyo a eventos culturales y parroquiales.

REDES SOCIALES OFICIALES:
• Facebook: @cofradiajhs
• Instagram: @cofradiajhs
• YouTube: @cofradiajhsmontijo5340

CONTACTO PARROQUIAL:
• Parroquia de San Pedro Apóstol: Plaza Campo de la Iglesia, 1 · Tel. 924 454 629
• Web parroquial: sanpedromontijo.es

Responde solo sobre temas relacionados con la cofradía o la Semana Santa de Montijo. Si te preguntan algo fuera de ese ámbito, redirige amablemente.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  '¿Cuándo se fundó la cofradía?',
  '¿Qué es «La Burrita»?',
  '¿Cuándo sale la procesión?',
  '¿Cómo puedo ser hermano?',
];

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clientRef = useRef<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (key) {
      clientRef.current = new GoogleGenerativeAI(key);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;
    if (!clientRef.current) {
      setMessages(prev => [...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: '⚠️ Falta configurar la clave de API (VITE_GEMINI_API_KEY). Contacta al administrador de la web.' },
      ]);
      setInput('');
      return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    let accumulated = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const model = clientRef.current.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: SYSTEM_PROMPT,
      });

      const history = newMessages.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(text);

      for await (const chunk of result.stream) {
        accumulated += chunk.text();
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Lo siento, hubo un error al conectar. Inténtalo de nuevo.' };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-36 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] bg-background border border-primary/20 shadow-2xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* Header — verde oscuro con texto crema */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary">
              <div>
                <p className="font-display text-secondary text-sm tracking-wide">Asistente JHS</p>
                <p className="font-body text-[10px] text-primary-foreground/60 tracking-[0.2em] uppercase mt-0.5">Cofradía Jesús Salvador de los Hombres</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-primary-foreground/50 hover:text-primary-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages — fondo parchment */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0 bg-background" style={{ maxHeight: '22rem' }}>
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <p className="font-body text-sm text-primary/70 leading-relaxed">
                    Hola, soy el asistente de la <span className="text-secondary font-semibold">Cofradía JHS</span> de Montijo. Puedo ayudarte con preguntas sobre nuestra historia, patrimonio y actividades.
                  </p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendMessage(s)}
                        className="w-full text-left px-3 py-2 border border-primary/15 hover:border-secondary hover:bg-secondary/5 transition-colors font-body text-[11px] text-primary/60 hover:text-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[85%] px-3 py-2 font-body text-[12px] leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border border-primary/10 text-primary'
                    )}>
                      {msg.content || (
                        <span className="flex items-center gap-1.5 text-primary/40">
                          <Loader2 size={10} className="animate-spin" />
                          <span className="text-[10px]">Escribiendo...</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input — separado con borde sutil */}
            <div className="border-t border-primary/15 bg-background px-4 py-3 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
                placeholder="Escribe tu pregunta…"
                className="flex-1 bg-transparent font-body text-[12px] text-primary placeholder-primary/30 outline-none"
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={streaming || !input.trim()}
                className={cn(
                  'shrink-0 transition-colors',
                  (streaming || !input.trim()) ? 'text-primary/20' : 'text-secondary hover:text-secondary/70'
                )}
              >
                {streaming ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-20 right-4 z-50 w-12 h-12 border-0 transition-colors duration-200',
          'flex items-center justify-center shadow-xl',
          open
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-[#1B3022] hover:bg-accent'
        )}
        aria-label="Abrir asistente de la cofradía"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={18} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}