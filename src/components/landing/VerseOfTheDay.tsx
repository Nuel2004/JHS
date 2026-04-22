import { Card, CardContent } from "@/components/ui/card";
import { GoldenDivider } from "./Helpers";

const VERSICULOS = [
    // ==========================================
    // LIBROS HISTÓRICOS (Josué, Crónicas)
    // Autor: Diversos (Josué, Esdras)
    // ==========================================
    { "texto": "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.", "referencia": "Josué 1:9" },
    { "texto": "Si se humillare mi pueblo, sobre el cual mi nombre es invocado, y oraren, y buscaren mi rostro, y se convirtieren de sus malos caminos; entonces yo oiré desde los cielos, y perdonaré sus pecados, y sanaré su tierra.", "referencia": "2 Crónicas 7:14" },

    // ==========================================
    // LIBROS POÉTICOS Y DE SABIDURÍA
    // Autores: David, Salomón y otros
    // ==========================================
    // --- Salmos (Principalmente David) ---
    { "texto": "Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.", "referencia": "Salmos 23:1-2" },
    { "texto": "El que habita al abrigo del Altísimo morará bajo la sombra del Omnipotente. Diré yo a Jehová: Esperanza mía, y castillo mío; mi Dios, en quien confiaré.", "referencia": "Salmos 91:1-2" },
    { "texto": "Lámpara es a mis pies tu palabra, y lumbrera a mi camino. Juré y ratifiqué que guardaré tus justos juicios.", "referencia": "Salmos 119:105-106" },
    { "texto": "Bendeciré a Jehová en todo tiempo; su alabanza estará de continuo en mi boca. En Jehová se gloriará mi alma; lo oirán los mansos, y se alegrarán.", "referencia": "Salmos 34:1-2" },
    { "texto": "Crea en mí, oh Dios, un corazón limpio, y renueva un espíritu recto dentro de mí. No me eches de delante de ti, y no quites de mí tu santo Espíritu.", "referencia": "Salmos 51:10-11" },
    { "texto": "Alzaré mis ojos a los montes; ¿De dónde vendrá mi socorro? Mi socorro viene de Jehová, que hizo los cielos y la tierra.", "referencia": "Salmos 121:1-2" },
    { "texto": "Gustad, y ved que es bueno Jehová; dichoso el hombre que confía en él. Temed a Jehová, vosotros sus santos, pues nada falta a los que le temen.", "referencia": "Salmos 34:8-9" },
    { "texto": "Echa sobre Jehová tu carga, y él te sustentará; no dejará para siempre caído al justo.", "referencia": "Salmos 55:22" },
    { "texto": "La exposición de tus palabras alumbra; hace entender a los simples. Mi boca abrí y suspiré, porque deseaba tus mandamientos.", "referencia": "Salmos 119:130-131" },
    { "texto": "Encomienda a Jehová tu camino, y confía en él; y él hará. Exhibirá tu justicia como la luz, y tu derecho como el mediodía.", "referencia": "Salmos 37:5-6" },
    { "texto": "Deléitate asimismo en Jehová, y él te concederá las peticiones de tu corazón.", "referencia": "Salmos 37:4" },
    { "texto": "Enséñanos de tal modo a contar nuestros días, que traigamos al corazón sabiduría.", "referencia": "Salmos 90:12" },
    { "texto": "Bueno es Jehová para con todos, y sus misericordias sobre todas sus obras.", "referencia": "Salmos 145:9" },
    { "texto": "Hubiera yo desmayado, si no creyese que veré la bondad de Jehová en la tierra de los vivientes.", "referencia": "Salmos 27:13" },
    { "texto": "El ángel de Jehová acampa alrededor de los que le temen, y los defiende.", "referencia": "Salmos 34:7" },
    { "texto": "Dios es nuestro amparo y fortaleza, nuestro pronto auxilio en las tribulaciones.", "referencia": "Salmos 46:1" },
    { "texto": "Cantad a Jehová, bendecid su nombre; anunciad de día en día su salvación.", "referencia": "Salmos 96:2" },
    { "texto": "Justicia y juicio son el cimiento de tu trono; misericordia y verdad van delante de tu rostro.", "referencia": "Salmos 89:14" },
    { "texto": "Me mostrarás la senda de la vida; en tu presencia hay plenitud de gozo; delicias a tu diestra para siempre.", "referencia": "Salmos 16:11" },
    { "texto": "El que sacrifica alabanza me honrará; y al que ordenare su camino, le mostraré la salvación de Dios.", "referencia": "Salmos 50:23" },
    { "texto": "Porque un momento será su ira, pero su favor dura toda la vida. Por la noche durará el lloro, y a la mañana vendrá la alegría.", "referencia": "Salmos 30:5" },

    // --- Proverbios (Salomón) ---
    { "texto": "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.", "referencia": "Proverbios 3:5-6" },
    { "texto": "Engañosa es la gracia, y vana la hermosura; la mujer que teme a Jehová, esa será alabada.", "referencia": "Proverbios 31:30" },
    { "texto": "El corazón alegre constituye buen remedio; mas el espíritu triste seca los huesos.", "referencia": "Proverbios 17:22" },
    { "texto": "Hijo mío, no te olvides de mi ley, y tu corazón guarde mis mandamientos; porque largura de días y años de vida y paz te aumentarán.", "referencia": "Proverbios 3:1-2" },
    { "texto": "Torre fuerte es el nombre de Jehová; a él correrá el justo, y levantado será.", "referencia": "Proverbios 18:10" },
    { "texto": "La blanda respuesta quita la ira; mas la palabra áspera hace subir el furor.", "referencia": "Proverbios 15:1" },
    { "texto": "Hijo mío, presta atención a mis palabras; inclina tu oído a mis razones. No se aparten de tus ojos; guárdalas en tu corazón.", "referencia": "Proverbios 4:20-21" },
    { "texto": "Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.", "referencia": "Proverbios 4:23" },

    // ==========================================
    // PROFETAS MAYORES
    // Autores: Isaías, Jeremías
    // ==========================================
    { "texto": "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.", "referencia": "Isaías 41:10" },
    { "texto": "Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán, y no se cansarán; caminarán, y no se fatigarán.", "referencia": "Isaías 40:31" },
    { "texto": "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.", "referencia": "Jeremías 29:11" },
    { "texto": "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas que tú no conoces.", "referencia": "Jeremías 33:3" },
    { "texto": "He aquí que yo soy Jehová, Dios de toda carne; ¿habrá algo que sea difícil para mí?", "referencia": "Jeremías 32:27" },
    { "texto": "Tú guardarás en completa paz a aquel cuyo pensamiento en ti persevera; porque en ti ha confiado.", "referencia": "Isaías 26:3" },

    // ==========================================
    // LOS EVANGELIOS
    // Autores: Mateo, Marcos, Lucas y Juan
    // ==========================================
    // --- Mateo ---
    { "texto": "Mas buscad primeramente el reino de Dios y su justicia, y todas estas cosas os serán añadidas.", "referencia": "Mateo 6:33" },
    { "texto": "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar. Llevad mi yugo sobre vosotros, y aprended de mí, que soy manso y humilde.", "referencia": "Mateo 11:28-29" },
    { "texto": "Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá. Porque todo aquel que pide, recibe; y el que busca, halla.", "referencia": "Mateo 7:7-8" },
    { "texto": "Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo.", "referencia": "Mateo 28:19" },
    { "texto": "Porque donde están dos o tres congregados en mi nombre, allí estoy yo en medio de ellos.", "referencia": "Mateo 18:20" },
    { "texto": "Bienaventurados los de limpio corazón, porque ellos verán a Dios.", "referencia": "Mateo 5:8" },
    { "texto": "Mas tú, cuando ores, entra en tu aposento, y cerrada la puerta, ora a tu Padre que está en secreto; él te recompensará.", "referencia": "Mateo 6:6" },
    { "texto": "Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder.", "referencia": "Mateo 5:14" },

    // --- Marcos ---
    { "texto": "Por tanto, os digo que todo lo que pidiereis orando, creed que lo recibiréis, y os vendrá.", "referencia": "Marcos 11:24" },

    // --- Juan ---
    { "texto": "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.", "referencia": "Juan 3:16" },
    { "texto": "Jesús le dijo: ¿No te he dicho que si crees, verás la gloria de Dios? Porque para el que cree, todo le es posible.", "referencia": "Juan 11:40" },
    { "texto": "Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí.", "referencia": "Juan 14:6" },
    { "texto": "En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios. Este era en el principio con Dios.", "referencia": "Juan 1:1-2" },
    { "texto": "En esto conocerán todos que sois mis discípulos, si tuviereis amor los unos con los otros.", "referencia": "Juan 13:35" },
    { "texto": "El que tiene mis mandamientos, y los guarda, ese es el que me ama; y el que me ama, será amado por mi Padre.", "referencia": "Juan 14:21" },
    { "texto": "Mas a todos los que le recibieron, a los que creen en su nombre, les dio potestad de ser hechos hijos de Dios.", "referencia": "Juan 1:12" },
    { "texto": "Yo soy la vid, vosotros los pámpanos; el que permanece en mí, y yo en él, este lleva mucho fruto; porque separados de mí nada podéis hacer.", "referencia": "Juan 15:5" },
    { "texto": "Si vosotros permaneciereis en mi palabra, seréis verdaderamente mis discípulos; y conoceréis la verdad, y la verdad os hará libres.", "referencia": "Juan 8:31-32" },

    // ==========================================
    // HECHOS DE LOS APÓSTOLES
    // Autor: Lucas
    // ==========================================
    { "texto": "Pero recibiréis poder, cuando haya venido sobre vosotros el Espíritu Santo, y me seréis testigos hasta lo último de la tierra.", "referencia": "Hechos 1:8" },

    // ==========================================
    // EPÍSTOLAS PAULINAS
    // Autor: El Apóstol Pablo
    // ==========================================
    // --- Romanos ---
    { "texto": "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.", "referencia": "Romanos 8:28" },
    { "texto": "No os conforméis a este siglo, sino transformaos por medio de la renovación de vuestro entendimiento, para que comprobéis la voluntad de Dios.", "referencia": "Romanos 12:2" },
    { "texto": "Si Dios es por nosotros, ¿quién contra nosotros? El que no escatimó ni a su propio Hijo, sino que lo entregó por todos nosotros.", "referencia": "Romanos 8:31-32" },
    { "texto": "Por lo cual estoy seguro de que ni la muerte, ni la vida... ni ninguna otra cosa creada nos podrá separar del amor de Dios en Cristo.", "referencia": "Romanos 8:38-39" },
    { "texto": "Justificados, pues, por la fe, tenemos paz para con Dios por medio de nuestro Señor Jesucristo.", "referencia": "Romanos 5:1" },
    { "texto": "No seas vencido de lo malo, sino vence con el bien el mal.", "referencia": "Romanos 12:21" },
    { "texto": "Porque el pecado no se enseñoreará de vosotros; pues no estáis bajo la ley, sino bajo la gracia.", "referencia": "Romanos 6:14" },
    { "texto": "Y si Cristo está en vosotros, el cuerpo en verdad está muerto a causa del pecado, mas el espíritu vive a causa de la justicia.", "referencia": "Romanos 8:10" },
    { "texto": "Si confesares con tu boca que Jesús es el Señor, y creyeres en tu corazón que Dios le levantó de los muertos, serás salvo.", "referencia": "Romanos 10:9" },

    // --- Corintios ---
    { "texto": "El amor es sufrido, es benigno; el amor no tiene envidia, el amor no es jactancioso, no se envanece; no hace nada indebido.", "referencia": "1 Corintios 13:4-5" },
    { "texto": "La gracia del Señor Jesucristo, el amor de Dios, y la comunión del Espíritu Santo sean con todos vosotros. Amén.", "referencia": "2 Corintios 13:14" },
    { "texto": "Cada uno dé como propuso en su corazón: no con tristeza, ni por necesidad, porque Dios ama al dador alegre.", "referencia": "2 Corintios 9:7" },
    { "texto": "Así que, hermanos míos amados, estad firmes y constantes, creciendo en la obra del Señor siempre, sabiendo que vuestro trabajo no es en vano.", "referencia": "1 Corintios 15:58" },
    { "texto": "Y poderoso es Dios para hacer que abunde en vosotros toda gracia, a fin de que, teniendo siempre todo lo suficiente, abundéis para toda buena obra.", "referencia": "2 Corintios 9:8" },
    { "texto": "Bendito sea el Dios y Padre de nuestro Señor Jesucristo, Padre de misericordias y Dios de toda consolación.", "referencia": "2 Corintios 1:3" },

    // --- Gálatas y Efesios ---
    { "texto": "Mas el fruto del Espíritu es amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre, templanza; contra tales cosas no hay ley.", "referencia": "Gálatas 5:22-23" },
    { "texto": "Porque somos hechura suya, creados en Cristo Jesús para buenas obras, las cuales Dios preparó de antemano para que anduviésemos en ellas.", "referencia": "Efesios 2:10" },
    { "texto": "Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios; no por obras, para que nadie se gloríe.", "referencia": "Efesios 2:8-9" },
    { "texto": "No nos cansemos, pues, de hacer bien; porque a su tiempo segaremos, si no desmayamos.", "referencia": "Gálatas 6:9" },
    { "texto": "Antes sed benignos unos con otros, misericordiosos, perdonándoos unos a otros, como Dios también os perdonó a vosotros.", "referencia": "Efesios 4:32" },

    // --- Filipenses y Colosenses ---
    { "texto": "Todo lo puedo en Cristo que me fortalece, porque él es quien me da el poder para enfrentar cualquier situación.", "referencia": "Filipenses 4:13" },
    { "texto": "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.", "referencia": "Filipenses 4:6" },
    { "texto": "Y la paz de Dios, que sobrepasa todo entendimiento, guardará vuestros corazones y vuestros pensamientos en Cristo Jesús.", "referencia": "Filipenses 4:7" },
    { "texto": "Hermanos, yo mismo no pretendo haberlo ya alcanzado; pero una cosa hago: olvidando lo que queda atrás, y extendiéndome a lo que está delante.", "referencia": "Filipenses 3:13" },
    { "texto": "Haced todo sin murmuraciones y contiendas, para que seáis irreprensibles y sencillos, hijos de Dios sin mancha.", "referencia": "Filipenses 2:14-15" },
    { "texto": "Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.", "referencia": "Colosenses 3:23" },
    { "texto": "No que lo haya alcanzado ya, ni que ya sea perfecto; sino que prosigo, por ver si logro asir aquello para lo cual fui asido por Cristo.", "referencia": "Filipenses 3:12" },
    { "texto": "Aquel que comenzó en vosotros la buena obra, la perfeccionará hasta el día de Jesucristo.", "referencia": "Filipenses 1:6" },
    { "texto": "Sea vuestra palabra siempre con gracia, sazonada con sal, para que sepáis cómo debéis responder a cada uno.", "referencia": "Colosenses 4:6" },

    // --- Tesalonicenses y Timoteo ---
    { "texto": "Estad siempre gozosos. Orad sin cesar. Dad gracias en todo, porque esta es la voluntad de Dios para con vosotros en Cristo Jesús.", "referencia": "1 Tesalonicenses 5:16-18" },
    { "texto": "Pero fiel es el Señor, que os afirmará y guardará del mal. Y tenemos confianza respecto a vosotros en el Señor.", "referencia": "2 Tesalonicenses 3:3-4" },
    { "texto": "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.", "referencia": "2 Timoteo 1:7" },
    { "texto": "Toda la Escritura es inspirada por Dios, y útil para enseñar, para redargüir, para corregir, para instruir en justicia.", "referencia": "2 Timoteo 3:16" },
    { "texto": "Porque el fin del mandamiento es el amor nacido de corazón limpio, y de buena conciencia, y de fe no fingida.", "referencia": "1 Timoteo 1:5" },

    // ==========================================
    // EPÍSTOLAS GENERALES Y PROFECÍA
    // Autores: Santiago, Pedro, Juan, etc.
    // ==========================================
    { "texto": "Acerquémonos, pues, confiadamente al trono de la gracia, para alcanzar misericordia y hallar gracia para el oportuno socorro.", "referencia": "Hebreos 4:16" },
    { "texto": "Someteos, pues, a Dios; resistid al diablo, y huirá de vosotros. Acercaos a Dios, y él se acercará a vosotros.", "referencia": "Santiago 4:7-8" },
    { "texto": "Porque la palabra de Dios es viva y eficaz, y más cortante que toda espada de dos filos; y penetra hasta partir el alma y el espíritu.", "referencia": "Hebreos 4:12" },
    { "texto": "El que no ama, no ha conocido a Dios; porque Dios es amor. En esto se mostró el amor de Dios para con nosotros.", "referencia": "1 Juan 4:8-9" },
    { "texto": "Si confesamos nuestros pecados, él es fiel y justo para perdonar nuestros pecados, y limpiarnos de toda maldad.", "referencia": "1 Juan 1:9" },
    { "texto": "Y si alguno de vosotros tiene falta de sabiduría, pídala a Dios, el cual da a todos abundantemente y sin reproche, y le será dada.", "referencia": "Santiago 1:5" },
    { "texto": "Por esto, mis amados hermanos, todo hombre sea pronto para oír, tardo para hablar, tardo para airarse.", "referencia": "Santiago 1:19" },
    { "texto": "Gracia y paz os sean multiplicadas, en el conocimiento de Dios y de nuestro Señor Jesús.", "referencia": "2 Pedro 1:2" },
    { "texto": "Y esta es la confianza que tenemos en él, que si pedimos alguna cosa conforme a su voluntad, él nos oye.", "referencia": "1 Juan 5:14" },
    { "texto": "He aquí, yo estoy a la puerta y llamo; si alguno oye mi voz y abre la puerta, entraré a él, y cenaré con él, y él conmigo.", "referencia": "Apocalipsis 3:20" }
];

