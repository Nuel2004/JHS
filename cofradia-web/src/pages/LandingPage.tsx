import React, { useState } from 'react';
import { Hermano, Genero } from '../interfaces/Hermano';
import { supabase } from '../database/supabase/Client';

const LandingPage: React.FC = () => {
    const [formData, setFormData] = useState<Partial<Hermano>>({
        nombre: '',
        email: '',
        telefono: '',
        genero: 'Otro', // Valor por defecto del enum
        bautizado: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.bautizado) {
            alert("Es requisito indispensable estar bautizado para ingresar en la Cofradía.");
            return;
        }
        // Aquí llamarías a tu SupabaseHermanoRepository
        console.log("Enviando alta de hermano...", formData);
    };

    return (
        <div className="bg-surface text-on-surface font-body">
            {/* Navegación (Header) */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF5]/80 backdrop-blur-md border-b border-zinc-200/20">
                <div className="flex justify-between items-center w-full px-12 py-8 max-w-screen-2xl mx-auto">
                    <div className="text-2xl font-headline tracking-[0.2em] text-sacred-green uppercase">
                        Sacra Hermandad
                    </div>
                    <button className="bg-sacred-green text-white px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-palm-green transition-all duration-300">
                        Inscripción
                    </button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            className="w-full h-full object-cover grayscale-[0.3] brightness-[0.4]"
                            src="https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80"
                            alt="Procesión Jesús Hombre Salvador"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface"></div>
                    </div>
                    <div className="relative z-10 text-center px-6 max-w-4xl">
                        <span className="font-sans uppercase tracking-[0.4em] text-aged-gold text-sm mb-6 block">Montijo, Extremadura</span>
                        <h1 className="text-5xl md:text-8xl font-headline text-white mb-8 tracking-wider">Jesús Hombre Salvador</h1>
                        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
                            Tradición, Fe y Devoción en el corazón de nuestra Hermandad. Un legado tallado en devoción.
                        </p>
                    </div>
                </section>

                {/* Sección de Versículo (Asimétrica) */}
                <section className="py-32 bg-surface-container-low relative overflow-hidden">
                    <div className="max-w-screen-xl mx-auto px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7">
                            <blockquote className="relative z-10">
                                <p className="text-3xl md:text-5xl font-headline text-primary leading-tight mb-8 italic">
                                    "Yo soy el camino, la verdad y la vida; nadie viene al Padre sino por mí."
                                </p>
                                <cite className="not-italic text-[12px] uppercase tracking-[0.4em] text-aged-gold">Juan 14:6</cite>
                            </blockquote>
                        </div>
                    </div>
                </section>

                {/* Formulario de Inscripción */}
                <section id="inscripcion" className="py-32 bg-surface-container-low">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <span className="uppercase tracking-[0.5em] text-aged-gold mb-4 block text-xs">Forme parte de nuestra historia</span>
                            <h2 className="text-4xl font-headline text-on-surface">Solicitud de Inscripción</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-12 bg-white p-12 shadow-sm border border-zinc-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <input
                                    type="text"
                                    placeholder="Nombre Completo"
                                    className="border-0 border-b border-zinc-300 focus:border-sacred-green focus:ring-0 bg-transparent py-2"
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                                <select
                                    className="border-0 border-b border-zinc-300 focus:border-sacred-green focus:ring-0 bg-transparent py-2"
                                    value={formData.genero}
                                    onChange={(e) => setFormData({ ...formData, genero: e.target.value as Genero })}
                                >
                                    <option value="Mujer">Mujer</option>
                                    <option value="Hombre">Hombre</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            {/* Toggle de Bautismo - REQUISITO SQL */}
                            <div className="flex items-center justify-between py-6 border-t border-zinc-100">
                                <div>
                                    <p className="text-sm font-semibold">Confirmación de Bautismo</p>
                                    <p className="text-xs text-zinc-500">Declaro haber recibido el Santo Sacramento del Bautismo.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.bautizado}
                                    onChange={(e) => setFormData({ ...formData, bautizado: e.target.checked })}
                                    className="w-6 h-6 text-sacred-green rounded-none border-zinc-300"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-sacred-green text-white py-5 text-sm uppercase tracking-[0.2em] font-bold hover:bg-palm-green transition-all"
                            >
                                Enviar Solicitud
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;