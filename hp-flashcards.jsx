import { useState, useEffect, useCallback, useRef } from "react";

// ─── CARD DATA ────────────────────────────────────────────────────────────────
const BASE_CARDS = [
  // VERBS
  { sp: "decir", en: "to say / to tell", type: "verb", freq: 932 },
  { sp: "preguntar", en: "to ask / to question", type: "verb", freq: 156 },
  { sp: "gritar", en: "to shout / to scream", type: "verb", freq: 82 },
  { sp: "mirar", en: "to look at / to watch", type: "verb", freq: 83 },
  { sp: "abrir", en: "to open", type: "verb", freq: 75 },
  { sp: "levantar", en: "to raise / to lift", type: "verb", freq: 49 },
  { sp: "coger", en: "to grab / to take (Spain)", type: "verb", freq: 43 },
  { sp: "responder", en: "to respond / to reply", type: "verb", freq: 40 },
  { sp: "susurrar", en: "to whisper", type: "verb", freq: 30 },
  { sp: "añadir", en: "to add / to say furthermore", type: "verb", freq: 33 },
  { sp: "contestar", en: "to answer / to reply", type: "verb", freq: 30 },
  { sp: "sacar", en: "to take out / to pull out", type: "verb", freq: 38 },
  { sp: "dejar", en: "to let / to leave behind", type: "verb", freq: 29 },
  { sp: "llegar", en: "to arrive / to reach", type: "verb", freq: 31 },
  { sp: "acercar", en: "to approach / to bring closer", type: "verb", freq: 35 },
  { sp: "volver", en: "to return / to go back", type: "verb", freq: 41 },
  { sp: "entrar", en: "to enter / to go in", type: "verb", freq: 28 },
  { sp: "correr", en: "to run", type: "verb", freq: 37 },
  { sp: "hablar", en: "to speak / to talk", type: "verb", freq: 58 },
  { sp: "escuchar", en: "to listen / to hear", type: "verb", freq: 25 },
  { sp: "intentar", en: "to try / to attempt", type: "verb", freq: 22 },
  { sp: "parecer", en: "to seem / to appear", type: "verb", freq: 124 },
  { sp: "recordar", en: "to remember / to remind", type: "verb", freq: 20 },
  { sp: "caer", en: "to fall", type: "verb", freq: 28 },
  { sp: "empujar", en: "to push / to shove", type: "verb", freq: 14 },
  { sp: "murmurar", en: "to murmur / to mutter", type: "verb", freq: 18 },
  { sp: "desaparecer", en: "to disappear (wizard context: vanish)", type: "verb", freq: 20 },
  { sp: "transformar", en: "to transform / to change form (spell)", type: "verb", freq: 16 },
  { sp: "atravesar", en: "to cross / to pass through", type: "verb", freq: 12 },
  { sp: "lanzar", en: "to throw / to launch / to cast (a spell)", type: "verb", freq: 18 },

  // NOUNS
  { sp: "varita", en: "wand (wizarding tool for casting spells)", type: "noun", freq: 113 },
  { sp: "cámara", en: "chamber / camera", type: "noun", freq: 103 },
  { sp: "magia", en: "magic [mágico]", type: "noun", freq: 65 },
  { sp: "puerta", en: "door / gate [abrir]", type: "noun", freq: 143 },
  { sp: "ojo", en: "eye [mirar]", type: "noun", freq: 164 },
  { sp: "cabeza", en: "head / mind [pensar]", type: "noun", freq: 135 },
  { sp: "mano", en: "hand [coger]", type: "noun", freq: 82 },
  { sp: "voz", en: "voice [hablar]", type: "noun", freq: 188 },
  { sp: "cara", en: "face / expression [mirar]", type: "noun", freq: 86 },
  { sp: "suelo", en: "floor / ground", type: "noun", freq: 93 },
  { sp: "castillo", en: "castle (Hogwarts setting)", type: "noun", freq: 50 },
  { sp: "sangre", en: "blood (key HP theme: blood purity)", type: "noun", freq: 48 },
  { sp: "serpiente", en: "serpent / snake [Slytherin symbol]", type: "noun", freq: 47 },
  { sp: "sombrero", en: "hat (the Sorting Hat in HP context)", type: "noun", freq: 47 },
  { sp: "araña", en: "spider [Aragog's species]", type: "noun", freq: 41 },
  { sp: "elfo", en: "elf (house-elf: wizarding servant)", type: "noun", freq: 29 },
  { sp: "mago", en: "wizard / sorcerer [magia]", type: "noun", freq: 42 },
  { sp: "poción", en: "potion (brewed magical liquid)", type: "noun", freq: 33 },
  { sp: "heredero", en: "heir / inheritor [heredar]", type: "noun", freq: 31 },
  { sp: "basilisco", en: "basilisk (legendary lethal serpent)", type: "noun", freq: 31 },
  { sp: "corredor", en: "corridor / hallway [castle passages]", type: "noun", freq: 40 },
  { sp: "diario", en: "diary / daily [Riddle's diary, key plot item]", type: "noun", freq: 69 },
  { sp: "secreto", en: "secret [Chamber of Secrets]", type: "noun", freq: 52 },
  { sp: "mundo", en: "world [el mundo mágico = wizarding world]", type: "noun", freq: 39 },
  { sp: "palaba", en: "word [palabras mágicas = magic words]", type: "noun", freq: 38 },
  { sp: "silencio", en: "silence / quiet [silenciar]", type: "noun", freq: 44 },
  { sp: "equipo", en: "team / equipment [Quidditch teams]", type: "noun", freq: 38 },
  { sp: "ventana", en: "window [abrir la ventana]", type: "noun", freq: 38 },
  { sp: "escalera", en: "stairs / staircase [castle stairs]", type: "noun", freq: 32 },
  { sp: "dormitorio", en: "dormitory / bedroom [Gryffindor dorm]", type: "noun", freq: 30 },
  { sp: "gafa", en: "glasses / spectacles [Harry's trademark]", type: "noun", freq: 30 },
  { sp: "nariz", en: "nose [nariz aguileña = hooked nose]", type: "noun", freq: 31 },
  { sp: "brazo", en: "arm [el brazo roto = broken arm]", type: "noun", freq: 41 },
  { sp: "pie", en: "foot / feet (standing point) [de pie = standing]", type: "noun", freq: 34 },
  { sp: "techo", en: "ceiling / roof [enchanted ceiling at Hogwarts]", type: "noun", freq: 32 },
  { sp: "rostro", en: "face / countenance (literary, more formal than cara)", type: "noun", freq: 33 },
  { sp: "multitud", en: "crowd / multitude [multitudinario]", type: "noun", freq: 31 },
  { sp: "instante", en: "instant / moment [al instante = instantly]", type: "noun", freq: 38 },
  { sp: "sonrisa", en: "smile [sonreír]", type: "noun", freq: 39 },
  { sp: "mirada", en: "gaze / look / glance [mirar]", type: "noun", freq: 49 },
  { sp: "túnica", en: "robe / tunic (wizarding garment)", type: "noun", freq: 41 },
  { sp: "curso", en: "school year / course [second year at Hogwarts]", type: "noun", freq: 43 },
  { sp: "ruido", en: "noise / sound [hacer ruido]", type: "noun", freq: 41 },
  { sp: "camino", en: "path / road / way [allanar el camino]", type: "noun", freq: 28 },
  { sp: "piedra", en: "stone [Philosopher's Stone, prev. book]", type: "noun", freq: 28 },
  { sp: "noche", en: "night [de noche = at night]", type: "noun", freq: 58 },
  { sp: "vida", en: "life [en vida = alive]", type: "noun", freq: 28 },
  { sp: "nombre", en: "name [el-que-no-debe-ser-nombrado]", type: "noun", freq: 34 },
  { sp: "idea", en: "idea / plan [buena idea]", type: "noun", freq: 32 },
  { sp: "manera", en: "manner / way [de ninguna manera = no way]", type: "noun", freq: 31 },
  { sp: "lugar", en: "place / location [en su lugar = instead]", type: "noun", freq: 48 },
  { sp: "gente", en: "people / folk [la gente del colegio]", type: "noun", freq: 48 },
  { sp: "familia", en: "family [familia Weasley = the Weasley family]", type: "noun", freq: 44 },
  { sp: "libro", en: "book [libros de texto = textbooks]", type: "noun", freq: 50 },
  { sp: "alumno", en: "student / pupil [alumnos de Hogwarts]", type: "noun", freq: 42 },
  { sp: "tiempo", en: "time / weather [con el tiempo = in time]", type: "noun", freq: 77 },
  { sp: "colegio", en: "school (here: Hogwarts) [colegial]", type: "noun", freq: 103 },
  { sp: "padre", en: "father / parent [padre mágico]", type: "noun", freq: 54 },
  { sp: "pelo", en: "hair [pelo revuelto = messy hair like Harry's]", type: "noun", freq: 43 },
  { sp: "boca", en: "mouth [boca abierta = open-mouthed]", type: "noun", freq: 50 },
  { sp: "prisa", en: "hurry / haste [darse prisa = to hurry]", type: "noun", freq: 30 },
  { sp: "frente", en: "forehead / front [la cicatriz en la frente]", type: "noun", freq: 29 },
  { sp: "muchacho", en: "boy / lad / youngster", type: "noun", freq: 29 },
  { sp: "aire", en: "air / atmosphere [en el aire = in the air]", type: "noun", freq: 49 },
  { sp: "minuto", en: "minute [en pocos minutos = in a few minutes]", type: "noun", freq: 32 },
  { sp: "tarde", en: "afternoon / late (time adverb) [por la tarde]", type: "noun", freq: 31 },
  { sp: "mañana", en: "morning / tomorrow [mañana por la mañana]", type: "noun", freq: 28 },
  { sp: "punto", en: "point / dot / period [en ese punto = at that point]", type: "noun", freq: 28 },
  { sp: "cama", en: "bed [irse a la cama = to go to bed]", type: "noun", freq: 55 },
  { sp: "sala", en: "common room / hall / lounge [sala común]", type: "noun", freq: 55 },
  { sp: "mesa", en: "table / desk [mesa del comedor]", type: "noun", freq: 65 },
  { sp: "forma", en: "form / shape / way [de alguna forma]", type: "noun", freq: 39 },
  { sp: "clase", en: "class / classroom / kind [clase de pociones]", type: "noun", freq: 74 },
  { sp: "muggle", en: "Muggle (non-magical person, HP term)", type: "noun", freq: 41 },
  { sp: "coche", en: "car (the flying Ford Anglia)", type: "noun", freq: 95 },
  { sp: "casa", en: "house (also Hogwarts houses) [Gryffindor]", type: "noun", freq: 80 },

  // ADJECTIVES
  { sp: "mágico", en: "magical / magic [magia]", type: "adj", freq: 44 },
  { sp: "grande", en: "big / great / grand [grandioso]", type: "adj", freq: 95 },
  { sp: "seguro", en: "safe / sure / certain [asegurar]", type: "adj", freq: 31 },
  { sp: "fuerte", en: "strong / loud / hard [fortalecer]", type: "adj", freq: 36 },
  { sp: "extraño", en: "strange / foreign / odd [extrañar]", type: "adj", freq: 25 },
  { sp: "oscuro", en: "dark / obscure [oscurecer] (dark arts context)", type: "adj", freq: 22 },
  { sp: "pequeño", en: "small / little / young [pequeñez]", type: "adj", freq: 26 },
  { sp: "enorme", en: "enormous / huge [enormidad]", type: "adj", freq: 18 },
  { sp: "asustado", en: "scared / frightened [asustar]", type: "adj", freq: 14 },
  { sp: "pálido", en: "pale / pallid [palidecer]", type: "adj", freq: 16 },
  { sp: "único", en: "unique / only / sole [unicidad]", type: "adj", freq: 29 },
  { sp: "horrible", en: "horrible / dreadful / awful", type: "adj", freq: 14 },
  { sp: "segundo", en: "second (ordinal) [segundo año = second year]", type: "adj", freq: 35 },
  { sp: "primero", en: "first / primary [primera vez = first time]", type: "adj", freq: 32 },
  { sp: "completo", en: "complete / entire / full [completamente]", type: "adj", freq: 38 },
  { sp: "negro", en: "black [el gato negro de la señora Norris]", type: "adj", freq: 20 },
  { sp: "blanco", en: "white / blank [página en blanco]", type: "adj", freq: 15 },
  { sp: "plateado", en: "silver / silvery [platear] (Nearly Headless Nick)", type: "adj", freq: 12 },
  { sp: "frío", en: "cold / cool [enfriar] (cold dungeons of Slytherin)", type: "adj", freq: 18 },
  { sp: "brillante", en: "brilliant / shining / glowing [brillar]", type: "adj", freq: 14 },
  { sp: "tembloroso", en: "trembling / shaky [temblar]", type: "adj", freq: 10 },
  { sp: "ansioso", en: "anxious / eager / keen [ansiar]", type: "adj", freq: 10 },
  { sp: "nervioso", en: "nervous / anxious [nerviosismo]", type: "adj", freq: 15 },
  { sp: "silencioso", en: "silent / quiet [silencio]", type: "adj", freq: 14 },
  { sp: "doloroso", en: "painful / distressing [doler]", type: "adj", freq: 10 },
  { sp: "encantado", en: "enchanted / delighted (lit: under a spell) [encantar]", type: "adj", freq: 12 },
  { sp: "decapitado", en: "beheaded / decapitated [decapitar] (Nearly-Headless Nick)", type: "adj", freq: 35 },
  { sp: "plateado", en: "silver-colored / silvery [plata]", type: "adj", freq: 12 },
  { sp: "poderoso", en: "powerful / mighty [poder]", type: "adj", freq: 12 },
  { sp: "verdadero", en: "true / real / genuine [verdad]", type: "adj", freq: 14 },
  { sp: "malvado", en: "wicked / evil / villainous [maldad]", type: "adj", freq: 10 },
  { sp: "muggle", en: "Muggle (non-magical — also used as adj)", type: "adj", freq: 37 },
  { sp: "famoso", en: "famous / renowned [fama] (Lockhart is famoso)", type: "adj", freq: 14 },
  { sp: "inmóvil", en: "motionless / still / immobile [moverse]", type: "adj", freq: 12 },
  { sp: "petrificado", en: "petrified / frozen in fear (lit: turned to stone) [petrificar]", type: "adj", freq: 20 },

  // ── BATCH 2 (words 51–100 by corpus frequency, normalized) ──
  { sp: "grande", en: "big / great / large (gran before noun = great)", type: "adj", freq: 46 },
  { sp: "tío", en: "uncle (tío Vernon = Uncle Vernon; colloquial: guy/dude)", type: "noun", freq: 45 },
  { sp: "oído", en: "ear / inner hearing (tocar de oído = to play by ear)", type: "noun", freq: 45 },
  { sp: "familia", en: "family", type: "noun", freq: 44 },
  { sp: "silencio", en: "silence / quiet (en silencio = in silence)", type: "noun", freq: 44 },
  { sp: "curso", en: "school year / course (segundo curso = second year)", type: "noun", freq: 43 },
  { sp: "salir", en: "to leave / to go out / to exit", type: "verb", freq: 43 },
  { sp: "pelo", en: "hair (pelo revuelto = messy hair, like Harry's)", type: "noun", freq: 43 },
  { sp: "mago", en: "wizard / sorcerer / magician", type: "noun", freq: 42 },
  { sp: "alumno", en: "student / pupil (alumnos de Hogwarts = Hogwarts students)", type: "noun", freq: 42 },
  { sp: "araña", en: "spider (Aragog and his colony of Acromantulas)", type: "noun", freq: 41 },
  { sp: "muggle", en: "Muggle (non-magical person — HP-specific term)", type: "noun", freq: 41 },
  { sp: "ruido", en: "noise / sound (hacer ruido = to make noise)", type: "noun", freq: 41 },
  { sp: "brazo", en: "arm (el brazo roto = the broken arm — Lockhart's blunder)", type: "noun", freq: 41 },
  { sp: "volver", en: "to return / to come back / to go back", type: "verb", freq: 41 },
  { sp: "túnica", en: "robe / tunic (the standard wizarding garment)", type: "noun", freq: 41 },
  { sp: "corredor", en: "corridor / hallway / passage (castle corridors)", type: "noun", freq: 40 },
  { sp: "año", en: "year (este año = this year; años = years)", type: "noun", freq: 40 },
  { sp: "mundo", en: "world (el mundo mágico = the wizarding world)", type: "noun", freq: 39 },
  { sp: "forma", en: "form / shape / way (de esta forma = in this way)", type: "noun", freq: 39 },
  { sp: "sonrisa", en: "smile (una amplia sonrisa = a broad smile)", type: "noun", freq: 39 },
  { sp: "hora", en: "hour / time of day (¿qué hora es? = what time is it?)", type: "noun", freq: 38 },
  { sp: "palabra", en: "word (palabras mágicas = magic words)", type: "noun", freq: 38 },
  { sp: "equipo", en: "team / equipment (equipo de Quidditch = Quidditch team)", type: "noun", freq: 38 },
  { sp: "instante", en: "instant / moment (al instante = instantly)", type: "noun", freq: 38 },
  { sp: "ventana", en: "window", type: "noun", freq: 38 },
  { sp: "pasar", en: "to pass / to happen / to spend time (¿qué pasa? = what's happening?)", type: "verb", freq: 37 },
  { sp: "correr", en: "to run / to rush", type: "verb", freq: 37 },
  { sp: "fuerte", en: "strong / loud / hard (un golpe fuerte = a hard blow)", type: "adj", freq: 36 },
  { sp: "decapitado", en: "beheaded / decapitated (Nearly Headless Nick's defining condition)", type: "adj", freq: 35 },
  { sp: "nombre", en: "name (el-que-no-debe-ser-nombrado = He-Who-Must-Not-Be-Named)", type: "noun", freq: 34 },
  { sp: "pie", en: "foot (de pie = standing up; a pie = on foot)", type: "noun", freq: 34 },
  { sp: "cuidado", en: "care / caution (¡ten cuidado! = be careful!)", type: "noun", freq: 34 },
  { sp: "bludger", en: "Bludger (enchanted iron ball used in Quidditch to knock players off brooms)", type: "noun", freq: 34 },
  { sp: "rostro", en: "face / countenance (literary; more formal than cara)", type: "noun", freq: 33 },
  { sp: "poción", en: "potion (a brewed magical liquid; clase de Pociones = Potions class)", type: "noun", freq: 33 },
  { sp: "dar", en: "to give / to strike / to yield (dar un paso = to take a step)", type: "verb", freq: 32 },
  { sp: "techo", en: "ceiling / roof (el techo encantado del Gran Comedor = the enchanted ceiling)", type: "noun", freq: 32 },
  { sp: "escalera", en: "stairs / staircase (the moving staircases of Hogwarts)", type: "noun", freq: 32 },
  { sp: "idea", en: "idea / plan (buena idea = good idea)", type: "noun", freq: 32 },
  { sp: "minuto", en: "minute (en pocos minutos = in a few minutes)", type: "noun", freq: 32 },
  { sp: "primero", en: "first / primary (por primera vez = for the first time)", type: "adj", freq: 32 },
  { sp: "heredero", en: "heir / inheritor (el heredero de Slytherin = the Heir of Slytherin)", type: "noun", freq: 31 },
  { sp: "basilisco", en: "basilisk (the monstrous serpent living in the Chamber of Secrets)", type: "noun", freq: 31 },
  { sp: "nariz", en: "nose (nariz aguileña = hooked nose, like Snape's)", type: "noun", freq: 31 },
  { sp: "multitud", en: "crowd / multitude", type: "noun", freq: 31 },
  { sp: "seguro", en: "safe / sure / certain (estar seguro = to be sure)", type: "adj", freq: 31 },
  { sp: "tarde", en: "afternoon / late (por la tarde = in the afternoon)", type: "noun", freq: 31 },
  { sp: "manera", en: "manner / way (de ninguna manera = no way; in no way)", type: "noun", freq: 31 },
  { sp: "llegar", en: "to arrive / to reach (llegar a tiempo = to arrive on time)", type: "verb", freq: 31 },

  // ── BATCH 3 (words 101–200 by corpus frequency, normalized) ──
  { sp: "ningún", en: "no / none / not any (ningún mago = no wizard)", type: "adj", freq: 42 },
  { sp: "embargo", en: "sin embargo = however / nevertheless (B2 discourse connector)", type: "noun", freq: 40 },
  { sp: "atrás", en: "behind / back / backwards (echar atrás = to back away)", type: "adv", freq: 34 },
  { sp: "fin", en: "end / purpose (al fin = at last; por fin = finally; a fin de = in order to)", type: "noun", freq: 34 },
  { sp: "medio", en: "middle / half / means (en medio de = in the middle of; medio dormido = half asleep)", type: "noun", freq: 32 },
  { sp: "oír", en: "to hear (¿oyes eso? = do you hear that? — Harry hears the Basilisk)", type: "verb", freq: 32 },
  { sp: "dormitorio", en: "dormitory / bedroom (dormitorio de Gryffindor = Gryffindor dormitory)", type: "noun", freq: 30 },
  { sp: "repente", en: "de repente = suddenly / all of a sudden (B2 adverbial phrase)", type: "noun", freq: 30 },
  { sp: "prisa", en: "hurry / haste (darse prisa = to hurry; tener prisa = to be in a hurry)", type: "noun", freq: 30 },
  { sp: "elfo", en: "elf (elfo doméstico = house-elf; Dobby is the key house-elf of this book)", type: "noun", freq: 29 },
  { sp: "muchacho", en: "boy / lad / youngster (informal address)", type: "noun", freq: 29 },
  { sp: "frente", en: "forehead / front (la cicatriz en la frente = the scar on Harry's forehead)", type: "noun", freq: 29 },
  { sp: "único", en: "unique / only / sole (el único = the only one)", type: "adj", freq: 29 },
  { sp: "final", en: "end / finale / ending (al final = in the end; final del curso = end of term)", type: "noun", freq: 29 },
  { sp: "dejar", en: "to leave / to let / to allow (déjame en paz = leave me alone; dejar caer = to drop)", type: "verb", freq: 29 },
  { sp: "paso", en: "step / pace / passage (dar un paso = to take a step; abrir paso = to make way)", type: "noun", freq: 29 },
  { sp: "camino", en: "path / road / way (en el camino = on the way; allanar el camino = to pave the way)", type: "noun", freq: 29 },
  { sp: "piedra", en: "stone (la piedra filosofal = the Philosopher's Stone, previous book)", type: "noun", freq: 28 },
  { sp: "mañana", en: "morning / tomorrow (mañana por la mañana = tomorrow morning)", type: "noun", freq: 28 },
  { sp: "vida", en: "life (en vida = while alive; salvar la vida = to save one's life)", type: "noun", freq: 28 },
  { sp: "punto", en: "point / dot / moment (estar a punto de = to be about to)", type: "noun", freq: 28 },
  { sp: "entrar", en: "to enter / to go in (entrar en la cámara = to enter the chamber)", type: "verb", freq: 28 },
  { sp: "expresión", en: "expression / look (expresión de sorpresa = expression of surprise)", type: "noun", freq: 28 },
  { sp: "monstruo", en: "monster / beast (el monstruo de la Cámara = the monster of the Chamber)", type: "noun", freq: 28 },
  { sp: "golpe", en: "blow / hit / knock (de un golpe = in one blow; golpe seco = sharp knock)", type: "noun", freq: 27 },
  { sp: "viejo", en: "old / elderly / ancient (viejo mago = old wizard)", type: "adj", freq: 27 },
  { sp: "despacho", en: "office / study (el despacho de Dumbledore = Dumbledore's office)", type: "noun", freq: 27 },
  { sp: "vuelta", en: "turn / return / lap (dar la vuelta = to turn around; de vuelta = back)", type: "noun", freq: 26 },
  { sp: "comedor", en: "dining hall (el Gran Comedor = the Great Hall at Hogwarts)", type: "noun", freq: 26 },
  { sp: "pared", en: "wall (el mensaje en la pared = the message on the wall — key plot clue)", type: "noun", freq: 26 },
  { sp: "cuerpo", en: "body / corpus (cuerpo petrificado = petrified body)", type: "noun", freq: 26 },
  { sp: "campo", en: "field / pitch (campo de Quidditch = Quidditch pitch)", type: "noun", freq: 26 },
  { sp: "resto", en: "rest / remainder (el resto de los alumnos = the rest of the students)", type: "noun", freq: 25 },
  { sp: "negro", en: "black (magia negra = black magic; artes oscuras = Dark Arts)", type: "adj", freq: 25 },
  { sp: "pequeño", en: "small / little / young (pequeño elfo = little elf)", type: "adj", freq: 25 },
  { sp: "corazón", en: "heart (con el corazón en un puño = with heart in mouth — gripped by fear)", type: "noun", freq: 25 },
  { sp: "común", en: "common / shared (sala común = common room; sentido común = common sense)", type: "adj", freq: 25 },
  { sp: "tono", en: "tone / shade / pitch (en tono serio = in a serious tone)", type: "noun", freq: 25 },
  { sp: "habitación", en: "room / bedroom (la habitación de Harry = Harry's room at the Dursleys')", type: "noun", freq: 24 },
  { sp: "tía", en: "aunt (tía Petunia = Aunt Petunia)", type: "noun", freq: 24 },
  { sp: "grito", en: "shout / scream / cry (lanzar un grito = to let out a scream)", type: "noun", freq: 24 },
  { sp: "alto", en: "tall / high / loud (en voz alta = aloud; de alto = tall)", type: "adj", freq: 24 },
  { sp: "enfermería", en: "infirmary / hospital wing (run by Madam Pomfrey at Hogwarts)", type: "noun", freq: 24 },
  { sp: "bosque", en: "forest / woods (el Bosque Prohibido = the Forbidden Forest)", type: "noun", freq: 23 },
  { sp: "alrededor", en: "around / surrounding (a su alrededor = around him; mirar alrededor = to look around)", type: "adv", freq: 23 },
  { sp: "lista", en: "list / ready / clever (lista de útiles = supplies list; ¡está lista! = she's ready!)", type: "noun", freq: 23 },
  { sp: "explicar", en: "to explain (explicar la situación = to explain the situation)", type: "verb", freq: 23 },
  { sp: "director", en: "headmaster / principal (el director Dumbledore = Headmaster Dumbledore)", type: "noun", freq: 23 },
  { sp: "cerca", en: "near / close (cerca de = near / close to; de cerca = up close)", type: "adv", freq: 23 },
  { sp: "largo", en: "long / lengthy (a lo largo de = along; largo rato = a long while)", type: "adj", freq: 23 },
  { sp: "bastante", en: "quite / enough / rather (bastante bien = quite well; ya es bastante = that's enough)", type: "adv", freq: 23 },
  { sp: "chimenea", en: "fireplace (la red Flu = Floo Network, used via chimenea to travel between wizarding homes)", type: "noun", freq: 23 },
  { sp: "caso", en: "case / matter (en todo caso = in any case; hacer caso = to pay attention / to heed)", type: "noun", freq: 23 },
  { sp: "escoba", en: "broomstick (escoba voladora = flying broomstick; Harry's Nimbus 2000)", type: "noun", freq: 22 },
  { sp: "carta", en: "letter (carta de Hogwarts = Hogwarts acceptance letter; carta de Dobby)", type: "noun", freq: 22 },
  { sp: "capa", en: "cloak / cape / layer (capa de invisibilidad = invisibility cloak)", type: "noun", freq: 22 },
  { sp: "fuerza", en: "strength / force (con todas sus fuerzas = with all one's strength)", type: "noun", freq: 22 },
  { sp: "oscuro", en: "dark / obscure (artes oscuras = Dark Arts; el señor oscuro = the Dark Lord)", type: "adj", freq: 22 },
  { sp: "historia", en: "history / story (Historia de la Magia = History of Magic — a Hogwarts subject)", type: "noun", freq: 22 },
  { sp: "caldero", en: "cauldron (caldero de pociones = potion cauldron — essential Potions equipment)", type: "noun", freq: 21 },
  { sp: "pensar", en: "to think / to consider / to intend (pensar en = to think about)", type: "verb", freq: 21 },
  { sp: "oscuridad", en: "darkness / the dark (en la oscuridad = in the dark)", type: "noun", freq: 21 },
  { sp: "rojo", en: "red (pelo rojo = red hair — the Weasley family trademark)", type: "adj", freq: 21 },
  { sp: "dedo", en: "finger / toe (señalar con el dedo = to point a finger at)", type: "noun", freq: 21 },
  { sp: "despacio", en: "slowly / gently (hablar despacio = to speak slowly)", type: "adv", freq: 21 },
  { sp: "retrete", en: "toilet / bathroom (el retrete de Myrtle = Myrtle's bathroom — entrance to the Chamber)", type: "noun", freq: 21 },
  { sp: "lechuza", en: "owl (lechuza mensajera = messenger owl; Hedwig is Harry's snowy owl)", type: "noun", freq: 20 },
  { sp: "parte", en: "part / side / place (por parte de = on behalf of; en ninguna parte = nowhere)", type: "noun", freq: 20 },
  { sp: "silla", en: "chair (silla del profesor = teacher's chair)", type: "noun", freq: 20 },
  { sp: "tamaño", en: "size / magnitude (del tamaño de = the size of)", type: "noun", freq: 20 },
  { sp: "hombre", en: "man (hombre invisible = invisible man)", type: "noun", freq: 20 },
  { sp: "aspecto", en: "appearance / aspect / look (tener buen aspecto = to look well)", type: "noun", freq: 20 },
  { sp: "siguiente", en: "following / next (al día siguiente = the next day)", type: "adj", freq: 20 },
  { sp: "volar", en: "to fly (volar en escoba = to fly on a broomstick)", type: "verb", freq: 20 },
  { sp: "encontrar", en: "to find / to meet / to encounter (encontrar la cámara = to find the chamber)", type: "verb", freq: 20 },
  { sp: "desaparecer", en: "to disappear / to vanish (desaparecer sin dejar rastro = to vanish without a trace)", type: "verb", freq: 20 },
  { sp: "petrificar", en: "to petrify / to turn to stone (the Basilisk's indirect gaze petrifies its victims)", type: "verb", freq: 20 },
  { sp: "extraño", en: "strange / odd / foreign (un sonido extraño = a strange sound)", type: "adj", freq: 19 },
  { sp: "susurrar", en: "to whisper / to murmur (susurrar en la oscuridad = to whisper in the dark)", type: "verb", freq: 19 },
  { sp: "sujetar", en: "to hold / to grip / to fasten (sujetar la varita = to grip the wand)", type: "verb", freq: 19 },
  { sp: "espejo", en: "mirror (el espejo de Oesed = the Mirror of Erised, previous book)", type: "noun", freq: 19 },
  { sp: "columna", en: "column / pillar (columnas de piedra = stone columns in the Chamber of Secrets)", type: "noun", freq: 19 },
  { sp: "asustar", en: "to frighten / to scare (asustar a alguien = to scare someone)", type: "verb", freq: 18 },
  { sp: "lanzar", en: "to throw / to launch / to cast (lanzar un hechizo = to cast a spell)", type: "verb", freq: 18 },
  { sp: "frío", en: "cold (hace frío = it's cold; sangre fría = composure under pressure)", type: "adj", freq: 18 },
  { sp: "transformar", en: "to transform / to change form (the Polyjuice Potion transforms the drinker)", type: "verb", freq: 18 },
  { sp: "murmurar", en: "to murmur / to mutter (murmurar entre dientes = to mutter under one's breath)", type: "verb", freq: 18 },
  { sp: "acudir", en: "to come / to go / to turn to (acudir en ayuda = to come to the rescue)", type: "verb", freq: 18 },
  { sp: "enorme", en: "enormous / huge (una serpiente enorme = an enormous serpent)", type: "adj", freq: 18 },
  { sp: "peligro", en: "danger / peril (en peligro = in danger; peligro de muerte = mortal danger)", type: "noun", freq: 18 },
  { sp: "hechizo", en: "spell / charm / hex (lanzar un hechizo = to cast a spell)", type: "noun", freq: 18 },
  { sp: "tratar", en: "to treat / to try / to deal with (tratar de = to try to)", type: "verb", freq: 17 },
  { sp: "avanzar", en: "to advance / to move forward / to progress", type: "verb", freq: 17 },
  { sp: "nota", en: "note / grade (una nota en el escritorio = a note on the desk)", type: "noun", freq: 17 },
  { sp: "brillar", en: "to shine / to gleam / to glow (los ojos brillaban = the eyes gleamed)", type: "verb", freq: 17 },
  { sp: "pálido", en: "pale / pallid (quedarse pálido = to go pale from shock or fear)", type: "adj", freq: 17 },
  { sp: "imagen", en: "image / picture / reflection (la imagen en el espejo = the image in the mirror)", type: "noun", freq: 17 },
  { sp: "acercarse", en: "to approach / to draw near / to come closer", type: "verb", freq: 17 },

  // ── BATCH 4 (words 201–300 by corpus frequency, normalized) ──
  { sp: "aseo", en: "toilet / washroom (aseos = bathrooms — Myrtle haunts the girls' aseos)", type: "noun", freq: 24 },
  { sp: "inmediatamente", en: "immediately / at once", type: "adv", freq: 23 },
  { sp: "abajo", en: "below / down / downstairs (hacia abajo = downward; boca abajo = face down)", type: "adv", freq: 22 },
  { sp: "quizá", en: "perhaps / maybe (quizá sea = perhaps it is — triggers subjunctive at C1)", type: "adv", freq: 19 },
  { sp: "muerto", en: "dead / deceased (muerto de miedo = scared to death)", type: "adj", freq: 19 },
  { sp: "abrir", en: "to open (abrir la puerta = to open the door; abrir camino = to forge a path)", type: "verb", freq: 19 },
  { sp: "caer", en: "to fall / to drop (caer al suelo = to fall to the floor; dejar caer = to drop)", type: "verb", freq: 19 },
  { sp: "diente", en: "tooth / fang (dientes de serpiente = snake fangs — the Basilisk's weapon)", type: "noun", freq: 19 },
  { sp: "último", en: "last / final / latest (el último año = the final year; por último = lastly)", type: "adj", freq: 19 },
  { sp: "fuego", en: "fire (fuego mágico = magical fire; Fawkes renace del fuego = Fawkes reborn from fire)", type: "noun", freq: 19 },
  { sp: "cielo", en: "sky / heaven (el cielo estrellado = the starry sky — Hogwarts enchanted ceiling)", type: "noun", freq: 19 },
  { sp: "lleno", en: "full / filled (lleno de miedo = filled with fear; a pleno = in full)", type: "adj", freq: 19 },
  { sp: "agua", en: "water (agua lodosa = muddy water)", type: "noun", freq: 19 },
  { sp: "piel", en: "skin / hide / fur (ponérsele la piel de gallina = to get goosebumps)", type: "noun", freq: 19 },
  { sp: "querido", en: "dear / beloved (querido diario = dear diary — Riddle's diary entries)", type: "adj", freq: 19 },
  { sp: "jaula", en: "cage (la jaula de Hedwig = Hedwig's cage)", type: "noun", freq: 18 },
  { sp: "bruja", en: "witch (bruja malvada = wicked witch; female wizard)", type: "noun", freq: 18 },
  { sp: "sitio", en: "place / spot (en este sitio = in this place; hacer sitio = to make room)", type: "noun", freq: 18 },
  { sp: "sol", en: "sun (a pleno sol = in full sun; salir el sol = for the sun to rise)", type: "noun", freq: 18 },
  { sp: "algún", en: "some / any (algún mago = some wizard; algún día = someday)", type: "adj", freq: 18 },
  { sp: "fantasma", en: "ghost (los fantasmas de Hogwarts; Nearly Headless Nick is a fantasma)", type: "noun", freq: 18 },
  { sp: "lengua", en: "tongue / language (lengua de serpiente = snake tongue; Parseltongue)", type: "noun", freq: 18 },
  { sp: "trabajo", en: "work / job / task (trabajo de clase = class assignment; trabajo duro = hard work)", type: "noun", freq: 18 },
  { sp: "callejón", en: "alley (el Callejón Diagon = Diagon Alley; el Callejón Knockturn = Knockturn Alley)", type: "noun", freq: 18 },
  { sp: "hombro", en: "shoulder (encogerse de hombros = to shrug)", type: "noun", freq: 18 },
  { sp: "persona", en: "person / individual (una persona de confianza = a trusted person)", type: "noun", freq: 18 },
  { sp: "muro", en: "wall / barrier (muro de piedra = stone wall; muro de contención = retaining wall)", type: "noun", freq: 18 },
  { sp: "extremo", en: "end / extreme / tip (al otro extremo = at the other end; en casos extremos)", type: "noun", freq: 18 },
  { sp: "aula", en: "classroom / lecture hall (aula de transformaciones = Transfiguration classroom)", type: "noun", freq: 18 },
  { sp: "sucio", en: "dirty / filthy (sangre sucia = Mudblood — HP slur for Muggle-born wizard)", type: "adj", freq: 18 },
  { sp: "realmente", en: "really / truly / in reality (B2 intensifier)", type: "adv", freq: 18 },
  { sp: "amigo", en: "friend / mate (mi mejor amigo = my best friend)", type: "noun", freq: 17 },
  { sp: "pociones", en: "Potions (school subject; la clase de Pociones = Potions class — Snape's domain)", type: "noun", freq: 17 },
  { sp: "baúl", en: "trunk / chest (el baúl de Harry = Harry's school trunk)", type: "noun", freq: 17 },
  { sp: "verde", en: "green (los ojos verdes de Harry; la marca verde = the Dark Mark in the sky)", type: "adj", freq: 17 },
  { sp: "brillante", en: "brilliant / shining / gleaming (ojos brillantes = gleaming eyes)", type: "adj", freq: 17 },
  { sp: "supuesto", en: "supposed / assumed (por supuesto = of course — essential B2 fixed phrase)", type: "adj", freq: 17 },
  { sp: "armario", en: "wardrobe / cupboard (el armario debajo de la escalera = Harry's cupboard under the stairs)", type: "noun", freq: 17 },
  { sp: "vistazo", en: "glance / quick look (echar un vistazo = to have a quick look)", type: "noun", freq: 17 },
  { sp: "prefecto", en: "prefect (student monitor at Hogwarts; Percy Weasley is a prefecto)", type: "noun", freq: 17 },
  { sp: "madre", en: "mother / mum (madre de sangre pura = pure-blood mother)", type: "noun", freq: 17 },
  { sp: "coger", en: "to grab / to take / to catch (Spain: coger la varita = to grab the wand)", type: "verb", freq: 17 },
  { sp: "tinta", en: "ink (tinta invisible = invisible ink; Riddle's diary absorbs and releases tinta)", type: "noun", freq: 17 },
  { sp: "premio", en: "prize / award (Lockhart's many Premio awards line his office walls)", type: "noun", freq: 17 },
  { sp: "rápidamente", en: "quickly / rapidly (B2 adverb of manner)", type: "adv", freq: 17 },
  { sp: "seleccionador", en: "selector / sorting agent (Sombrero Seleccionador = Sorting Hat)", type: "noun", freq: 17 },
  { sp: "demás", en: "the rest / the others (los demás alumnos = the other students)", type: "adj", freq: 17 },
  { sp: "muerte", en: "death (la Orden de la Muerte = Death Eaters; pena de muerte = death penalty)", type: "noun", freq: 17 },
  { sp: "señorita", en: "Miss / young woman (señorita Granger = Miss Granger)", type: "noun", freq: 17 },
  { sp: "fiesta", en: "party / celebration (la fiesta de Casi Decapitado = Nearly Headless Nick's deathday party)", type: "noun", freq: 17 },
  { sp: "impresión", en: "impression / shock (dar buena impresión = to make a good impression)", type: "noun", freq: 16 },
  { sp: "cumpleaños", en: "birthday (el peor cumpleaños = the worst birthday — Chapter 1 title)", type: "noun", freq: 16 },
  { sp: "seguir", en: "to follow / to continue / to keep on (seguir adelante = to keep going)", type: "verb", freq: 16 },
  { sp: "salto", en: "jump / leap (dar un salto = to leap; pegar un salto = to give a start)", type: "noun", freq: 16 },
  { sp: "verano", en: "summer (las vacaciones de verano = summer holidays)", type: "noun", freq: 16 },
  { sp: "importante", en: "important / significant (lo más importante = the most important thing)", type: "adj", freq: 16 },
  { sp: "montón", en: "heap / pile / loads (un montón de = loads of — B2 colloquial intensifier)", type: "noun", freq: 16 },
  { sp: "pierna", en: "leg (las piernas temblorosas = trembling legs)", type: "noun", freq: 16 },
  { sp: "mitad", en: "half / midpoint (a mitad de camino = halfway; la mitad del curso = mid-term)", type: "noun", freq: 16 },
  { sp: "mamá", en: "mum / mom (informal; used by the Weasley children for Mrs Weasley)", type: "noun", freq: 16 },
  { sp: "cabo", en: "end / detail (al cabo de = after; llevar a cabo = to carry out; al fin y al cabo = after all)", type: "noun", freq: 16 },
  { sp: "defensa", en: "defence (Defensa Contra las Artes Oscuras = Defence Against the Dark Arts)", type: "noun", freq: 16 },
  { sp: "velocidad", en: "speed / velocity (a toda velocidad = at full speed)", type: "noun", freq: 16 },
  { sp: "entrada", en: "entrance / entry (la entrada de la cámara = the entrance to the chamber)", type: "noun", freq: 16 },
  { sp: "difícil", en: "difficult / hard / tricky (una situación difícil = a difficult situation)", type: "adj", freq: 16 },
  { sp: "vela", en: "candle (las velas flotantes del Gran Comedor = the floating candles of the Great Hall)", type: "noun", freq: 16 },
  { sp: "bolsa", en: "bag / purse / pouch (la bolsa de galeones = the bag of Galleons)", type: "noun", freq: 16 },
  { sp: "peor", en: "worse / worst (el peor cumpleaños = the worst birthday; de mal en peor = from bad to worse)", type: "adj", freq: 19 },
  { sp: "favor", en: "favour (por favor = please; a favor de = in favour of; pedir un favor = to ask a favour)", type: "noun", freq: 19 },
  { sp: "partido", en: "match / game / party (partido de Quidditch = Quidditch match)", type: "noun", freq: 19 },
  { sp: "pájaro", en: "bird (el pájaro de fuego = the firebird — Fawkes the phoenix)", type: "noun", freq: 19 },
  { sp: "arriba", en: "above / up / upstairs (hacia arriba = upward; de arriba abajo = from top to bottom)", type: "adv", freq: 17 },
  { sp: "suficiente", en: "enough / sufficient (ya es suficiente = that's enough; suficiente para = enough to)", type: "adj", freq: 15 },
  { sp: "cocina", en: "kitchen (la cocina de los Weasley = the Weasleys' kitchen at the Burrow)", type: "noun", freq: 15 },
  { sp: "furioso", en: "furious / enraged / livid (ponerse furioso = to become furious)", type: "adj", freq: 15 },
  { sp: "vacaciones", en: "holidays / vacation (vacaciones de verano = summer holidays)", type: "noun", freq: 15 },
  { sp: "torre", en: "tower (la Torre de Gryffindor = Gryffindor Tower; la Torre de Astronomía)", type: "noun", freq: 15 },
  { sp: "cabaña", en: "hut / cabin (la cabaña de Hagrid = Hagrid's hut on Hogwarts grounds)", type: "noun", freq: 15 },
  { sp: "cicatriz", en: "scar (la cicatriz en la frente de Harry = Harry's lightning-bolt scar)", type: "noun", freq: 15 },
  { sp: "exactamente", en: "exactly / precisely (eso es exactamente = that is exactly it)", type: "adv", freq: 15 },
  { sp: "comer", en: "to eat (comer en el Gran Comedor = to eat in the Great Hall)", type: "verb", freq: 15 },
  { sp: "famoso", en: "famous / renowned (Lockhart es famoso = Lockhart is famous — for fabricated deeds)", type: "adj", freq: 15 },
  { sp: "oreja", en: "ear (outer ear; aguzar las orejas = to prick up one's ears)", type: "noun", freq: 15 },
  { sp: "punta", en: "tip / point / end (la punta de la varita = the tip of the wand)", type: "noun", freq: 15 },
  { sp: "piso", en: "floor / storey / flat (el primer piso = the first floor; vivir en un piso = to live in a flat)", type: "noun", freq: 15 },
  { sp: "poder", en: "power / ability; to be able to (el poder del basilisco = the basilisk's power)", type: "noun", freq: 15 },
  { sp: "fénix", en: "phoenix (Fawkes, Dumbledore's fénix — loyal, tears heal, reborn from ashes)", type: "noun", freq: 15 },
  { sp: "espada", en: "sword (la espada de Godric Gryffindor = Godric Gryffindor's sword — key plot weapon)", type: "noun", freq: 15 },
  { sp: "susurro", en: "whisper / murmur (un susurro en la pared = a whisper in the wall — the Basilisk)", type: "noun", freq: 15 },
  { sp: "ocupado", en: "busy / occupied (estar ocupado = to be busy; el baño está ocupado = the bathroom is occupied)", type: "adj", freq: 15 },
  { sp: "oscurecer", en: "to darken / to grow dark (el cielo empezó a oscurecer = the sky began to darken)", type: "verb", freq: 15 },
];

