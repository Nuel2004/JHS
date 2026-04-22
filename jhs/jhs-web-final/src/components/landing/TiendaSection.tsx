import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "./Helpers";

const PRODUCTOS = [
    { icon: "🌿", nombre: "Estampita hermandad", desc: "Estampita oficial de nuestra imagen de Jesús.", precio: "2€" },
    { icon: "🌱", nombre: "Palma", desc: "Palma para niños o acompañamiento", precio: "10€" },
    { icon: "🏅", nombre: "Pin hermandad", desc: "Medalla oficial bañada en plata", precio: "3€" },
    { icon: "👘", nombre: "Traje completo", desc: "Traje completo de cofrade, bajo pedido", precio: "80€" },
];

export function TiendaSection() {
    return (
        <section id="tienda" className="max-w-5xl mx-auto px-6 md:px-8 py-24 bg-background">
            <SectionLabel>Tienda oficial</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-4 leading-tight">
                Materiales y<br />
                <span className="text-secondary">merchandising</span>
            </h2>
            <p className="font-body text-lg leading-[1.9] text-primary/70 max-w-xl mb-12">
                Adquiere los materiales de la hermandad de forma segura. Los usuarios
                registrados pueden comprar palmas; los hermanos cofrades tienen acceso
                completo a la tienda.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PRODUCTOS.map((p) => (
                    <Card
                        key={p.nombre}
                        className="bg-background border border-secondary/20 rounded-none hover:border-secondary transition-colors overflow-hidden flex flex-col shadow-sm"
                    >
                        <div className="h-28 bg-primary flex items-center justify-center text-4xl border-b border-secondary/10">
                            {/* Ajustamos la opacidad del icono o lo dejamos tal cual */}
                            <span className="drop-shadow-md">{p.icon}</span>
                        </div>
                        <CardContent className="p-5 flex-1">
                            <p className="font-serif text-[0.85rem] tracking-wide text-primary mb-1">{p.nombre}</p>
                            <p className="font-body text-[0.85rem] text-primary/60 italic leading-relaxed">{p.desc}</p>
                        </CardContent>
                        <CardFooter className="px-5 pb-5 pt-0 flex items-center justify-between">
                            <span className="font-display text-xl text-secondary">{p.precio}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="font-serif text-[9px] tracking-[0.15em] uppercase bg-transparent text-secondary border-secondary hover:bg-secondary hover:text-secondary-foreground rounded-none cursor-pointer"
                            >
                                Comprar
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
    );
}