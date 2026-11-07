import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Índice de yodo · Método de Wijs" },
      { name: "description", content: "Simulación interactiva de la valoración yodométrica del biodiésel por el método de Wijs y calculadora del índice de yodo." },
      { property: "og:title", content: "Índice de yodo · Método de Wijs" },
      { property: "og:description", content: "Valoración, preparación y cálculo del índice de yodo del biodiésel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const n = (x: number) => x.toFixed(2).replace(".", ",");
type Kind = "sample" | "blank";
const endOf = (k: Kind) => (k === "sample" ? 1.5 : 19.5);

function Index() {
  const [tab, setTab] = useState<"valoracion" | "preparacion" | "calculo">("valoracion");
  const tabs = [
    ["valoracion", "01 \u00a0 Valoración"],
    ["preparacion", "02 \u00a0 Preparación"],
    ["calculo", "03 \u00a0 Cálculo"],
  ] as const;
  return (
    <>
      <header className="top">
        <div className="brand"><span className="mark">IQ</span><span>Laboratorio de ingeniería química</span></div>
        <small>Caracterización de biodiésel / Método de Wijs</small>
      </header>
      <main className="wrap">
        <div className="intro">
          <div>
            <div className="kicker">Determinación yodométrica · Método de Wijs</div>
            <h1>Índice de yodo</h1>
            <p className="lead">Explora la valoración del biodiésel y del blanco, comprende el punto final y relaciona los volúmenes consumidos con el grado de insaturación.</p>
          </div>
        </div>
        <nav className="tabs" aria-label="Secciones">
          {tabs.map(([id, label]) => (
            <button key={id} className="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        {tab === "valoracion" && <Titration />}
        {tab === "preparacion" && <Preparation />}
        {tab === "calculo" && <Calculator />}
      </main>
    </>
  );
}

function Titration() {
  const [kind, setKind] = useState<Kind>("sample");
  const [v, setV] = useState(0);
  const [starch, setStarch] = useState(false);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const vRef = useRef(0);
  const starchRef = useRef(false);
  vRef.current = v;
  starchRef.current = starch;

  const end = endOf(kind);
  const p = v / end;
  const pale = p >= 0.78;
  const done = p >= 1;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const cur = vRef.current;
      if (cur / end >= 0.78 && !starchRef.current) {
        setRunning(false);
        setMsg("Añade almidón antes de continuar la valoración.");
        return;
      }
      const nv = Math.min(end, cur + end / 150);
      setV(nv);
      setMsg(null);
      if (nv >= end) setRunning(false);
    }, 65);
    return () => clearInterval(t);
  }, [running, end]);

  const select = (k: Kind) => {
    setRunning(false); setKind(k); setV(0); setStarch(false); setStarted(false); setMsg(null);
  };

  const base = kind === "blank" ? [176, 58, 36] : [226, 184, 40];
  const fade = Math.min(p / 0.78, 1);
  const color = starch && pale && !done ? "#f1f1ec" : `rgb(${base.map((c) => Math.round(c + (240 - c) * fade * 0.85)).join(",")})`;
  const opacity = done ? 0.12 : starch && pale ? 0.95 - ((p - 0.78) / 0.22) * 0.75 : 0.85 - fade * 0.5;
  const state = done ? "Punto final ilustrativo · disolución transparente" : starch && pale ? "Almidón añadido · precipitado blanco turbio" : pale ? "Color muy pálido · añadir almidón" : (kind === "blank" ? "Color rojizo inicial · valorar con tiosulfato" : "Color amarillento inicial · valorar con tiosulfato");
  const hint = msg ?? (done ? "Fin ilustrativo. Anota el volumen experimental obtenido en la bureta." : !pale ? (v === 0 && !started ? "El punto final representado es orientativo; el valor experimental debe leerse en la bureta. La coloración del indicador puede no observarse." : "La animación representa un punto final orientativo; no es un resultado experimental.") : !starch ? "Añade unas gotas de almidón: se formará un precipitado blanco turbio." : "Continúa gota a gota hasta que desaparezca el precipitado blanco y la disolución quede transparente.");

  const play = () => {
    if (running) { setRunning(false); return; }
    if (v >= end) { setV(0); setStarch(false); vRef.current = 0; starchRef.current = false; }
    setStarted(true); setMsg(null); setRunning(true);
  };
  const addStarch = () => {
    if (v / end < 0.78) { setMsg("Espera a que la disolución alcance una tonalidad amarillo pálido para añadir el almidón."); return; }
    if (v >= end) { setMsg("La valoración ya ha llegado al punto final ilustrativo. Reinicia para repetirla."); return; }
    setStarch(true); setMsg(null);
  };

  return (
    <section>
      <div className="layout">
        <div className="card">
          <div className="card-head">
            <div><div className="eyebrow">Simulación de laboratorio</div><h2>Valoración yodométrica</h2></div>
            <span className="chip">{kind === "sample" ? "Muestra de biodiésel" : "Ensayo en blanco"}</span>
          </div>
          <div className="visual">
            <svg viewBox="0 0 500 390" role="img" aria-label="Bureta con tiosulfato y matraz Erlenmeyer para la valoración">
              <defs>
                <linearGradient id="glass" x1="0" x2="1"><stop stopColor="#d6eceb" stopOpacity=".25" /><stop offset=".55" stopColor="white" stopOpacity=".65" /><stop offset="1" stopColor="#bfd8d9" stopOpacity=".35" /></linearGradient>
                <clipPath id="flask"><path d="M220 222 L220 259 L166 340 Q160 351 173 353 L327 353 Q340 351 334 340 L280 259 L280 222Z" /></clipPath>
                <filter id="turbid"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="t" /><feColorMatrix in="t" type="saturate" values="0" result="g" /><feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="0" k2="1" k3="-0.25" k4="0" /></filter>
              </defs>
              <line x1="94" y1="28" x2="94" y2="352" stroke="#a7bdbc" strokeWidth="5" />
              <path d="M55 356 H180" stroke="#a7bdbc" strokeWidth="8" strokeLinecap="round" />
              <path d="M95 95 H235" stroke="#9db4b3" strokeWidth="5" />
              <rect x="238" y="20" width="24" height="143" rx="4" fill="url(#glass)" stroke="#648a91" strokeWidth="2" />
              <path d="M242 43 H258 V159 H242Z" fill="#96d2d0" fillOpacity=".6" />
              <g stroke="#6f9193" strokeWidth="1"><path d="M241 55 h10 M241 68 h6 M241 81 h10 M241 94 h6 M241 107 h10 M241 120 h6 M241 133 h10 M241 146 h6" /></g>
              <path d="M250 163 V188" stroke="#648a91" strokeWidth="4" />
              <path d="M232 170 H268" stroke="#648a91" strokeWidth="5" strokeLinecap="round" />
              <circle cx="250" cy="170" r="5" fill="#edf5f5" stroke="#648a91" strokeWidth="2" />
              <path d="M250 188 L250 199" stroke="#648a91" strokeWidth="2" />
              <path className={running ? "drop fall" : "drop"} d="M250 200 C246 205 247 209 250 209 C253 209 254 205 250 200Z" fill="#4e9b9b" />
              <path d="M220 222 L220 259 L166 340 Q160 351 173 353 L327 353 Q340 351 334 340 L280 259 L280 222" fill="url(#glass)" stroke="#71959b" strokeWidth="2.5" />
              <rect x="160" y="305" width="180" height="52" clipPath="url(#flask)" fill={color} fillOpacity={opacity} filter={starch && pale && !done ? "url(#turbid)" : undefined} />
              <path d="M215 222 H285" stroke="#71959b" strokeWidth="3" />
              <path d="M197 327 Q250 334 303 327" fill="none" stroke="#fff" strokeOpacity=".35" />
              <text x="310" y="95" fill="#6b8589" fontSize="11">Na₂S₂O₃</text>
              <text x="310" y="112" fill="#94a7a6" fontSize="10">0,4 mol/L</text>
              <text x="370" y="352" fill="#a0b2b1" fontSize="10">ESQUEMA</text>
            </svg>
          </div>
          <div className="statusbar">
            <span><i className="dot" /><span>{state}</span></span>
            <span>Punto final ilustrativo: {n(end)} mL</span>
          </div>
        </div>
        <div className="card side">
          <div className="stepnum">Control de la valoración</div>
          <h3>Observa el punto final</h3>
          <p>Selecciona el ensayo y añade tiosulfato. En amarillo pálido, incorpora el almidón y continúa gota a gota hasta la desaparición del color.</p>
          <div className="controlrow">
            <button className={kind === "sample" ? "action" : "action secondary"} onClick={() => select("sample")}>Muestra</button>
            <button className={kind === "blank" ? "action" : "action secondary"} onClick={() => select("blank")}>Blanco</button>
          </div>
          <div className="rule" />
          <div className="readout">
            <div><div className="eyebrow">Volumen añadido</div><strong>{n(v)}</strong> <small>mL</small></div>
            <small>Na₂S₂O₃ 0,4 M</small>
          </div>
          <input type="range" min={0} max={end} step={0.01} value={v} aria-label="Volumen añadido de tiosulfato"
            onChange={(e) => { setRunning(false); setStarted(true); setMsg(null); setV(Number(e.target.value)); }} />
          <div className="labels"><span>0,00 mL</span><span>{n(end)} mL</span></div>
          <div className="controlrow">
            <button className="action" onClick={play}>{running ? "Ⅱ \u00a0 Pausar" : started ? "▶ \u00a0 Continuar" : "▶ \u00a0 Iniciar"}</button>
            <button className="action secondary" onClick={addStarch}>Añadir almidón</button>
            <button className="action secondary" onClick={() => select(kind)}>Reiniciar</button>
          </div>
          <div className="notice">{hint}</div>
        </div>
      </div>
      <div className="reactions">
        <div className="reaction"><b>01 · Adición a la insaturación</b><span>−CH=CH− + ICl → −CHI−CHCl−</span></div>
        <div className="reaction"><b>02 · Liberación de yodo</b><span>ICl + KI → I₂ + KCl</span></div>
        <div className="reaction"><b>03 · Valoración</b><span>I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻</span></div>
      </div>
    </section>
  );
}