// ─── SRS ENGINE ───────────────────────────────────────────────────────────────
function initCard(card) {
  return {
    ...card,
    id: card.sp,
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
    dueDate: Date.now(),
    lapses: 0,
  };
}

function gradeCard(card, grade) {
  // grade: 0=Again, 1=Hard, 2=Good, 3=Easy
  let { interval, easeFactor, repetitions, lapses } = card;

  if (grade === 0) {
    lapses += 1;
    interval = 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    if (repetitions === 0) {
      interval = grade === 3 ? 4 : 1;
    } else if (repetitions === 1) {
      interval = grade === 3 ? 6 : 3;
    } else {
      const multiplier = grade === 1 ? 1.2 : grade === 2 ? easeFactor : easeFactor * 1.3;
      interval = Math.round(interval * multiplier);
    }
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02)));
    repetitions += 1;
  }

  const dueDate = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { ...card, interval, easeFactor, repetitions, dueDate, lapses };
}

function getDueCards(cards) {
  const now = Date.now();
  return cards.filter(c => c.dueDate <= now);
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "hp_srs_v2";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    wand: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 4l5 5-8 8-5-5 8-8zM2 22l4-4M9 3l2 2M3 9l2 2M21 12l-2 2" />
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
    book: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

// ─── TYPE BADGE ───────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const styles = {
    verb: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    noun: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    adj: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };
  const labels = { verb: "VERB", noun: "NOUN", adj: "ADJ" };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${styles[type] || styles.noun}`}>
      {labels[type] || type.toUpperCase()}
    </span>
  );
};

// ─── PROGRESS RING ────────────────────────────────────────────────────────────
const ProgressRing = ({ value, max, size = 56, stroke = 4, color = "#a78bfa" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dueList, setDueList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, again: 0, good: 0, easy: 0 });
  const [newCard, setNewCard] = useState({ sp: "", en: "", type: "noun" });
  const [filterType, setFilterType] = useState("all");
  const [toastMsg, setToastMsg] = useState("");
  const toastTimeout = useRef(null);

  // Init
  useEffect(() => {
    const saved = loadState();
    let initialCards;
    if (saved && saved.cards && saved.cards.length > 0) {
      // Merge: add any new base cards not in saved
      const savedIds = new Set(saved.cards.map(c => c.id));
      const newBaseCards = BASE_CARDS.filter(c => !savedIds.has(c.sp)).map(initCard);
      initialCards = [...saved.cards, ...newBaseCards];
    } else {
      initialCards = BASE_CARDS.map(initCard);
    }
    setCards(initialCards);
  }, []);

  // Update due list when cards change
  useEffect(() => {
    if (cards.length === 0) return;
    let filtered = filterType === "all" ? cards : cards.filter(c => c.type === filterType);
    const due = getDueCards(filtered);
    setDueList(due);
    setCurrentIndex(0);
    setFlipped(false);
  }, [cards, filterType]);

  // Save on change
  useEffect(() => {
    if (cards.length > 0) saveState({ cards });
  }, [cards]);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToastMsg(""), 2000);
  };

  const handleGrade = (grade) => {
    const card = dueList[currentIndex];
    if (!card) return;
    const updated = gradeCard(card, grade);
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      again: prev.again + (grade === 0 ? 1 : 0),
      good: prev.good + (grade === 2 ? 1 : 0),
      easy: prev.easy + (grade === 3 ? 1 : 0),
    }));
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex(i => (i + 1 < dueList.length - 1 ? i + 1 : 0));
    }, 80);
  };

  const handleAddCard = () => {
    if (!newCard.sp.trim() || !newCard.en.trim()) { showToast("Fill both fields!"); return; }
    const card = initCard({ ...newCard, freq: 0, sp: newCard.sp.trim().toLowerCase(), en: newCard.en.trim() });
    card.id = `custom_${card.sp}_${Date.now()}`;
    setCards(prev => [...prev, card]);
    setNewCard({ sp: "", en: "", type: "noun" });
    setShowModal(false);
    showToast("✨ Card added!");
  };

  const resetProgress = () => {
    const reset = cards.map(c => ({ ...c, interval: 0, easeFactor: 2.5, repetitions: 0, dueDate: Date.now(), lapses: 0 }));
    setCards(reset);
    setSessionStats({ reviewed: 0, again: 0, good: 0, easy: 0 });
    showToast("Progress reset.");
  };

  const currentCard = dueList[currentIndex];
  const totalDue = dueList.length;
  const learned = cards.filter(c => c.repetitions >= 2).length;
  const mastered = cards.filter(c => c.interval >= 21).length;

  // Stats breakdown
  const byType = {
    verb: cards.filter(c => c.type === "verb").length,
    noun: cards.filter(c => c.type === "noun").length,
    adj: cards.filter(c => c.type === "adj").length,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 40%, #0a1628 100%)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow blobs */}
      <div style={{ position: "fixed", top: "-20%", left: "-10%", width: "50vw", height: "50vw",
        background: "radial-gradient(ellipse, rgba(120,60,220,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-10%", right: "-5%", width: "40vw", height: "40vw",
        background: "radial-gradient(ellipse, rgba(30,80,200,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(167,139,250,0.95)", color: "#0a0a1a", padding: "8px 20px",
          borderRadius: 999, fontFamily: "sans-serif", fontSize: 13, fontWeight: 700,
          zIndex: 1000, boxShadow: "0 4px 24px rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
          {toastMsg}
        </div>
      )}

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 80px", position: "relative", zIndex: 1 }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}>
              <Icon name="wand" size={18} />
            </div>
            <div>
              <div style={{ color: "#e2d9f3", fontWeight: 700, fontSize: 17, letterSpacing: "0.02em" }}>HP Español</div>
              <div style={{ color: "#6b7280", fontSize: 11, fontFamily: "sans-serif", letterSpacing: "0.08em" }}>
                CÁMARA SECRETA · B2/C1
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowStats(s => !s)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "#a78bfa", padding: "6px 12px", cursor: "pointer",
                fontFamily: "sans-serif", fontSize: 12, letterSpacing: "0.05em" }}>
              {showStats ? "CARDS" : "STATS"}
            </button>
            <button onClick={() => setShowModal(true)}
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                border: "none", borderRadius: 8, color: "white", padding: "6px 12px",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>
              <Icon name="plus" size={14} /> ADD
            </button>
          </div>
        </div>

        {/* QUICK STATS ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Total", value: cards.length, color: "#e2d9f3" },
            { label: "Due", value: totalDue, color: totalDue > 0 ? "#f59e0b" : "#10b981" },
            { label: "Learned", value: learned, color: "#a78bfa" },
            { label: "Mastered", value: mastered, color: "#34d399" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ color, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>{value}</div>
              <div style={{ color: "#6b7280", fontSize: 10, fontFamily: "sans-serif",
                letterSpacing: "0.1em", marginTop: 4 }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {["all", "verb", "noun", "adj"].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              style={{ background: filterType === t ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${filterType === t ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 8, color: filterType === t ? "#c4b5fd" : "#6b7280",
                padding: "5px 12px", cursor: "pointer", fontFamily: "sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", transition: "all 0.15s" }}>
              {t.toUpperCase()} {t !== "all" ? `(${byType[t] || 0})` : ""}
            </button>
          ))}
        </div>

        {/* STATS VIEW */}
        {showStats ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 24 }}>
              <div style={{ color: "#e2d9f3", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Session Progress</div>
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <ProgressRing value={sessionStats.reviewed} max={Math.max(sessionStats.reviewed, 10)} size={64} color="#a78bfa" />
                  <div style={{ color: "#c4b5fd", fontSize: 11, fontFamily: "sans-serif",
                    marginTop: 8, letterSpacing: "0.08em" }}>REVIEWED</div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginTop: 2 }}>{sessionStats.reviewed}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <ProgressRing value={learned} max={cards.length} size={64} color="#34d399" />
                  <div style={{ color: "#6ee7b7", fontSize: 11, fontFamily: "sans-serif",
                    marginTop: 8, letterSpacing: "0.08em" }}>LEARNED</div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginTop: 2 }}>
                    {Math.round(learned / cards.length * 100)}%
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <ProgressRing value={mastered} max={cards.length} size={64} color="#f59e0b" />
                  <div style={{ color: "#fcd34d", fontSize: 11, fontFamily: "sans-serif",
                    marginTop: 8, letterSpacing: "0.08em" }}>MASTERED</div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: 18, marginTop: 2 }}>
                    {Math.round(mastered / cards.length * 100)}%
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 24 }}>
              <div style={{ color: "#e2d9f3", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Grade Breakdown</div>
              {[
                { label: "Again (failed)", val: sessionStats.again, color: "#ef4444" },
                { label: "Good", val: sessionStats.good, color: "#10b981" },
                { label: "Easy", val: sessionStats.easy, color: "#3b82f6" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ color: "#9ca3af", fontFamily: "sans-serif", fontSize: 12, width: 120 }}>{label}</div>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999 }}>
                    <div style={{ height: "100%", background: color, borderRadius: 999,
                      width: `${sessionStats.reviewed > 0 ? (val / sessionStats.reviewed * 100) : 0}%`,
                      transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ color, fontWeight: 700, fontFamily: "sans-serif", fontSize: 13, width: 28, textAlign: "right" }}>{val}</div>
                </div>
              ))}
            </div>
            <button onClick={resetProgress}
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, color: "#f87171", padding: "10px 16px", cursor: "pointer",
                fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon name="refresh" size={14} /> RESET ALL PROGRESS
            </button>
          </div>
        ) : (
          <>
            {/* FLASHCARD AREA */}
            {totalDue === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <div style={{ color: "#e2d9f3", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>All caught up!</div>
                <div style={{ color: "#6b7280", fontFamily: "sans-serif", fontSize: 13 }}>
                  No cards due right now. Come back later or add custom cards.
                </div>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 999 }}>
                    <div style={{ height: "100%", borderRadius: 999,
                      background: "linear-gradient(90deg, #7c3aed, #3b82f6)",
                      width: `${(currentIndex / Math.max(totalDue, 1)) * 100}%`,
                      transition: "width 0.3s ease" }} />
                  </div>
                  <div style={{ color: "#6b7280", fontFamily: "sans-serif", fontSize: 11,
                    letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                    {currentIndex + 1} / {totalDue}
                  </div>
                </div>

                {/* Card */}
                {currentCard && (
                  <div
                    onClick={() => setFlipped(f => !f)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                      padding: "40px 32px",
                      minHeight: 260,
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      transition: "transform 0.1s ease, box-shadow 0.2s ease",
                      boxShadow: flipped
                        ? "0 0 40px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.4)"
                        : "0 4px 20px rgba(0,0,0,0.3)",
                      backdropFilter: "blur(12px)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {/* Shimmer line */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
                      background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)" }} />

                    {/* Freq indicator */}
                    <div style={{ position: "absolute", top: 16, right: 20,
                      display: "flex", alignItems: "center", gap: 4 }}>
                      {currentCard.freq > 0 && (
                        <>
                          <Icon name="star" size={10} />
                          <span style={{ color: "#f59e0b", fontFamily: "sans-serif",
                            fontSize: 10, letterSpacing: "0.05em" }}>×{currentCard.freq}</span>
                        </>
                      )}
                      {currentCard.id && currentCard.id.startsWith("custom_") && (
                        <span style={{ color: "#6b7280", fontFamily: "sans-serif",
                          fontSize: 10, marginLeft: 4, letterSpacing: "0.08em" }}>CUSTOM</span>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                      <TypeBadge type={currentCard.type} />
                      {currentCard.lapses > 0 && (
                        <span style={{ color: "#ef4444", fontFamily: "sans-serif", fontSize: 10,
                          background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: 999,
                          border: "1px solid rgba(239,68,68,0.2)" }}>
                          {currentCard.lapses} lapse{currentCard.lapses > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Spanish word - always shown */}
                    <div style={{ textAlign: "center", marginBottom: flipped ? 24 : 0 }}>
                      <div style={{ fontSize: 44, fontWeight: 700, color: "#f3f0ff",
                        letterSpacing: "-0.02em", marginBottom: 8,
                        textShadow: "0 0 40px rgba(167,139,250,0.3)" }}>
                        {currentCard.sp}
                      </div>
                    </div>

                    {/* English translation - shown on flip */}
                    {flipped ? (
                      <div style={{ textAlign: "center", animation: "fadeIn 0.2s ease" }}>
                        <div style={{ width: "60%", height: 1, background: "rgba(255,255,255,0.1)",
                          margin: "0 auto 20px" }} />
                        <div style={{ fontSize: 20, color: "#c4b5fd", fontStyle: "italic",
                          letterSpacing: "0.01em", lineHeight: 1.5 }}>
                          {currentCard.en}
                        </div>
                        {currentCard.interval > 0 && (
                          <div style={{ marginTop: 16, color: "#4b5563", fontFamily: "sans-serif",
                            fontSize: 11, letterSpacing: "0.08em" }}>
                            NEXT REVIEW: {currentCard.interval === 1 ? "tomorrow" : `${currentCard.interval} days`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", marginTop: 16 }}>
                        <div style={{ color: "#374151", fontFamily: "sans-serif", fontSize: 12,
                          letterSpacing: "0.12em", display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 6 }}>
                          <Icon name="eye" size={13} /> TAP TO REVEAL
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Grade buttons */}
                {flipped && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
                    {[
                      { grade: 0, label: "Again", sub: "<1d", bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", color: "#f87171", hover: "rgba(239,68,68,0.25)" },
                      { grade: 1, label: "Hard", sub: "~1d", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.4)", color: "#fcd34d", hover: "rgba(245,158,11,0.25)" },
                      { grade: 2, label: "Good", sub: "~3d", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.4)", color: "#6ee7b7", hover: "rgba(16,185,129,0.25)" },
                      { grade: 3, label: "Easy", sub: "~6d", bg: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.4)", color: "#93c5fd", hover: "rgba(59,130,246,0.25)" },
                    ].map(({ grade, label, sub, bg, border, color }) => (
                      <button key={grade} onClick={() => handleGrade(grade)}
                        style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12,
                          color, padding: "12px 8px", cursor: "pointer", fontFamily: "sans-serif",
                          fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", transition: "all 0.15s",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span>{label}</span>
                        <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{sub}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ALL CARDS LIST (compact) */}
            <div style={{ marginTop: 32 }}>
              <div style={{ color: "#4b5563", fontFamily: "sans-serif", fontSize: 11,
                letterSpacing: "0.12em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="book" size={12} /> ALL CARDS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {(filterType === "all" ? cards : cards.filter(c => c.type === filterType))
                  .sort((a, b) => b.freq - a.freq)
                  .map(card => (
                  <div key={card.id} style={{ display: "flex", alignItems: "center", gap: 12,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 8, padding: "8px 12px" }}>
                    <TypeBadge type={card.type} />
                    <span style={{ color: "#e2d9f3", fontWeight: 600, fontSize: 14, minWidth: 100 }}>{card.sp}</span>
                    <span style={{ color: "#6b7280", fontSize: 12, fontFamily: "sans-serif", flex: 1,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{card.en}</span>
                    <span style={{ color: card.interval >= 21 ? "#34d399" : card.repetitions >= 2 ? "#a78bfa" : "#374151",
                      fontSize: 10, fontFamily: "sans-serif", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {card.interval >= 21 ? "✓ mastered" : card.repetitions >= 2 ? `${card.interval}d` : "new"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, backdropFilter: "blur(4px)", padding: 16 }}>
          <div style={{ background: "#0f0f2e", border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: 20, padding: 32, width: "100%", maxWidth: 420,
            boxShadow: "0 0 60px rgba(124,58,237,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ color: "#e2d9f3", fontWeight: 700, fontSize: 18 }}>Add Custom Card</div>
              <button onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}>
                <Icon name="x" size={20} />
              </button>
            </div>
            {[
              { key: "sp", label: "Spanish (base form)", placeholder: "e.g. hechizo" },
              { key: "en", label: "English translation", placeholder: "e.g. spell / charm (magic incantation)" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ color: "#9ca3af", fontFamily: "sans-serif", fontSize: 11,
                  letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>{label.toUpperCase()}</label>
                <input value={newCard[key]}
                  onChange={e => setNewCard(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                    color: "#e2d9f3", padding: "10px 14px", fontFamily: "Georgia, serif",
                    fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label style={{ color: "#9ca3af", fontFamily: "sans-serif", fontSize: 11,
                letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>TYPE</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["verb", "noun", "adj"].map(t => (
                  <button key={t} onClick={() => setNewCard(p => ({ ...p, type: t }))}
                    style={{ flex: 1, background: newCard.type === t ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${newCard.type === t ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, color: newCard.type === t ? "#c4b5fd" : "#6b7280",
                      padding: "8px", cursor: "pointer", fontFamily: "sans-serif",
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAddCard}
              style={{ width: "100%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                border: "none", borderRadius: 10, color: "white", padding: "12px",
                cursor: "pointer", fontFamily: "sans-serif", fontSize: 14,
                fontWeight: 700, letterSpacing: "0.08em" }}>
              ADD CARD ✨
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        * { -webkit-tap-highlight-color: transparent; }
        input::placeholder { color: #374151; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.3); border-radius: 999px; }
      `}</style>
    </div>
  );
}
