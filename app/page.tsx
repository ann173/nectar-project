"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Evidence = {
  title: string;
  type:
    | "direct evidence"
    | "documented precedent"
    | "reasonable inference"
    | "research gap";
  confidence: "high" | "medium" | "speculative" | "unknown";
  description: string;
  url?: string;
  visualNote?: string;
};

type SourceNode = {
  name: string;
  evidence: Evidence[];
};

const categories = [
  "Race",
  "Religion",
  "Sexual orientation",
  "Political beliefs",
  "Health",
  "Trade union membership",
  "Biometrics",
  "Location",
  "Relationships",
];

const sourceMap: Record<string, SourceNode[]> = {
  "Sexual orientation": [
    {
      name: "Dating apps",
      evidence: [
        {
          title: "Dating-app data as surveillance precedent",
          type: "documented precedent",
          confidence: "medium",
          description:
            "Dating apps are not proven Nectar sources here, but they are a strong precedent for how intimate, sexual and location data can become available to data brokers, authorities or investigative systems.",
          url: "https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-prohibits-data-broker-outlogic-formerly-x-mode-social-selling-sensitive-location-data",
          visualNote: "Hairline crack: intimate data leaking outward.",
        },
        {
          title: "Research gap: UK policing equivalent?",
          type: "research gap",
          confidence: "unknown",
          description:
            "Find UK-specific evidence of dating-app, location-app or brokered intimate metadata being used by policing, immigration or intelligence bodies.",
          visualNote: "Unstable dotted edge rather than solid line.",
        },
      ],
    },
    {
      name: "Metadata inference",
      evidence: [
        {
          title: "Sensitive information can be inferred rather than declared",
          type: "reasonable inference",
          confidence: "medium",
          description:
            "Sexuality, relationships and intimate life may be inferred through co-location, communication patterns, relationship metadata, social graph analysis or repeated contact events.",
          visualNote: "Ghost node: visible only after interaction.",
        },
      ],
    },
    {
      name: "Domestic incident reports",
      evidence: [
        {
          title:
            "Nectar pilot framed through Clare's Law domestic abuse checks",
          type: "direct evidence",
          confidence: "high",
          description:
            "Public reporting and police-facing explanations describe Nectar as a system piloted around domestic abuse data-sharing and Clare's Law/right-to-know processes.",
          url: "https://www.beds.police.uk/police-forces/bedfordshire-police/areas/about-us/about-us/the-way-we-use-tech/Nectar/",
          visualNote: "Solid line from relationships to police records.",
        },
      ],
    },
    {
      name: "Social graph analysis",
      evidence: [
        {
          title:
            "Palantir systems are designed to connect entities, relationships and records",
          type: "documented precedent",
          confidence: "medium",
          description:
            "This does not prove Nectar performs social graph analysis in a specific way, but Palantir's broader products are built around linking records, entities and relationships across datasets.",
          url: "https://www.palantir.com/platforms/gotham/",
          visualNote: "Branching crack: relations become infrastructure.",
        },
      ],
    },
  ],
  Race: [
    {
      name: "Police records",
      evidence: [
        {
          title: "Special category data includes race and ethnic origin",
          type: "direct evidence",
          confidence: "high",
          description:
            "The Nectar controversy centres on a police data platform said to process special category data, including race and ethnic origin. This should be cited alongside the underlying FOI/DPIA materials where available.",
          url: "https://libertyinvestigates.org.uk/articles/uk-police-working-with-controversial-tech-giant-palantir-on-real-time-surveillance-network/",
          visualNote: "Solid node: explicitly named sensitive category.",
        },
      ],
    },
    {
      name: "Facial recognition",
      evidence: [
        {
          title: "Clearview AI scraped facial images and was fined by the UK ICO",
          type: "documented precedent",
          confidence: "high",
          description:
            "Clearview AI provides a precedent for biometric infrastructures built from scraped public images and used in policing contexts.",
          url: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2022/05/ico-fines-facial-recognition-database-company-clearview-ai-inc/",
          visualNote: "Sharp crack: face becomes searchable record.",
        },
      ],
    },
  ],
  Religion: [
    {
      name: "Prevent referrals",
      evidence: [
        {
          title: "Prevent as counterterror safeguarding infrastructure",
          type: "documented precedent",
          confidence: "high",
          description:
            "Prevent is a UK counterterrorism safeguarding programme. It is not proven as a Nectar source here, but it is an important adjacent infrastructure for thinking about religion, suspicion and state data-sharing.",
          url: "https://www.gov.uk/government/publications/prevent-duty-guidance",
          visualNote:
            "Slow spreading crack: safeguarding becomes surveillance.",
        },
      ],
    },
    {
      name: "Community reports",
      evidence: [
        {
          title: "Research gap: local referral pathways",
          type: "research gap",
          confidence: "unknown",
          description:
            "Investigate whether local safeguarding, counterterror or community safety databases interact with police records in the Nectar pilot forces.",
          visualNote: "Question-mark node.",
        },
      ],
    },
  ],
  "Political beliefs": [
    {
      name: "Intelligence files",
      evidence: [
        {
          title: "Political opinions are a special category data field",
          type: "direct evidence",
          confidence: "high",
          description:
            "Political opinions are treated as special category data under UK data-protection law and have been reported in relation to Nectar's potential processing categories.",
          url: "https://www.legislation.gov.uk/ukpga/2018/12/section/10",
          visualNote: "Solid sensitive-category node.",
        },
      ],
    },
    {
      name: "Protest policing",
      evidence: [
        {
          title: "Research gap: protest intelligence and Nectar",
          type: "research gap",
          confidence: "unknown",
          description:
            "Look for FOI material on protest intelligence databases, watchlists, public order policing and whether such systems are available to Nectar-linked forces.",
          visualNote: "Crack does not close: evidence withheld or missing.",
        },
      ],
    },
  ],
  Health: [
    {
      name: "NHS systems",
      evidence: [
        {
          title: "Palantir NHS Federated Data Platform contract",
          type: "documented precedent",
          confidence: "high",
          description:
            "This is not Nectar-specific, but it matters as an overlapping Palantir public-sector infrastructure involving health data and public procurement.",
          url: "https://www.england.nhs.uk/long-read/nhs-federated-data-platform/",
          visualNote: "Outer-ring infrastructure node.",
        },
      ],
    },
    {
      name: "Crisis callouts",
      evidence: [
        {
          title: "Health, vulnerability and policing overlap",
          type: "reasonable inference",
          confidence: "medium",
          description:
            "Police records may include mental health crisis callouts, vulnerability flags and safeguarding notes. The exact Nectar access route needs further source work.",
          visualNote: "Soft crack: care pathway becomes police record.",
        },
      ],
    },
  ],
  "Trade union membership": [
    {
      name: "Employment records",
      evidence: [
        {
          title: "Trade union membership is special category data",
          type: "direct evidence",
          confidence: "high",
          description:
            "Trade union membership is special category data under UK data protection law. Whether Nectar can access specific employment-related sources remains a research question.",
          url: "https://www.legislation.gov.uk/ukpga/2018/12/section/10",
          visualNote: "Labelled but partially transparent node.",
        },
      ],
    },
    {
      name: "Strike policing",
      evidence: [
        {
          title: "Research gap: labour protest and police intelligence",
          type: "research gap",
          confidence: "unknown",
          description:
            "Find evidence on public order policing, strike monitoring, labour activism databases or information-sharing between employers and police.",
          visualNote: "Unfinished crack line.",
        },
      ],
    },
  ],
  Biometrics: [
    {
      name: "Facial recognition",
      evidence: [
        {
          title: "Live facial recognition in UK policing",
          type: "documented precedent",
          confidence: "high",
          description:
            "UK policing has used live facial recognition, and its expansion is part of the wider biometric policing context in which Nectar sits.",
          url: "https://www.met.police.uk/advice/advice-and-information/facial-recognition/live-facial-recognition/",
          visualNote: "Face-frame node.",
        },
      ],
    },
    {
      name: "Clearview precedent",
      evidence: [
        {
          title: "ICO enforcement against Clearview AI",
          type: "documented precedent",
          confidence: "high",
          description:
            "Clearview AI was ordered by the ICO to delete UK residents' data after scraping images from the web for facial-recognition purposes.",
          url: "https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2022/05/ico-fines-facial-recognition-database-company-clearview-ai-inc/",
          visualNote: "Scraped image node.",
        },
      ],
    },
  ],
  Location: [
    {
      name: "Traffic cameras / ANPR",
      evidence: [
        {
          title: "ANPR is a national policing data infrastructure",
          type: "documented precedent",
          confidence: "high",
          description:
            "Automatic Number Plate Recognition is a major UK policing data infrastructure. Whether specific ANPR streams feed into Nectar needs direct FOI/procurement confirmation.",
          url: "https://www.gov.uk/government/publications/automatic-number-plate-recognition-anpr-governance-and-compliance/automatic-number-plate-recognition-anpr-governance-and-compliance-accessible",
          visualNote: "Road-crack line; camera node.",
        },
      ],
    },
    {
      name: "Mobile metadata",
      evidence: [
        {
          title: "Research gap: mobile metadata and Nectar",
          type: "research gap",
          confidence: "unknown",
          description:
            "Investigate whether telecoms, mobile-location metadata, data brokers or device identifiers are present in any Nectar-related data-sharing agreement.",
          visualNote: "Dotted moving node.",
        },
      ],
    },
  ],
  Relationships: [
    {
      name: "Clare's Law",
      evidence: [
        {
          title: "Nectar framed around domestic abuse disclosure processes",
          type: "direct evidence",
          confidence: "high",
          description:
            "Bedfordshire Police describes Nectar in the context of improving access to information relevant to domestic abuse and Clare's Law-style safeguarding work.",
          url: "https://www.beds.police.uk/police-forces/bedfordshire-police/areas/about-us/about-us/the-way-we-use-tech/Nectar/",
          visualNote: "Care interface node.",
        },
      ],
    },
    {
      name: "Housing records",
      evidence: [
        {
          title: "Research gap: housing, refuge and local authority data",
          type: "research gap",
          confidence: "unknown",
          description:
            "Look for evidence on local authority data-sharing around domestic abuse, housing, homelessness, safeguarding and MARAC-style multi-agency structures.",
          visualNote: "Domestic architecture fracture.",
        },
      ],
    },
  ],
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function CrackPath({ index, intensity }: { index: number; intensity: number }) {
  const paths = [
    "M300 300 L330 250 L318 210 L360 170 L350 120",
    "M300 300 L260 270 L230 220 L190 210 L155 180",
    "M300 300 L310 350 L290 390 L315 430 L300 485",
    "M300 300 L365 320 L405 360 L455 365 L510 420",
    "M300 300 L240 325 L195 370 L145 390 L90 450",
    "M300 300 L340 285 L390 250 L445 235 L520 205",
    "M300 300 L280 245 L292 197 L270 150 L285 102",
    "M300 300 L350 360 L380 410 L430 455 L470 515",
  ];

  return (
    <motion.path
      d={paths[index % paths.length]}
      fill="none"
      stroke="rgba(76, 28, 20, 0.62)"
      strokeWidth={1.1 + Math.min(intensity, 8) * 0.16}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.75 }}
      transition={{ duration: 0.75, ease: "easeInOut" }}
    />
  );
}

function EvidenceBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border",
        tone,
      )}
    >
      {children}
    </span>
  );
}

export default function NectarFractureMap() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<SourceNode | null>(null);
  const [openedEvidence, setOpenedEvidence] = useState<Evidence | null>(null);
  const [clicks, setClicks] = useState(0);

  const intensity = Math.min(clicks, 10);
  const fragile = clicks >= 6;
  const activeSources = selectedCategory ? sourceMap[selectedCategory] || [] : [];

  const categoryNodes = useMemo(() => {
    return categories.map((cat, i) => {
      const pos = polarToCartesian(300, 300, 210, i * (360 / categories.length));
      return { cat, ...pos };
    });
  }, []);

  const sourceNodes = useMemo(() => {
    return activeSources.map((source, i) => {
      const angle = 225 + i * 30;
      const pos = polarToCartesian(300, 300, 315, angle);
      return { source, ...pos };
    });
  }, [activeSources]);

  function clickCategory(cat: string) {
    setSelectedCategory(cat);
    setSelectedSource(null);
    setOpenedEvidence(null);
    setClicks((c) => c + 1);
  }

  function clickSource(source: SourceNode) {
    setSelectedSource(source);
    setOpenedEvidence(null);
    setClicks((c) => c + 1);
  }

  function clickEvidence(item: Evidence) {
    setOpenedEvidence(item);
    setClicks((c) => c + 1);
  }

  function reset() {
    setSelectedCategory(null);
    setSelectedSource(null);
    setOpenedEvidence(null);
    setClicks(0);
  }

  const evidenceTypeTone: Record<Evidence["type"], string> = {
    "direct evidence": "bg-emerald-50 text-emerald-900 border-emerald-200",
    "documented precedent": "bg-blue-50 text-blue-900 border-blue-200",
    "reasonable inference": "bg-amber-50 text-amber-900 border-amber-200",
    "research gap": "bg-neutral-100 text-neutral-800 border-neutral-300",
  };

  const confidenceTone: Record<Evidence["confidence"], string> = {
    high: "bg-neutral-950 text-white border-neutral-950",
    medium: "bg-neutral-200 text-neutral-950 border-neutral-300",
    speculative: "bg-orange-50 text-orange-900 border-orange-200",
    unknown: "bg-white text-neutral-600 border-neutral-300",
  };

  return (
    <main className="min-h-screen w-full bg-[#f6f2ea] text-neutral-950 p-5 md:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 xl:grid-cols-[740px_1fr] gap-6 items-start">
        <section className="rounded-[2rem] bg-[#fffdf8] shadow-xl border border-neutral-200 overflow-hidden p-3 md:p-5 sticky top-6">
          <div className="flex items-center justify-between px-3 pb-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                Nectar evidence map
              </p>
              <h1 className="text-xl md:text-2xl font-semibold">
                From category to source to evidence
              </h1>
            </div>
            <button
              onClick={reset}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 transition"
            >
              Reset
            </button>
          </div>

          <svg
            viewBox="-80 -60 760 720"
            className="w-full h-auto rounded-[1.5rem] bg-[#fbfaf6]"
          >
            <defs>
              <filter id="tremble">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.018"
                  numOctaves="2"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale={fragile ? "4" : clicks > 3 ? "1.5" : "0"}
                />
              </filter>
            </defs>

            <motion.g
              filter="url(#tremble)"
              animate={fragile ? { rotate: [-0.35, 0.35, -0.35] } : { rotate: 0 }}
              transition={{
                repeat: fragile ? Infinity : 0,
                duration: 0.45,
              }}
            >
              <motion.circle
                cx="300"
                cy="300"
                r="175"
                fill="none"
                stroke="rgba(20,20,20,0.82)"
                strokeWidth="2"
                animate={{ opacity: fragile ? 0.55 : 1 }}
              />
              <motion.circle
                cx="300"
                cy="300"
                r="78"
                fill="#ffffff"
                stroke="rgba(20,20,20,0.75)"
                strokeWidth="1.5"
              />
              <text
                x="300"
                y="307"
                textAnchor="middle"
                className="font-semibold tracking-[0.22em] text-xl"
                fill="#171717"
              >
                NECTAR
              </text>

              {categoryNodes.map(({ cat, x, y }) => {
                const isSelected = selectedCategory === cat;
                return (
                  <g key={cat}>
                    <motion.line
                      x1="300"
                      y1="300"
                      x2={x}
                      y2={y}
                      stroke={
                        isSelected
                          ? "rgba(76,28,20,0.9)"
                          : "rgba(20,20,20,0.18)"
                      }
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <motion.g
                      onClick={() => clickCategory(cat)}
                      className="cursor-pointer"
                      whileHover={{ scale: 1.06 }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 36 : 31}
                        fill={isSelected ? "#4c1c14" : "#fdfcf8"}
                        stroke="#222"
                        strokeWidth="1.3"
                      />
                      <foreignObject x={x - 56} y={y - 25} width="112" height="50">
                        <div
                          className={classNames(
                            "h-full flex items-center justify-center text-center leading-tight text-[11px] font-medium",
                            isSelected ? "text-white" : "text-neutral-900",
                          )}
                        >
                          {cat}
                        </div>
                      </foreignObject>
                    </motion.g>
                  </g>
                );
              })}
            </motion.g>

            <AnimatePresence>
              {Array.from({ length: Math.min(clicks, 8) }).map((_, i) => (
                <CrackPath key={i} index={i} intensity={intensity} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {selectedCategory &&
                sourceNodes.map(({ source, x, y }) => {
                  const isSelected = selectedSource?.name === source.name;
                  return (
                    <motion.g
                      key={source.name}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45 }}
                    >
                      <motion.path
                        d={`M300 300 Q ${(300 + x) / 2} ${(300 + y) / 2 - 40} ${x} ${y}`}
                        fill="none"
                        stroke="rgba(120,30,20,0.72)"
                        strokeWidth="1.6"
                        strokeDasharray="4 5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                      />
                      <motion.g
                        onClick={() => clickSource(source)}
                        className="cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                      >
                        <rect
                          x={x - 62}
                          y={y - 24}
                          width="124"
                          height="48"
                          rx="16"
                          fill={isSelected ? "#7a1e14" : "#fff"}
                          stroke="#7a1e14"
                          strokeWidth="1.4"
                        />
                        <foreignObject x={x - 55} y={y - 18} width="110" height="36">
                          <div
                            className={classNames(
                              "h-full flex items-center justify-center text-center leading-tight text-[10px] font-medium",
                              isSelected ? "text-white" : "text-neutral-900",
                            )}
                          >
                            {source.name}
                          </div>
                        </foreignObject>
                      </motion.g>
                    </motion.g>
                  );
                })}
            </AnimatePresence>
          </svg>

          <div className="px-3 pt-4">
            <div className="w-full h-2 rounded-full bg-neutral-200 overflow-hidden">
              <motion.div
                className="h-full bg-[#7a1e14]"
                animate={{ width: `${Math.min((clicks / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              {clicks === 0
                ? "The system starts clean. Each click opens a trail."
                : `${clicks} interaction${clicks === 1 ? "" : "s"}: more evidence appears, more cracks accumulate, but the map remains readable.`}
            </p>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-[2rem] bg-white border border-neutral-200 shadow-lg p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-neutral-500 mb-2">
              Investigation panel
            </p>
            {!selectedCategory && (
              <>
                <h2 className="text-2xl font-semibold mb-3">
                  Start by clicking a sensitive category
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  This prototype treats the visual as an evidence archive. The viewer
                  should not only see connections, but follow the source trail: what
                  is directly documented, what is a precedent, what is inferred, and
                  what still needs research.
                </p>
              </>
            )}
            {selectedCategory && !selectedSource && (
              <>
                <h2 className="text-2xl font-semibold mb-3">{selectedCategory}</h2>
                <p className="text-neutral-700 leading-relaxed mb-4">
                  Possible sources have appeared around the circle. Click one to open
                  evidence cards.
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeSources.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => clickSource(s)}
                      className="rounded-full border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            {selectedCategory && selectedSource && (
              <>
                <h2 className="text-2xl font-semibold mb-1">
                  {selectedSource.name}
                </h2>
                <p className="text-sm text-neutral-500 mb-4">
                  Category: {selectedCategory}
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  These cards show the evidentiary trail. Click a card to expand it
                  below; external links open source material.
                </p>
              </>
            )}
          </section>

          {selectedSource && (
            <section className="rounded-[2rem] bg-white border border-neutral-200 shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Evidence cards</h3>
              <div className="space-y-3">
                {selectedSource.evidence.map((item) => (
                  <motion.button
                    key={item.title}
                    onClick={() => clickEvidence(item)}
                    className={classNames(
                      "w-full text-left rounded-2xl border p-4 transition hover:shadow-md",
                      openedEvidence?.title === item.title
                        ? "border-[#7a1e14] bg-[#fff8f4]"
                        : "border-neutral-200 bg-[#fffdf8]",
                    )}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex flex-wrap gap-2 mb-3">
                      <EvidenceBadge tone={evidenceTypeTone[item.type]}>
                        {item.type}
                      </EvidenceBadge>
                      <EvidenceBadge tone={confidenceTone[item.confidence]}>
                        confidence: {item.confidence}
                      </EvidenceBadge>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{item.title}</h4>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {item.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          <AnimatePresence>
            {openedEvidence && (
              <motion.section
                className="rounded-[2rem] bg-[#1d1715] text-white shadow-xl p-6 border border-[#3b2c28]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  <EvidenceBadge tone="bg-white/10 text-white border-white/20">
                    {openedEvidence.type}
                  </EvidenceBadge>
                  <EvidenceBadge tone="bg-white text-neutral-950 border-white">
                    confidence: {openedEvidence.confidence}
                  </EvidenceBadge>
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {openedEvidence.title}
                </h3>
                <p className="text-white/80 leading-relaxed mb-4">
                  {openedEvidence.description}
                </p>
                {openedEvidence.visualNote && (
                  <p className="text-sm text-white/60 mb-4">
                    <span className="font-semibold text-white/80">
                      Visual behaviour:
                    </span>{" "}
                    {openedEvidence.visualNote}
                  </p>
                )}
                {openedEvidence.url ? (
                  <a
                    href={openedEvidence.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition"
                  >
                    Open evidence source ↗
                  </a>
                ) : (
                  <div className="rounded-2xl bg-white/10 border border-white/15 p-4 text-sm text-white/75">
                    No URL yet. This is a research gap or an inference that needs
                    stronger sourcing before publication.
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          <section className="rounded-[2rem] bg-[#fffdf8] border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold mb-2">Legend</h3>
            <div className="flex flex-wrap gap-2">
              <EvidenceBadge tone={evidenceTypeTone["direct evidence"]}>
                direct evidence
              </EvidenceBadge>
              <EvidenceBadge tone={evidenceTypeTone["documented precedent"]}>
                documented precedent
              </EvidenceBadge>
              <EvidenceBadge tone={evidenceTypeTone["reasonable inference"]}>
                reasonable inference
              </EvidenceBadge>
              <EvidenceBadge tone={evidenceTypeTone["research gap"]}>
                research gap
              </EvidenceBadge>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