const STEPS = [
  ["Preparar las disoluciones", "Preparar 100 mL de KI al 10 % (m/v) y 100 mL de Na₂S₂O₃ 0,4 M, ambos con agua destilada."],
  ["Disolver la muestra", "Pesar 5,0 g de biodiésel y añadir 10 mL de diclorometano. Agitar suavemente hasta homogeneizar."],
  ["Añadir Wijs", "Incorporar 20 mL de reactivo de Wijs, tapar y mantener 30 minutos en oscuridad."],
  ["Liberar el yodo", "Añadir 15 mL de KI al 10 % (m/v), después 100 mL de agua destilada y agitar suavemente."],
  ["Preparar el blanco", "Repetir el mismo procedimiento y cantidades en ausencia de biodiésel, incluidos los 30 minutos en oscuridad."],
  ["Valorar ambos ensayos", "Registrar la lectura inicial y final de bureta. Al amarillo pálido añadir almidón; continuar gota a gota hasta la desaparición del color."],
];

function Preparation() {
  return (
    <section>
      <div className="steps">
        {STEPS.map(([h, p], i) => (
          <article key={h} className="card stepcard"><div className="n">{String(i + 1).padStart(2, "0")}</div><h3>{h}</h3><p>{p}</p></article>
        ))}
      </div>
      <div className="card info">
        <h3>¿Por qué se realiza un blanco?</h3>
        <p>Sin biodiésel no se consume ICl por los dobles enlaces; por ello se libera más yodo y, en condiciones comparables, el blanco requiere más tiosulfato que la muestra.</p>
      </div>
    </section>
  );
}

