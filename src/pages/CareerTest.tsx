import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── RIASEC Data ────────────────────────────────────────────────────────────

const RIASEC_TYPES = {
  R: {
    label: "Réaliste",
    emoji: "🔧",
    color: "#e07b39",
    bg: "#fff5ee",
    border: "#e07b39",
    desc: "Vous êtes pratique, manuel(le) et aimez travailler avec des outils, des machines ou la nature. Vous préférez les tâches concrètes aux idées abstraites.",
    traits: [
      "Aptitude mécanique",
      "Coordination physique",
      "Résolution pratique",
      "Travail en extérieur ou avec des outils",
    ],
    careers: [
      "Ingénieur",
      "Électricien",
      "Pilote",
      "Charpentier",
      "Chef cuisinier",
      "Athlète",
      "Agriculteur",
      "Mécanicien",
    ],
  },
  I: {
    label: "Investigateur",
    emoji: "🔬",
    color: "#4a7fa5",
    bg: "#eef4f9",
    border: "#4a7fa5",
    desc: "Vous êtes analytique, curieux(se) et aimez explorer les idées. Vous appréciez la recherche, l'enquête scientifique et les défis intellectuels.",
    traits: [
      "Pensée analytique",
      "Curiosité scientifique",
      "Recherche indépendante",
      "Résolution de problèmes",
    ],
    careers: [
      "Scientifique",
      "Médecin",
      "Chercheur",
      "Analyste de données",
      "Psychologue",
      "Développeur logiciel",
      "Économiste",
    ],
  },
  A: {
    label: "Artistique",
    emoji: "🎨",
    color: "#9b59b6",
    bg: "#f5eefb",
    border: "#9b59b6",
    desc: "Vous êtes créatif(ve), expressif(ve) et original(e). Vous vous épanouissez dans des environnements non structurés où l'imagination est valorisée.",
    traits: [
      "Créativité",
      "Communication expressive",
      "Sensibilité esthétique",
      "Originalité",
    ],
    careers: [
      "Designer",
      "Musicien",
      "Écrivain",
      "Acteur",
      "Photographe",
      "Architecte",
      "Directeur artistique",
    ],
  },
  S: {
    label: "Social",
    emoji: "🤝",
    color: "#27ae60",
    bg: "#edfaf1",
    border: "#27ae60",
    desc: "Vous êtes empathique, serviable et aimez travailler avec les autres. Vous êtes attiré(e) par l'enseignement, le conseil et le service communautaire.",
    traits: [
      "Empathie",
      "Communication",
      "Travail en équipe",
      "Enseignement & coaching",
    ],
    careers: [
      "Enseignant",
      "Conseiller",
      "Infirmier",
      "Travailleur social",
      "Responsable RH",
      "Thérapeute",
      "Coach",
    ],
  },
  E: {
    label: "Entrepreneur",
    emoji: "🚀",
    color: "#c0392b",
    bg: "#fdf0ee",
    border: "#c0392b",
    desc: "Vous êtes ambitieux(se), persuasif(ve) et énergique. Vous aimez diriger, convaincre et atteindre des objectifs.",
    traits: [
      "Leadership",
      "Persuasion",
      "Esprit entrepreneurial",
      "Prise de décision",
    ],
    careers: [
      "Manager",
      "Avocat",
      "Entrepreneur",
      "Directeur commercial",
      "Politicien",
      "Directeur marketing",
      "PDG",
    ],
  },
  C: {
    label: "Conventionnel",
    emoji: "📊",
    color: "#2c3e50",
    bg: "#eef0f3",
    border: "#2c3e50",
    desc: "Vous êtes organisé(e), attentif(ve) aux détails et fiable. Vous excellez dans les tâches structurées et le respect de procédures claires.",
    traits: [
      "Organisation",
      "Attention aux détails",
      "Fiabilité",
      "Gestion des données",
    ],
    careers: [
      "Comptable",
      "Analyste financier",
      "Administrateur",
      "Guichetier bancaire",
      "Auditeur",
      "Chef de projet",
      "Coordinateur logistique",
    ],
  },
};

