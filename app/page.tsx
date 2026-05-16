import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import { ExternalLink, Info, Search } from "lucide-react";

const rows = [];

function buildHierarchy(data) {
  const grouped = d3.group(data, d => d.category);
  return {
    name: "NECTAR",
    children: Array.from(grouped, ([category, items]) => ({
      name: category,
      type: "category",
      children: items.map((item, i) => ({
        name: item.source,
        type: "source",
        value: 1,
        data: item,
        id: `${category}-${item.source}-${i}`,
      })),
    })),
  };
}

function shorten(text, max = 42) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export default function NectarSunburstWithSidebar() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.category.toLowerCase().includes(q) ||
      r.source.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }, [query]);

  const width = 760;
  const radius = width / 2;

  const { arcs, color } = useMemo(() => {
    const root = d3
      .hierarchy(buildHierarchy(filteredRows))
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    d3.partition().size([2 * Math.PI, radius])(root);

    const categories = root.children?.map(d => d.data.name) || [];
    const color = d3.scaleOrdinal(categories, [
      "#2157d6", "#ff4b2b", "#ff4fa3", "#8b8b8b", "#f2b705", "#8e54d8",
      "#ff7a1a", "#e72e3d", "#00a676", "#3b9aaa", "#b7b7b7", "#5f4b8b"
    ]);

    const arcs = root.descendants().filter(d => d.depth > 0);
    return { arcs, color };
  }, [filteredRows, radius]);

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.depth === 1 ? radius * 0.28 : radius * 0.55)
    .outerRadius(d => d.depth === 1 ? radius * 0.55 : radius * 0.92)
    .padAngle(0.002)
    .padRadius(radius / 2);

  function fillFor(d) {
    const category = d.depth === 1 ? d.data.name : d.parent?.data.name;
    const c = color(category);
    return d.depth === 1 ? c : d3.color(c)?.brighter(0.65)?.formatHex() || c;
  }

  function centroid(d) {
    const [x, y] = arc.centroid(d);
    return { x, y };
  }

  const selectedLinks = selected?.links || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_430px] lg:p-8">
        <main className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-2xl">
          <div className="mb-5 flex flex-col gap-4 border-b border-neutral-800 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-neutral-400">Interactive reconstruction</p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">NECTAR</h1>
              <p className="mt-2 max-w-3xl text-base text-neutral-300 md:text-lg">
                Reverse-engineering the hidden architecture of police data-sharing networks.
              </p>
            </div>
            <label className="relative block w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search data source…"
                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-neutral-400"
              />
            </label>
          </div>

          <div className="flex justify-center overflow-hidden">
            {rows.length === 0 ? (
              <div className="flex min-h-[560px] items-center justify-center rounded-3xl border border-dashed border-neutral-700 p-8 text-center text-neutral-300">
                Paste the Excel-converted JSON into the <code className="mx-1 rounded bg-neutral-800 px-2 py-1">rows</code> array at the top of this file.
              </div>
            ) : (
              <svg viewBox={`${-radius} ${-radius} ${width} ${width}`} className="h-[72vh] max-h-[820px] min-h-[560px] w-full max-w-[920px]">
                <circle r={radius * 0.27} fill="#0a0a0a" stroke="#262626" />
                <text textAnchor="middle" y="-12" className="fill-neutral-100 text-[26px] font-semibold">NECTAR</text>
                <text textAnchor="middle" y="18" className="fill-neutral-400 text-[11px] uppercase tracking-[0.25em]">click a segment</text>

                {arcs.map((d, i) => {
                  const isLeaf = d.depth === 2;
                  const label = d.data.name;
                  const { x, y } = centroid(d);
                  const angle = ((d.x0 + d.x1) / 2) * 180 / Math.PI - 90;
                  const rotate = angle > 90 ? angle + 180 : angle;
                  const active = selected && isLeaf && selected.source === d.data.data?.source && selected.category === d.data.data?.category;
                  return (
                    <g key={d.data.id || `${d.data.name}-${i}`}>
                      <path
                        d={arc(d)}
                        fill={fillFor(d)}
                        stroke="#111827"
                        strokeWidth={active ? 2.5 : 0.8}
                        opacity={selected && isLeaf && !active ? 0.72 : 1}
                        className="cursor-pointer transition duration-200 hover:opacity-100"
                        onClick={() => {
                          if (isLeaf) setSelected(d.data.data);
                          else setSelected({ category: d.data.name, source: d.data.name, description: `${d.value} possible data sources mapped under this special category. Click the outer ring to inspect a specific source.`, evidenceType: "category overview", links: [] });
                        }}
                      />
                      {((d.x1 - d.x0) > (isLeaf ? 0.045 : 0.16)) && (
                        <text
                          transform={`translate(${x},${y}) rotate(${rotate})`}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={isLeaf ? "pointer-events-none fill-neutral-950 text-[9px]" : "pointer-events-none fill-white text-[18px] font-medium"}
                        >
                          {shorten(label, isLeaf ? 30 : 22)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </main>

        <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <section className="border-b border-neutral-800 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-neutral-400">
                <Info className="h-4 w-4" /> Method note
              </div>
              <h2 className="mb-3 text-2xl font-semibold">How to read this map</h2>
              <p className="text-sm leading-6 text-neutral-300">
                Official documents indicate that Nectar processes 11 categories of special category personal data and draws on a wider data-sharing infrastructure. This map reconstructs possible data sources using public documents, policing guidance, privacy notices, legal frameworks and investigative reporting.
              </p>
              <div className="mt-4 rounded-2xl bg-neutral-950 p-4 text-sm leading-6 text-neutral-300">
                <p><span className="font-semibold text-neutral-100">Inner ring:</span> special category data.</p>
                <p><span className="font-semibold text-neutral-100">Outer ring:</span> possible data sources.</p>
                <p><span className="font-semibold text-neutral-100">Click:</span> inspect the evidentiary basis.</p>
              </div>
            </section>

            <section className="min-h-0 flex-1 overflow-y-auto p-6">
              {selected ? (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.28em] text-neutral-500">Selected source</p>
                  <h3 className="text-2xl font-semibold leading-tight">{selected.source}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{selected.category}</p>

                  {selected.evidenceType && (
                    <div className="mt-4 inline-flex rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                      {selected.evidenceType}
                    </div>
                  )}

                  <div className="mt-6 whitespace-pre-line text-sm leading-7 text-neutral-200">
                    {selected.description || "No additional note has been entered for this source yet."}
                  </div>

                  {selectedLinks.length > 0 && (
                    <div className="mt-6 space-y-3">
                      {selectedLinks.map((link, index) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
                        >
                          <span>{selectedLinks.length === 1 ? "Open evidence source" : `Open evidence source ${index + 1}`}</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-700 p-5 text-sm leading-7 text-neutral-300">
                  Click a category or outer-ring source to replace this panel with your Excel notes and evidence links.
                </div>
              )}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
