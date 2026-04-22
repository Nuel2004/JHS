import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SectionLabel } from "./Helpers";

const ROLES = [
    {
        name: "Visitante",
        featured: false,
        items: [
            { label: "Historia y noticias",   active: true  },
            { label: "Mapa GPS en procesión", active: true  },
            { label: "Formulario de alta",    active: true  },
            { label: "Donación de trajes",    active: true  },
            { label: "Compras en tienda",     active: false },
            { label: "Gestión de cuotas",     active: false },
            { label: "Elección de puesto",    active: false },
        ],
    },
    {
        name: "Registrado",
        featured: false,
        items: [
            { label: "Historia y noticias",   active: true  },
            { label: "Mapa GPS en procesión", active: true  },
            { label: "Compra de palmas",      active: true  },
            { label: "Materiales y merchandising",     active: true },
            { label: "Donación de trajes",    active: true  },
            { label: "Gestión de cuotas",     active: false },
            { label: "Elección de puesto",    active: false },
        ],
    },
    {
        name: "Hermano Cofrade",
        featured: true,
        badge: "Premium",
        items: [
            { label: "Todas las funciones anteriores", active: true },
            { label: "Gestión de cuotas online",       active: true },
            { label: "Elección de puesto",             active: true },
            { label: "Materiales y merchandising",     active: true },
            { label: "Acceso completo a la tienda",    active: true },
            { label: "Contacto directo costurera",     active: true },
        ],
    }
];

export function RolesSection() {
    return (
        <section id="roles" className="max-w-5xl mx-auto px-6 md:px-8 py-24 bg-background">
            <SectionLabel>Accesos y permisos</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl text-primary mb-12 leading-tight">
                Un sistema pensado<br />
                <span className="text-secondary">para cada miembro</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ROLES.map((r) => (
                    <Card
                        key={r.name}
                        className={cn(
                            "bg-background rounded-none relative transition-colors shadow-none",
                            r.featured
                                ? "border-2 border-secondary"
                                : "border border-secondary/20 hover:border-secondary",
                        )}
                    >
                        {r.badge && (
                            <Badge className="absolute -top-[1px] right-6 font-serif text-[9px] tracking-[0.15em] uppercase bg-secondary text-secondary-foreground rounded-none px-3 py-1 hover:bg-secondary">
                                {r.badge}
                            </Badge>
                        )}
                        <CardHeader className="pb-2 pt-8 px-6">
                            <p className="font-serif text-secondary tracking-wide text-base">{r.name}</p>
                        </CardHeader>
                        <CardContent className="px-6 pb-8">
                            <ul className="space-y-0 list-none p-0 m-0">
                                {r.items.map((item) => (
                                    <li
                                        key={item.label}
                                        className={cn(
                                            "font-body text-[0.9rem] py-[0.4rem] border-b border-secondary/10 flex items-center gap-2",
                                            item.active ? "text-primary/90" : "text-primary/40 line-through",
                                        )}
                                    >
                                        <span className="text-secondary text-[0.6rem] opacity-70 shrink-0">✦</span>
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}