type RiasecKey = keyof typeof RIASEC_TYPES;

const QUESTIONS: { id: number; text: string; type: RiasecKey }[] = [
  // Réaliste
  {
    id: 1,
    text: "J'aime construire ou réparer des choses de mes mains.",
    type: "R",
  },
  {
    id: 2,
    text: "J'aime travailler avec des machines, des outils ou des équipements.",
    type: "R",
  },
  {
    id: 3,
    text: "Je préfère le travail en extérieur ou physique aux postes de bureau.",
    type: "R",
  },
  {
    id: 4,
    text: "J'aime des activités comme la menuiserie, la cuisine ou l'électronique.",
    type: "R",
  },
  {
    id: 5,
    text: "J'aime les tâches qui produisent un résultat tangible et concret.",
    type: "R",
  },
  {
    id: 6,
    text: "Je trouve les problèmes pratiques et mécaniques plus satisfaisants que les abstraits.",
    type: "R",
  },
  // Investigateur
  {
    id: 7,
    text: "J'aime résoudre des problèmes intellectuels complexes.",
    type: "I",
  },
  {
    id: 8,
    text: "J'aime lire des articles scientifiques ou des livres pour apprendre de nouvelles choses.",
    type: "I",
  },
  {
    id: 9,
    text: "J'aime mener des expériences ou analyser des données.",
    type: "I",
  },
  {
    id: 10,
    text: "Je préfère comprendre pourquoi les choses fonctionnent comme elles le font.",
    type: "I",
  },
  {
    id: 11,
    text: "J'aime la recherche et l'enquête intellectuelle indépendante.",
    type: "I",
  },
  {
    id: 12,
    text: "Je suis curieux(se) du fonctionnement du monde naturel ou social.",
    type: "I",
  },
  // Artistique
  {
    id: 13,
    text: "J'aime m'exprimer à travers l'art, l'écriture ou la musique.",
    type: "A",
  },
  {
    id: 14,
    text: "J'aime avoir la liberté d'être créatif(ve) et original(e).",
    type: "A",
  },
  {
    id: 15,
    text: "Je préfère les environnements non structurés où je peux innover.",
    type: "A",
  },
  {
    id: 16,
    text: "Je suis attiré(e) par le design, l'esthétique et les domaines créatifs.",
    type: "A",
  },
  {
    id: 17,
    text: "J'aime raconter des histoires, jouer la comédie ou me produire en spectacle.",
    type: "A",
  },
  {
    id: 18,
    text: "Je trouve l'inspiration dans l'art, la culture et les œuvres créatives.",
    type: "A",
  },
  // Social
  { id: 19, text: "J'aime aider, enseigner ou guider les autres.", type: "S" },
  {
    id: 20,
    text: "Je me sens dynamisé(e) quand je travaille avec d'autres vers un objectif commun.",
    type: "S",
  },
  {
    id: 21,
    text: "Je suis empathique et sensible aux besoins des autres.",
    type: "S",
  },
  {
    id: 22,
    text: "Je trouve satisfaction à soutenir les personnes face aux difficultés.",
    type: "S",
  },
  {
    id: 23,
    text: "J'aime le travail communautaire, le bénévolat ou le militantisme social.",
    type: "S",
  },
  {
    id: 24,
    text: "Je communique bien et j'apprécie les relations interpersonnelles.",
    type: "S",
  },
  // Entrepreneur
  { id: 25, text: "J'aime diriger, gérer ou motiver les autres.", type: "E" },
  {
    id: 26,
    text: "J'aime prendre des initiatives et faire avancer les projets.",
    type: "E",
  },
  {
    id: 27,
    text: "Je suis persuasif(ve) et confiant(e) lorsque je présente des idées.",
    type: "E",
  },
  {
    id: 28,
    text: "Je m'épanouis dans des environnements compétitifs à forts enjeux.",
    type: "E",
  },
  {
    id: 29,
    text: "J'aime négocier, vendre ou influencer les décisions.",
    type: "E",
  },
  {
    id: 30,
    text: "Je suis ambitieux(se) et me fixe des objectifs élevés.",
    type: "E",
  },
  // Conventionnel
  {
    id: 31,
    text: "J'aime suivre des instructions claires et des procédures établies.",
    type: "C",
  },
  {
    id: 32,
    text: "J'aime organiser des données, des fichiers ou des plannings.",
    type: "C",
  },
  {
    id: 33,
    text: "Je suis attentif(ve) aux détails et je fais rarement des erreurs d'inattention.",
    type: "C",
  },
  {
    id: 34,
    text: "Je me sens à l'aise avec les routines et les environnements structurés.",
    type: "C",
  },
  {
    id: 35,
    text: "J'aime les tâches administratives, la comptabilité ou la tenue de registres.",
    type: "C",
  },
  {
    id: 36,
    text: "Je préfère des attentes claires aux missions ouvertes.",
    type: "C",
  },
];

