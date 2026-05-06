import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { hermanoRepository } from "@/database/repositories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionLabel, GoldenDivider } from "@/components/landing/Helpers";
import { cn } from "@/lib/utils";
import { Loader2, Paperclip, X } from "lucide-react";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [quiereSerHermano, setQuiereSerHermano] = useState(true);

    const [bautizado, setBautizado] = useState<boolean | null>(null);
    const [fotoBautismo, setFotoBautismo] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        direccion: "",
        fecha_nacimiento: "",
        genero: "" as "Mujer" | "Hombre" | "Otro" | "",
    });

    const set = (key: keyof typeof formData) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData(prev => ({ ...prev, [key]: e.target.value }));

    const handleBautizadoChange = (val: boolean) => {
        setBautizado(val);
        if (!val) setFotoBautismo(null);
    };

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (!formData.genero) { toast.error("Selecciona un género"); return; }
        if (bautizado === null) { toast.error("Indica si estás bautizado"); return; }
        if (bautizado && !fotoBautismo) { toast.error("Adjunta una fotografía de tu fe de bautismo"); return; }
        setLoading(true);

        const resultado = await hermanoRepository.registrar({
            ...formData,
            genero: formData.genero as "Mujer" | "Hombre" | "Otro",
            bautizado,
            foto_bautismo: fotoBautismo,
            quiere_ser_hermano: quiereSerHermano,
        });

        if (resultado.success) {
            toast.success("¡Cuenta creada correctamente!");
            navigate("/login");
        } else {
            toast.error(resultado.error || "Error al registrar");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
            <Link
                to="/"
                className="font-serif text-[10px] tracking-widest text-secondary uppercase mb-8 hover:text-secondary/70 transition-colors"
            >
                ← Volver al inicio
            </Link>

            <Card className="w-full max-w-2xl bg-muted/30 border-secondary/20 rounded-none shadow-none">
                <CardHeader className="text-center border-b border-secondary/10 pb-8">
                    <div className="flex justify-center">
                        <SectionLabel>Nuevo Miembro</SectionLabel>
                    </div>
                    <CardTitle className="font-display text-3xl text-primary mt-2">
                        Crea tu cuenta
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Tipo de usuario */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { val: true,  titulo: "Hermano Cofrade",  desc: "Participa en la procesión y paga cuota." },
                                { val: false, titulo: "Usuario Tienda",   desc: "Solo para compras y donaciones." },
                            ].map(({ val, titulo, desc }) => (
                                <div
                                    key={titulo}
                                    onClick={() => setQuiereSerHermano(val)}
                                    className={cn(
                                        "p-4 border cursor-pointer transition-all select-none",
                                        quiereSerHermano === val
                                            ? "border-secondary bg-secondary/5"
                                            : "border-secondary/20 hover:border-secondary/40"
                                    )}
                                >
                                    <p className="font-serif text-primary text-sm">{titulo}</p>
                                    <p className="text-[10px] text-primary/60 mt-0.5">{desc}</p>
                                </div>
                            ))}
                        </div>

                        <GoldenDivider className="opacity-50" />

                        {/* Datos personales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-primary/70">Nombre *</Label>
                                <Input required className="bg-background border-secondary/30 rounded-none" value={formData.nombre} onChange={set("nombre")} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-primary/70">Apellidos *</Label>
                                <Input required className="bg-background border-secondary/30 rounded-none" value={formData.apellidos} onChange={set("apellidos")} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-primary/70">Género *</Label>
                                <Select onValueChange={v => setFormData(prev => ({ ...prev, genero: v as any }))}>
                                    <SelectTrigger className="bg-background border-secondary/30 rounded-none">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Mujer">Mujer</SelectItem>
                                        <SelectItem value="Hombre">Hombre</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-primary/70">Fecha de nacimiento *</Label>
                                <Input required type="date" className="bg-background border-secondary/30 rounded-none" value={formData.fecha_nacimiento} onChange={set("fecha_nacimiento")} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-primary/70">Email *</Label>
                                <Input required type="email" autoComplete="email" className="bg-background border-secondary/30 rounded-none" value={formData.email} onChange={set("email")} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-primary/70">Teléfono *</Label>
                                <Input required type="tel" className="bg-background border-secondary/30 rounded-none" value={formData.telefono} onChange={set("telefono")} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-primary/70">Dirección *</Label>
                            <Input required className="bg-background border-secondary/30 rounded-none" placeholder="Calle, número, Montijo..." value={formData.direccion} onChange={set("direccion")} />
                        </div>

                        {/* Bautizado */}
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-primary/70">¿Estás bautizado? *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {([true, false] as const).map((val) => (
                                    <div
                                        key={String(val)}
                                        onClick={() => handleBautizadoChange(val)}
                                        className={cn(
                                            "p-3 border cursor-pointer transition-all select-none text-center",
                                            bautizado === val
                                                ? "border-secondary bg-secondary/5"
                                                : "border-secondary/20 hover:border-secondary/40"
                                        )}
                                    >
                                        <p className="font-serif text-primary text-sm">{val ? "Sí" : "No"}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Input foto bautismo — solo visible si bautizado = true */}
                            {bautizado === true && (
                                <div className="mt-3 border border-dashed border-secondary/30 p-4 bg-secondary/3">
                                    <p className="font-body text-[10px] uppercase tracking-widest text-primary/50 mb-2">
                                        Fe de bautismo *
                                    </p>
                                    <p className="font-body text-[11px] text-primary/40 mb-3">
                                        Adjunta una fotografía o escaneo de tu fe de bautismo para que podamos verificarla.
                                    </p>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => setFotoBautismo(e.target.files?.[0] ?? null)}
                                    />

                                    {fotoBautismo ? (
                                        <div className="flex items-center gap-2">
                                            <Paperclip size={12} className="text-secondary shrink-0" />
                                            <span className="font-body text-xs text-primary/70 truncate flex-1">
                                                {fotoBautismo.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => { setFotoBautismo(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                className="text-primary/30 hover:text-red-500 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 border border-secondary/30 px-3 py-2 font-body text-[10px] tracking-widest uppercase text-secondary hover:bg-secondary/5 transition-colors"
                                        >
                                            <Paperclip size={11} />
                                            Seleccionar archivo
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-primary/70">Contraseña *</Label>
                            <Input required type="password" autoComplete="new-password" minLength={8} className="bg-background border-secondary/30 rounded-none" value={formData.password} onChange={set("password")} />
                            <p className="text-[10px] text-primary/40">Mínimo 8 caracteres</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none py-6 uppercase tracking-widest font-serif text-xs"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : "Finalizar Registro"}
                        </Button>

                        <p className="text-center font-body text-[11px] text-primary/50">
                            ¿Ya tienes cuenta?{" "}
                            <Link to="/login" className="text-secondary hover:underline">Inicia sesión</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
