import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { procesionRepository } from "@/database/repositories";
import type { ProcesionEstado } from "@/interfaces/Procesion";
import { SectionLabel } from "./Helpers";

// Coordenadas del recorrido en Montijo, Badajoz
// Fuente: OpenStreetMap Nominatim. Las marcadas con * son interpoladas por posición en el recorrido.
const RECORRIDO = [
    { nombre: "Parroquia de San Gregorio Ostiense", lat: 38.9090075, lng: -6.6082457, tipo: "inicio" as const },
    { nombre: "C/ Sagunto",                         lat: 38.9096338, lng: -6.6089159, tipo: "parada" as const },
    { nombre: "C/ Antonio Machado",                 lat: 38.9093000, lng: -6.6100000, tipo: "parada" as const }, // *
    { nombre: "Plaza Alfonso XIII",                 lat: 38.9090000, lng: -6.6112000, tipo: "parada" as const }, // *
    { nombre: "C/ Arcos",                           lat: 38.9088365, lng: -6.6124696, tipo: "parada" as const },
    { nombre: "Plaza Cipriano G. Piñero",           lat: 38.9087967, lng: -6.6149455, tipo: "parada" as const },
    { nombre: "Plaza Luis Braille",                 lat: 38.9087300, lng: -6.6154500, tipo: "parada" as const }, // *
    { nombre: "C/ Campoamor",                       lat: 38.9086619, lng: -6.6159917, tipo: "parada" as const },
    { nombre: "Plaza de España",                    lat: 38.9083789, lng: -6.6165235, tipo: "paso_obligado" as const },
    { nombre: "C/ Castelar",                        lat: 38.9089640, lng: -6.6165978, tipo: "parada" as const }, // *
    { nombre: "Avda. Emperatriz Eugenia",           lat: 38.9095490, lng: -6.6166721, tipo: "parada" as const },
    { nombre: "Campo de la Iglesia",                lat: 38.9098481, lng: -6.6171320, tipo: "parada" as const },
    { nombre: "Parroquia de San Pedro Apóstol",     lat: 38.9099719, lng: -6.6172782, tipo: "fin" as const },
];

const ROUTE_POSITIONS: [number, number][] = RECORRIDO.map(p => [p.lat, p.lng]);
const MAP_CENTER: [number, number] = [38.9091, -6.6128];

type TipoPunto = (typeof RECORRIDO)[number]["tipo"];

function circleIcon(color: string, size: number, glowColor?: string) {
    return L.divIcon({
        className: "",
        html: `<div style="
            width:${size}px;height:${size}px;
            background:${color};border-radius:50%;
            border:2px solid white;
            box-shadow:${glowColor ? `0 0 8px ${glowColor}` : "0 1px 4px rgba(0,0,0,0.45)"}
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -(size / 2 + 4)],
    });
}

const ICON_MAP: Record<TipoPunto, L.DivIcon> = {
    inicio:        circleIcon("#b45309", 14),
    fin:           circleIcon("#1e1b4b", 14),
    parada:        circleIcon("#c8a951", 9),
    paso_obligado: circleIcon("#c8a951", 12, "#c8a95180"),
};

const PASO_ICON = L.divIcon({
    className: "",
    html: `
        <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center">
            <div style="position:absolute;inset:0;background:#c8a951;border-radius:50%;opacity:0.3;animation:jhs-ping 1.4s cubic-bezier(0,0,0.2,1) infinite"></div>
            <div style="width:16px;height:16px;background:#c8a951;border-radius:50%;border:2.5px solid white;box-shadow:0 0 10px rgba(200,169,81,0.85)"></div>
        </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
});

export function GpsSection() {
    const [estado, setEstado] = useState<ProcesionEstado | null>(null);

    useEffect(() => {
        procesionRepository.obtenerEstado().then(({ data }) => {
            if (data) setEstado(data);
        });
        const unsub = procesionRepository.suscribirRealtime(setEstado);
        return unsub;
    }, []);

    const tieneGPS =
        estado?.activa &&
        estado.latitud_actual != null &&
        estado.longitud_actual != null;

    return (
        <section id="procesion" className="py-20 border-y border-secondary/20 bg-primary">
            {/* Animación del marcador del paso */}
            <style>{`@keyframes jhs-ping{75%,100%{transform:scale(2.2);opacity:0}}`}</style>

            <div className="max-w-5xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Columna izquierda: texto */}
                <div>
                    <SectionLabel className="text-secondary [&>div]:bg-secondary">
                        Estación de Penitencia
                    </SectionLabel>
                    <h2 className="font-display text-3xl md:text-4xl text-primary-foreground mb-6 leading-tight">
                        Sigue el paso<br />
                        <span className="text-secondary">desde cualquier lugar</span>
                    </h2>
                    <p className="font-body text-lg leading-[1.9] text-primary-foreground/80 mb-6">
                        Posición en tiempo real durante la procesión. El recorrido parte de la
                        Parroquia de San Gregorio Ostiense y finaliza en la Parroquia de San
                        Pedro Apóstol, pasando por las principales calles de Montijo.
                    </p>

                    {/* Indicador de estado */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${estado?.activa ? "bg-secondary animate-pulse" : "bg-primary-foreground/25"}`} />
                        <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-primary-foreground/50">
                            {estado?.activa ? "Procesión en marcha" : "Procesión no iniciada"}
                        </span>
                    </div>

                    {/* Leyenda */}
                    <div className="space-y-2.5">
                        {[
                            { color: "#b45309", label: "Salida — San Gregorio Ostiense" },
                            { color: "#c8a951", label: "Paradas del recorrido" },
                            { color: "#1e1b4b", label: "Llegada — San Pedro Apóstol" },
                        ].map(({ color, label }) => (
                            <div key={label} className="flex items-center gap-2.5">
                                <div style={{ background: color }} className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                                <span className="font-body text-xs text-primary-foreground/50">{label}</span>
                            </div>
                        ))}
                        {estado?.activa && (
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0 animate-pulse" />
                                <span className="font-body text-xs text-secondary">El Paso — posición en tiempo real</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna derecha: mapa */}
                <div className="h-[420px] rounded-lg overflow-hidden border border-secondary/30 shadow-lg">
                    <MapContainer
                        center={MAP_CENTER}
                        zoom={15}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Línea del recorrido */}
                        <Polyline
                            positions={ROUTE_POSITIONS}
                            pathOptions={{ color: "#c8a951", weight: 3, opacity: 0.65, dashArray: "8 5" }}
                        />

                        {/* Marcadores de paradas */}
                        {RECORRIDO.map((punto, i) => (
                            <Marker key={i} position={[punto.lat, punto.lng]} icon={ICON_MAP[punto.tipo]}>
                                <Popup>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{punto.nombre}</span>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Marcador en tiempo real del paso */}
                        {tieneGPS && (
                            <Marker
                                position={[estado!.latitud_actual!, estado!.longitud_actual!]}
                                icon={PASO_ICON}
                            >
                                <Popup>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>El Paso</span>
                                    <br />
                                    <span style={{ fontSize: 11, color: "#666" }}>Posición en tiempo real</span>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            </div>
        </section>
    );
}