const SCALE = [
  { value: 1, label: "Pas du tout d'accord" },
  { value: 2, label: "Pas d'accord" },
  { value: 3, label: "Neutre" },
  { value: 4, label: "D'accord" },
  { value: 5, label: "Tout à fait d'accord" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeScores(
  answers: Record<number, number>,
): Record<RiasecKey, number> {
  const scores: Record<RiasecKey, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  };
  QUESTIONS.forEach((q) => {
    scores[q.type] += answers[q.id] ?? 0;
  });
  return scores;
}

function getRanked(
  scores: Record<RiasecKey, number>,
): { key: RiasecKey; score: number }[] {
  return (Object.entries(scores) as [RiasecKey, number][])
    .map(([key, score]) => ({ key, score }))
    .sort((a, b) => b.score - a.score);
}

// ─── Gemini Narrative ────────────────────────────────────────────────────────

async function generateNarrative(
  scores: Record<RiasecKey, number>,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Clé API manquante");
  }

  const ranked = getRanked(scores);
  const top3 = ranked.slice(0, 3);
  const profileCode = top3.map((r) => r.key).join("");

  const profileDetails = top3
    .map((r, i) => {
      const t = RIASEC_TYPES[r.key];
      return `${i + 1}. ${t.label} (score : ${r.score}/30) — ${t.desc}`;
    })
    .join("\n");

  const allScores = ranked
    .map((r) => `- ${RIASEC_TYPES[r.key].label} : ${r.score}/30`)
    .join("\n");

  const prompt = `Tu es un conseiller d'orientation professionnelle expert et bienveillant. Un utilisateur vient de compléter le test RIASEC. Voici ses résultats :

Profil RIASEC : ${profileCode}

Top 3 types :
${profileDetails}

Tous les scores :
${allScores}

Rédige une analyse personnalisée, narrative et encourageante de 4 paragraphes en français qui :
1. Ouvre en décrivant la personnalité unique de cet individu en combinant ses types dominants, avec chaleur et précision
2. Explique comment ces traits se complètent pour former une identité professionnelle cohérente et des forces distinctives
3. Suggère des environnements de travail idéaux et des types de carrières concrets qui correspondent à ce profil unique
4. Conclut avec un message motivant, personnel et inspirant pour guider la personne dans sa trajectoire professionnelle

Consignes de style :
- Utilise "vous" pour t'adresser à l'utilisateur
- Ton chaleureux, inspirant et professionnel
- Évite les listes à puces, écris uniquement en prose narrative
- Chaque paragraphe doit faire 3-4 phrases`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── PDF Export ──────────────────────────────────────────────────────────────

function exportToPDF(resultRef: React.RefObject<HTMLDivElement>) {
  const el = resultRef.current;
  if (!el) return;
  const printContents = el.innerHTML;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Profil de Carrière RIASEC</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; background: #fafaf8; color: #1a1a2e; padding: 40px; }
          h1,h2,h3 { font-family: 'Lora', serif; }
          .pdf-header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #e5e5e5; padding-bottom: 24px; }
          .pdf-header h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 8px; }
          .pdf-header p { color: #666; font-size: 14px; }
          .top3 { display: flex; gap: 16px; margin-bottom: 32px; }
          .type-card { flex: 1; border-radius: 12px; padding: 20px; border: 2px solid #e5e5e5; }
          .type-card h3 { font-size: 16px; margin-bottom: 4px; }
          .type-card .score { font-size: 24px; font-weight: 700; }
          .bar-section { margin-bottom: 32px; }
          .bar-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
          .bar-label { width: 120px; font-size: 13px; font-weight: 600; }
          .bar-track { flex: 1; height: 14px; background: #e5e5e5; border-radius: 8px; overflow: hidden; }
          .bar-fill { height: 100%; border-radius: 8px; }
          .bar-val { width: 32px; font-size: 13px; font-weight: 700; text-align: right; }
          .detail-section { margin-bottom: 24px; padding: 20px; border-radius: 12px; border: 1px solid #e5e5e5; }
          .detail-section h2 { font-size: 18px; margin-bottom: 8px; }
          .detail-section p { font-size: 13px; line-height: 1.6; color: #444; margin-bottom: 12px; }
          .tags { display: flex; flex-wrap: wrap; gap: 8px; }
          .tag { background: #f0f0f0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 500; }
          .narrative-section { margin-bottom: 32px; padding: 28px; border-radius: 16px; background: linear-gradient(135deg,#f5f3ff,#fdf4ff); border: 1px solid #e9d5ff; }
          .narrative-section h2 { font-size: 20px; color: #4c1d95; margin-bottom: 16px; }
          .narrative-section p { font-size: 14px; line-height: 1.8; color: #374151; margin-bottom: 12px; }
          .footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 40px; }
        </style>
      </head>
      <body>
        ${printContents}
        <p class="footer">Généré par le Test de Carrière RIASEC · ${new Date().toLocaleDateString("fr-FR")}</p>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 600);
}

// ─── Components ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#888",
          marginBottom: 6,
        }}
      >
        <span>
          Question {current} sur {total}
        </span>
        <span>{pct}% complété</span>
      </div>
      <div
        style={{
          height: 6,
          background: "#e8e8e8",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg,#6c63ff,#a78bfa)",
            borderRadius: 8,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  value,
  onChange,
  index,
  total,
}: {
  question: (typeof QUESTIONS)[0];
  value: number | undefined;
  onChange: (v: number) => void;
  index: number;
  total: number;
}) {
  const type = RIASEC_TYPES[question.type];
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: "32px 36px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
        border: "1px solid #f0eff9",
      }}
    >
      <ProgressBar current={index + 1} total={total} />
      <div style={{ marginTop: 24, marginBottom: 28 }}>
        <div
          style={{
            display: "inline-block",
            background: type.bg,
            color: type.color,
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 14,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {type.emoji} {type.label}
        </div>
        <p
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1a1a2e",
            lineHeight: 1.5,
            fontFamily: "Lora, serif",
          }}
        >
          {question.text}
        </p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {SCALE.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            style={{
              flex: "1 1 0",
              minWidth: 80,
              padding: "14px 8px",
              borderRadius: 14,
              border:
                value === s.value
                  ? `2px solid ${type.color}`
                  : "2px solid #e8e8e8",
              background: value === s.value ? type.bg : "#fafaf8",
              color: value === s.value ? type.color : "#555",
              fontWeight: value === s.value ? 700 : 500,
              cursor: "pointer",
              fontSize: 13,
              transition: "all 0.2s ease",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>
              {["😕", "🙁", "😐", "🙂", "😊"][s.value - 1]}
            </div>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function NarrativeCard({
  narrative,
  loading,
  error,
}: {
  narrative: string;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div
      className="narrative-section"
      style={{
        background: "linear-gradient(135deg,#f5f3ff 0%,#fdf4ff 100%)",
        border: "1px solid #e9d5ff",
        borderRadius: 20,
        padding: "32px 36px",
        marginBottom: 24,
        boxShadow: "0 4px 24px rgba(139,92,246,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 24 }}>✨</div>
        <h2
          style={{
            fontFamily: "Lora, serif",
            fontSize: 20,
            color: "#4c1d95",
            margin: 0,
          }}
        >
          Votre Analyse Personnalisée
        </h2>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1,
            color: "#7c3aed",
            background: "#ede9fe",
            borderRadius: 20,
            padding: "3px 10px",
          }}
        >
          IA · Gemini
        </div>
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            padding: "24px 0",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#7c3aed",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <p
            style={{
              fontSize: 14,
              color: "#7c3aed",
              fontFamily: "DM Sans, sans-serif",
              margin: 0,
            }}
          >
            J'analyse votre profil…
          </p>
          <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-10px)} }`}</style>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "16px 20px",
            color: "#dc2626",
            fontSize: 14,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          Impossible de générer l'analyse : <strong>{error}</strong>. Vérifiez
          votre clé API dans le fichier{" "}
          <code
            style={{
              background: "#fee2e2",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            .env.local
          </code>
          .
        </div>
      )}

      {!loading && !error && narrative && (
        <div>
          {narrative
            .split("\n\n")
            .filter(Boolean)
            .map((para, i) => (
              <p
                key={i}
                style={{
                  fontSize: 15,
                  lineHeight: 1.85,
                  color: "#374151",
                  fontFamily: "DM Sans, sans-serif",
                  marginBottom: i < narrative.split("\n\n").length - 1 ? 16 : 0,
                }}
              >
                {para.replace(/\*\*/g, "")}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

function ResultView({
  scores,
  onRetake,
  resultRef,
  narrative,
  narrativeLoading,
  narrativeError,
}: {
  scores: Record<RiasecKey, number>;
  onRetake: () => void;
  resultRef: React.RefObject<HTMLDivElement>;
  narrative: string;
  narrativeLoading: boolean;
  narrativeError: string | null;
}) {
  const ranked = getRanked(scores);
  const top3 = ranked.slice(0, 3);
  const maxScore = 30;
  const profileCode = top3.map((r) => r.key).join("");

  return (
    <div>
      {/* Barre d'actions */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onRetake}
          style={{
            padding: "10px 22px",
            borderRadius: 12,
            border: "2px solid #e8e8e8",
            background: "#fff",
            color: "#555",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 14,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          ↺ Recommencer le Test
        </button>
        <button
          onClick={() => exportToPDF(resultRef)}
          style={{
            padding: "10px 22px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#6c63ff,#a78bfa)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
            boxShadow: "0 4px 16px rgba(108,99,255,0.3)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          ⬇ Exporter en PDF
        </button>
      </div>

      {/* Contenu imprimable */}
      <div ref={resultRef}>
        {/* En-tête PDF */}
        <div className="pdf-header" style={{ display: "none" }}>
          <h1>Profil de Carrière RIASEC</h1>
          <p>Votre évaluation personnalisée de personnalité professionnelle</p>
        </div>

        {/* Carte principale */}
        <div
          style={{
            background: "linear-gradient(135deg,#1a1a2e 0%,#2d2b55 100%)",
            borderRadius: 24,
            padding: "36px 40px",
            marginBottom: 24,
            color: "#fff",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              opacity: 0.6,
              marginBottom: 8,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            VOTRE PROFIL RIASEC
          </p>
          <h1
            style={{
              fontFamily: "Lora, serif",
              fontSize: 44,
              letterSpacing: 6,
              marginBottom: 12,
              background: "linear-gradient(90deg,#a78bfa,#67e8f9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {profileCode}
          </h1>
          <p
            style={{
              fontSize: 15,
              opacity: 0.8,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            {top3.map((r) => RIASEC_TYPES[r.key].label).join(" · ")}
          </p>
        </div>

        {/* Analyse IA */}
        <NarrativeCard
          narrative={narrative}
          loading={narrativeLoading}
          error={narrativeError}
        />

        {/* Top 3 cartes */}
        <div
          className="top3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {top3.map((r, i) => {
            const t = RIASEC_TYPES[r.key];
            return (
              <div
                key={r.key}
                className="type-card"
                style={{
                  background: t.bg,
                  border: `2px solid ${t.border}`,
                  borderRadius: 18,
                  padding: "22px 20px",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{t.emoji}</div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    color: t.color,
                    marginBottom: 2,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  #{i + 1} CORRESPONDANCE
                </div>
                <h3
                  style={{
                    fontFamily: "Lora, serif",
                    fontSize: 17,
                    color: "#1a1a2e",
                    marginBottom: 4,
                  }}
                >
                  {t.label}
                </h3>
                <div
                  className="score"
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: t.color,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {r.score}
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: "#888" }}
                  >
                    /{maxScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Graphique de tous les scores */}
        <div
          className="bar-section"
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "28px 32px",
            marginBottom: 24,
            border: "1px solid #f0eff9",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              fontFamily: "Lora, serif",
              fontSize: 20,
              marginBottom: 20,
              color: "#1a1a2e",
            }}
          >
            Analyse Complète du Profil
          </h2>
          {ranked.map((r) => {
            const t = RIASEC_TYPES[r.key];
            const pct = Math.round((r.score / maxScore) * 100);
            return (
              <div
                key={r.key}
                className="bar-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 14,
                  gap: 12,
                }}
              >
                <div
                  className="bar-label"
                  style={{
                    width: 130,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1a1a2e",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  {t.emoji} {t.label}
                </div>
                <div
                  className="bar-track"
                  style={{
                    flex: 1,
                    height: 14,
                    background: "#f0eff9",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="bar-fill"
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: t.color,
                      borderRadius: 8,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
                <div
                  className="bar-val"
                  style={{
                    width: 36,
                    fontWeight: 800,
                    fontSize: 14,
                    color: t.color,
                    fontFamily: "DM Sans, sans-serif",
                    textAlign: "right",
                  }}
                >
                  {r.score}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cartes de détail Top 3 */}
        {top3.map((r) => {
          const t = RIASEC_TYPES[r.key];
          return (
            <div
              key={r.key}
              className="detail-section"
              style={{
                background: "#fff",
                border: `1px solid ${t.border}30`,
                borderLeft: `4px solid ${t.color}`,
                borderRadius: 16,
                padding: "24px 28px",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "Lora, serif",
                  fontSize: 19,
                  color: "#1a1a2e",
                  marginBottom: 10,
                }}
              >
                {t.emoji} Type {t.label}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.7,
                  marginBottom: 14,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {t.desc}
              </p>
              <div style={{ marginBottom: 14 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "#888",
                    marginBottom: 8,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  POINTS FORTS CLÉS
                </p>
                <div
                  className="tags"
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                >
                  {t.traits.map((tr) => (
                    <span
                      key={tr}
                      className="tag"
                      style={{
                        background: t.bg,
                        color: t.color,
                        border: `1px solid ${t.color}40`,
                        borderRadius: 20,
                        padding: "5px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {tr}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "#888",
                    marginBottom: 8,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  CARRIÈRES SUGGÉRÉES
                </p>
                <div
                  className="tags"
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                >
                  {t.careers.map((c) => (
                    <span
                      key={c}
                      className="tag"
                      style={{
                        background: "#f8f8f8",
                        color: "#444",
                        border: "1px solid #e8e8e8",
                        borderRadius: 20,
                        padding: "5px 14px",
                        fontSize: 12,
                        fontWeight: 500,
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function CareerTest() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [narrative, setNarrative] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const currentQ = QUESTIONS[currentIdx];
  const answered = Object.keys(answers).length;
  const total = QUESTIONS.length;
  const currentAnswer = answers[currentQ?.id];
  const scores = computeScores(answers);

  useEffect(() => {
    if (!submitted) return;
    setNarrativeLoading(true);
    setNarrativeError(null);
    setNarrative("");
    generateNarrative(scores)
      .then((text) => setNarrative(text))
      .catch((err: unknown) =>
        setNarrativeError(
          err instanceof Error ? err.message : "Erreur inconnue",
        ),
      )
      .finally(() => setNarrativeLoading(false));
  }, [submitted]);

  const handleAnswer = (v: number) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: v }));
  };

  const handleNext = () => {
    if (currentIdx < total - 1) setCurrentIdx((i) => i + 1);
    else setSubmitted(true);
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setNarrative("");
    setNarrativeError(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f8f7ff",
        fontFamily: "DM Sans, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div style={{ width: "100%", padding: "40px", boxSizing: "border-box" }}>
        {/* En-tête */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(135deg,#6c63ff20,#a78bfa20)",
              border: "1px solid #a78bfa50",
              borderRadius: 30,
              padding: "6px 18px",
              fontSize: 12,
              fontWeight: 700,
              color: "#6c63ff",
              letterSpacing: 1.5,
              marginBottom: 16,
            }}
          >
            ÉVALUATION DE PERSONNALITÉ PROFESSIONNELLE
          </div>
          <h1
            style={{
              fontFamily: "Lora, serif",
              fontSize: 36,
              color: "#1a1a2e",
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            Découvrez Votre Profil RIASEC
          </h1>
          <p
            style={{
              color: "#777",
              fontSize: 15,
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            36 questions · ~5 minutes · Basé sur la typologie professionnelle de
            Holland
          </p>
        </div>

        {!submitted ? (
          <>
            <QuestionCard
              question={currentQ}
              value={currentAnswer}
              onChange={handleAnswer}
              index={currentIdx}
              total={total}
            />

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                style={{
                  padding: "12px 28px",
                  borderRadius: 14,
                  border: "2px solid #e8e8e8",
                  background: "#fff",
                  color: currentIdx === 0 ? "#ccc" : "#555",
                  fontWeight: 600,
                  cursor: currentIdx === 0 ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                ← Retour
              </button>

              <span style={{ fontSize: 13, color: "#aaa" }}>
                {answered} / {total} répondues
              </span>

              <button
                onClick={handleNext}
                disabled={currentAnswer === undefined}
                style={{
                  padding: "12px 32px",
                  borderRadius: 14,
                  border: "none",
                  background:
                    currentAnswer === undefined
                      ? "#e8e8e8"
                      : "linear-gradient(135deg,#6c63ff,#a78bfa)",
                  color: currentAnswer === undefined ? "#aaa" : "#fff",
                  fontWeight: 700,
                  cursor:
                    currentAnswer === undefined ? "not-allowed" : "pointer",
                  fontSize: 14,
                  boxShadow:
                    currentAnswer !== undefined
                      ? "0 4px 20px rgba(108,99,255,0.35)"
                      : "none",
                  transition: "all 0.2s ease",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {currentIdx === total - 1
                  ? "Voir les Résultats ✨"
                  : "Suivant →"}
              </button>
            </div>

            {/* Points de navigation rapide */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 6,
                marginTop: 28,
                flexWrap: "wrap",
              }}
            >
              {QUESTIONS.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  title={`Q${i + 1}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    background:
                      i === currentIdx
                        ? "#6c63ff"
                        : answers[q.id]
                          ? "#a78bfa80"
                          : "#e0e0e0",
                    transition: "background 0.2s",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <ResultView
            scores={scores}
            onRetake={handleRetake}
            resultRef={resultRef}
            narrative={narrative}
            narrativeLoading={narrativeLoading}
            narrativeError={narrativeError}
          />
        )}
      </div>
    </div>
  );
}