export function computeIodine(raw: string[]): { result: string; msg: string } {
  if (raw.some((x) => x === "")) return { result: "Introduce los datos", msg: "El cálculo se actualiza automáticamente." };
  const [b = 0, m = 0, c = 0, mass = 0] = raw.map(Number);
  if (b < 0 || m < 0 || c <= 0 || mass <= 0 || b < m)
    return { result: "Revisa los datos", msg: "Los valores deben ser positivos y el volumen del blanco no puede ser menor que el de la muestra." };
  const iy = ((b - m) * c * 12.7) / mass;
  return {
    result: n(iy) + " g I₂ / 100 g",
    msg: iy <= 120 ? "Dentro del límite de referencia (≤ 120 g I₂/100 g)." : "Por encima del límite de referencia (120 g I₂/100 g).",
  };
}

function Calculator() {
  const [vals, setVals] = useState({ vb: "", vm: "", conc: "0.4", mass: "" });
  const { result, msg } = computeIodine([vals.vb, vals.vm, vals.conc, vals.mass]);
  const field = (k: keyof typeof vals, label: React.ReactNode, ph?: string) => (
    <label>{label}<input type="number" min={0} step="any" placeholder={ph} value={vals[k]} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} /></label>
  );
  return (
    <section>
      <div>
        <div className="card calc">
          <div className="stepnum">Tratamiento de datos</div>
          <h2>Calcula el índice de yodo</h2>
          <p className="lead">Introduce los volúmenes consumidos, no las lecturas finales de la bureta, y la masa realmente pesada.</p>
          <div className="formula">IY = (V<sub>B</sub> − V<sub>M</sub>) · C · 12,7 / m</div>
          <p className="lead">Con V en mL, C en mol/L y m en g. Resultado expresado en g I₂ / 100 g de biodiésel.</p>
          <div className="fields">
            {field("vb", <>Volumen del blanco V<sub>B</sub> (mL)</>, "Ej. lectura experimental")}
            {field("vm", <>Volumen de la muestra V<sub>M</sub> (mL)</>, "Ej. lectura experimental")}
            {field("conc", "Concentración de Na₂S₂O₃ (mol/L)")}
            {field("mass", "Masa de biodiésel (g)", "Masa pesada")}
          </div>
          <p className="lead" style={{ marginTop: 20 }}><strong>{result}</strong> · {msg}</p>
        </div>
      </div>
    </section>
  );
}
