import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { RolesSection } from "@/components/landing/RolesSection";
import { GpsSection } from "@/components/landing/GpsSection";
import { TiendaSection } from "@/components/landing/TiendaSection";
import { CtaFinal } from "@/components/landing/CtaFinal";
import { VerseOfTheDay } from "@/components/landing/VerseOfTheDay";
import { HistoriaSection } from "@/components/landing/HistoriaSection";

export default function LandingPage() {
    return (
        <main className="bg-[#0D0B08] text-[#FAF6EE] font-body overflow-x-hidden min-h-screen">
            <Navbar />
            <Hero />
            <HistoriaSection />
            <VerseOfTheDay />
            <StatsBar />
            <RolesSection />
            <GpsSection />
            <TiendaSection />
            <CtaFinal />
            <Footer />
        </main>
    );
}