import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SectionLabel } from "./Helpers";
import { productoRepository } from '@/database/repositories';
import type { Producto } from '@/interfaces/Producto';
import { Package, Loader2 } from 'lucide-react';
import { formatEur } from '@/lib/utils';

function localImage(p: Producto): string | null {
    const n = p.nombre.toLowerCase();
    if (n.includes('palma'))                        return '/images/palma.png';
    if (n.includes('estampita'))                    return '/images/estampita.png';
    if (n.includes('medalla') || n.includes('pin')) return '/images/medalla.png';
    if (n.includes('traje') || n.includes('tunic')) return '/images/tunica.png';
    if (p.categoria === 'Palma')                    return '/images/palma.png';
    if (p.categoria === 'Traje')                    return '/images/tunica.png';
    return null;
}

export function TiendaSection() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productoRepository.obtenerActivos()
            .then(({ data }) => setProductos((data ?? []).filter(p => !p.nombre.toLowerCase().includes('palma hermano')).slice(0, 4)))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section id="tienda" className="max-w-5xl mx-auto px-6 md:px-8 py-24 bg-background">
            <SectionLabel>Tienda oficial</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-4 leading-tight">
                Materiales y<br />
                <span className="text-secondary">productos oficiales</span>
            </h2>
            <p className="font-body text-lg leading-[1.9] text-primary/70 max-w-xl mb-12">
                Adquiere los materiales de la hermandad de forma segura. Los usuarios
                registrados pueden comprar palmas; los hermanos cofrades tienen acceso
                completo a la tienda.
            </p>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 size={24} className="animate-spin text-secondary" />
                </div>
            ) : productos.length === 0 ? (
                <p className="text-center font-body text-sm text-primary/35 py-16 border border-dashed border-secondary/20">
                    No hay productos disponibles actualmente.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {productos.map((p) => {
                            const imgSrc = p.imagen_url ?? localImage(p);
                            return (
                            <Card
                                key={p.id}
                                className="bg-background border border-secondary/20 rounded-none hover:border-secondary transition-colors overflow-hidden flex flex-col shadow-sm"
                            >
                                <div className="h-28 bg-primary flex items-center justify-center border-b border-secondary/10 overflow-hidden">
                                    {imgSrc
                                        ? <img src={imgSrc} alt={p.nombre} className="h-full w-full object-cover" />
                                        : <Package size={36} className="text-secondary/30" />
                                    }
                                </div>
                                <CardContent className="p-5 flex-1">
                                    <p className="font-serif text-[0.85rem] tracking-wide text-primary mb-1">{p.nombre}</p>
                                    {p.descripcion && (
                                        <p className="font-body text-[0.85rem] text-primary/60 italic leading-relaxed">{p.descripcion}</p>
                                    )}
                                </CardContent>
                                <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
                                    <span className="font-display text-xl text-secondary">{formatEur(p.precio)}€</span>
                                    <Link
                                        to="/mi/tienda"
                                        className="font-serif text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors"
                                    >
                                        Comprar
                                    </Link>
                                </CardFooter>
                            </Card>
                            );
                        })}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <Link
                            to="/mi/tienda"
                            className="font-body text-[10px] tracking-widest uppercase text-secondary/70 hover:text-secondary transition-colors border-b border-secondary/30 pb-0.5"
                        >
                            Ver toda la tienda →
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
}