function getVersiculoDelDia() {
    const hoy = new Date();
    const inicioAño = new Date(hoy.getFullYear(), 0, 0);
    const diferencia = hoy.getTime() - inicioAño.getTime();
    const diaDelAño = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    return VERSICULOS[diaDelAño % VERSICULOS.length];
}

export function VerseOfTheDay() {
    const versiculo = getVersiculoDelDia();

    return (
        <section className="py-16 px-6 bg-background flex justify-center">
            <Card className="max-w-3xl w-full bg-muted/30 border-secondary/20 shadow-none rounded-none text-center p-8 md:p-12">
                <CardContent className="p-0 flex flex-col items-center">
                    <span className="font-serif text-[10px] tracking-[0.2em] uppercase text-secondary mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary/50"></span>
                        Palabra del Día
                        <span className="w-2 h-2 rounded-full bg-secondary/50"></span>
                    </span>

                    <p className="font-body text-xl md:text-2xl italic text-primary/90 leading-[1.8] mb-6">
                        «{versiculo.texto}»
                    </p>

                    <GoldenDivider className="opacity-70 my-2" />

                    <span className="font-serif text-sm text-primary tracking-widest mt-4">
                        {versiculo.referencia}
                    </span>

                    <span className="font-body text-[10px] text-primary/40 mt-1 uppercase tracking-widest">
                        Reina-Valera 1960
                    </span>
                </CardContent>
            </Card>
        </section>
    );
}