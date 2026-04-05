"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Company, Category } from "@/types/company";
import { CATEGORY_COLORS, CATEGORIES } from "@/lib/companies";

interface MapProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

// Short property keys for clusterProperties (avoids long strings in expressions)
const CAT_KEYS: { key: string; category: Category; color: string }[] = CATEGORIES.map((cat, i) => ({
  key: `c${i}`,
  category: cat,
  color: CATEGORY_COLORS[cat],
}));

// Aggregation expressions for Mapbox source clusterProperties
const clusterProperties: Record<string, any> = {};
for (const { key, category } of CAT_KEYS) {
  clusterProperties[key] = ["+", ["case", ["==", ["get", "category"], category], 1, 0]];
}

function toGeoJSON(companies: Company[]) {
  return {
    type: "FeatureCollection" as const,
    features: companies.map((c) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [c.lng, c.lat] as [number, number] },
      properties: {
        id: String(c.id),
        color: CATEGORY_COLORS[c.category] ?? "#CD5438",
        category: c.category,
      },
    })),
  };
}

function getPieSize(count: number): number {
  if (count < 6) return 44;
  if (count < 16) return 54;
  if (count < 30) return 62;
  return 70;
}

function createPieCanvas(props: Record<string, any>): HTMLCanvasElement {
  const total: number = props.point_count;
  const size = getPieSize(total);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.style.cursor = "pointer";

  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 1.5;
  const innerR = size / 3.2;

  // Draw pie segments
  let angle = -Math.PI / 2;
  for (const { key, color } of CAT_KEYS) {
    const count = (props[key] as number) ?? 0;
    if (!count) continue;
    const sweep = (count / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    angle += sweep;
  }

  // White inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Count label
  const fontSize = Math.max(11, Math.round(size / 3.6));
  ctx.fillStyle = "#1C1C1C";
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(total), cx, cy);

  return canvas;
}

export default function Map({ companies, selectedCompany, onSelectCompany }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const clusterMarkersRef = useRef<Map<number, mapboxgl.Marker>>(new Map());
  const companiesRef = useRef(companies);
  const onSelectRef = useRef(onSelectCompany);
  companiesRef.current = companies;
  onSelectRef.current = onSelectCompany;

  // ── Init map once ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [104.1954, 35.8617],
      zoom: 4,
      minZoom: 2,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("load", () => {
      // ── Source with clustering + category count aggregation ────────────────
      map.addSource("companies", {
        type: "geojson",
        data: toGeoJSON(companiesRef.current),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
        clusterProperties,
      });

      // ── Individual pins ────────────────────────────────────────────────────
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "companies",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 8,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      // ── Pie chart cluster markers ──────────────────────────────────────────
      map.on("render", () => {
        if (!map.isSourceLoaded("companies")) return;

        const features = map.querySourceFeatures("companies", {
          filter: ["has", "point_count"],
        });

        const activeIds = new Set<number>();

        for (const f of features) {
          const props = f.properties as Record<string, any>;
          const clusterId = props.cluster_id as number;
          if (activeIds.has(clusterId)) continue; // deduplicate
          activeIds.add(clusterId);

          if (!clusterMarkersRef.current.has(clusterId)) {
            const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
            const canvas = createPieCanvas(props);

            canvas.addEventListener("click", () => {
              const source = map.getSource("companies") as mapboxgl.GeoJSONSource;
              source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err || zoom == null) return;
                map.easeTo({ center: coords, zoom });
              });
            });

            const marker = new mapboxgl.Marker({ element: canvas, anchor: "center" })
              .setLngLat(coords)
              .addTo(map);

            clusterMarkersRef.current.set(clusterId, marker);
          }
        }

        // Remove markers for clusters no longer visible
        for (const [id, marker] of clusterMarkersRef.current.entries()) {
          if (!activeIds.has(id)) {
            marker.remove();
            clusterMarkersRef.current.delete(id);
          }
        }
      });

      // ── Click: individual pin → select company ─────────────────────────────
      map.on("click", "unclustered-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const company = companiesRef.current.find((c) => String(c.id) === id);
        if (company) onSelectRef.current(company);
      });

      // ── Cursor for individual pins ─────────────────────────────────────────
      map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });
    });

    mapRef.current = map;
    return () => {
      for (const marker of clusterMarkersRef.current.values()) marker.remove();
      clusterMarkersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Update source + clear markers when companies filter changes ──────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("companies") as mapboxgl.GeoJSONSource | undefined;
    source?.setData(toGeoJSON(companies));

    // Clear markers so they rebuild from the new cluster data
    for (const marker of clusterMarkersRef.current.values()) marker.remove();
    clusterMarkersRef.current.clear();
  }, [companies]);

  // ── Highlight selected pin ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer("unclustered-point")) return;

    const selectedId = selectedCompany ? String(selectedCompany.id) : "__none__";
    map.setPaintProperty("unclustered-point", "circle-radius", [
      "case", ["==", ["get", "id"], selectedId], 11, 8,
    ]);
    map.setPaintProperty("unclustered-point", "circle-stroke-width", [
      "case", ["==", ["get", "id"], selectedId], 3.5, 2.5,
    ]);

    if (selectedCompany) {
      map.flyTo({
        center: [selectedCompany.lng, selectedCompany.lat],
        zoom: Math.max(map.getZoom(), 6),
        duration: 700,
        offset: [120, 0],
      });
    }
  }, [selectedCompany]);

  return (
    <div ref={containerRef} className="w-full h-full">
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="text-center max-w-sm px-6">
            <div className="text-4xl mb-3">🗺️</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Mapbox token required</h2>
            <p className="text-sm text-gray-500">
              Add <code className="bg-gray-200 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN=pk....</code> to{" "}
              <code className="bg-gray-200 px-1 rounded">.env.local</code> and restart the dev server.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
