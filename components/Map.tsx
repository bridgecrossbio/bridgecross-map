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

// Per-category keys used in clusterProperties aggregation
const CAT_KEYS = CATEGORIES.map((cat, i) => ({
  key: `c${i}`,
  category: cat as Category,
  color: CATEGORY_COLORS[cat as Category],
}));

// Aggregate category counts into the cluster feature properties
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
        color: CATEGORY_COLORS[c.category] ?? "#B83A2A",
        category: c.category,
      },
    })),
  };
}

function createPieCanvas(props: Record<string, any>): HTMLCanvasElement {
  const total: number = props.point_count;
  const size = total < 10 ? 44 : total < 30 ? 54 : 64;
  const canvas = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const innerR = outerR * 0.55;

  // Pie segments
  let angle = -Math.PI / 2;
  for (const { key, color } of CAT_KEYS) {
    const count = Number(props[key]) || 0;
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

  // White inner circle (donut hole)
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Count label
  const fontSize = Math.max(10, Math.round(size / 3.8));
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
  const clusterMarkersRef = useRef<Record<number, mapboxgl.Marker>>({});
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

    const isMobile = window.innerWidth < 768;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: isMobile ? [116.0, 32.0] : [104.0, 35.5],
      zoom: isMobile ? 3.8 : 3.8,
      minZoom: 2,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    function updateClusterMarkers() {
      if (!map.isSourceLoaded("companies")) return;

      const features = map.querySourceFeatures("companies", {
        filter: ["==", "cluster", true],
      });

      // Build the set of cluster IDs currently rendered
      const currentIds = new Set<number>();
      const seen = new Set<number>();

      for (const f of features) {
        const props = f.properties as Record<string, any>;
        const clusterId = props.cluster_id as number;
        if (seen.has(clusterId)) continue;
        seen.add(clusterId);
        currentIds.add(clusterId);

        // Only create a marker if one doesn't already exist for this cluster
        if (!clusterMarkersRef.current[clusterId]) {
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          const canvas = createPieCanvas(props);
          canvas.style.cursor = "pointer";

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
          clusterMarkersRef.current[clusterId] = marker;
        }
      }

      // Remove markers for cluster IDs no longer in the rendered features
      for (const id of Object.keys(clusterMarkersRef.current)) {
        const numId = Number(id);
        if (!currentIds.has(numId)) {
          clusterMarkersRef.current[numId].remove();
          delete clusterMarkersRef.current[numId];
        }
      }
    }

    map.on("load", () => {
      // ── GeoJSON source with clustering + per-category aggregation ──────────
      map.addSource("companies", {
        type: "geojson",
        data: toGeoJSON(companiesRef.current),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
        clusterProperties,
      });

      // Invisible circle layer for clusters — provides a hit target so Mapbox
      // registers cluster features; visual rendering is handled by canvas markers.
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "companies",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": 30,
          "circle-opacity": 0,
          "circle-stroke-opacity": 0,
        },
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

      // Rebuild canvas markers whenever source data loads or updates
      map.on("data", (e: any) => {
        if (e.sourceId !== "companies" || !map.isSourceLoaded("companies")) return;
        updateClusterMarkers();
      });

      // Update continuously during zoom animation so markers disappear as soon
      // as their clusters unpack — prevents double-display with individual pins
      map.on("zoom", updateClusterMarkers);
      map.on("render", () => {
        if (map.isSourceLoaded("companies")) updateClusterMarkers();
      });

      // ── Click individual pin → select company ──────────────────────────────
      map.on("click", "unclustered-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const company = companiesRef.current.find((c) => String(c.id) === id);
        if (company) onSelectRef.current(company);
      });

      // ── Cursors ────────────────────────────────────────────────────────────
      map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });
    });

    mapRef.current = map;
    return () => {
      for (const m of Object.values(clusterMarkersRef.current)) m.remove();
      clusterMarkersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Update source when companies filter changes ──────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("companies") as mapboxgl.GeoJSONSource | undefined;
    source?.setData(toGeoJSON(companies));
    // data event will trigger updateClusterMarkers
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
      const mobile = window.innerWidth < 768;
      map.flyTo({
        center: [selectedCompany.lng, selectedCompany.lat],
        zoom: Math.max(map.getZoom(), mobile ? 8 : 10),
        duration: 800,
        // Desktop: offset right so pin isn't behind the right sidebar panel.
        // Mobile: no x-offset; panel appears below the map.
        offset: mobile ? [0, 0] : [120, 0],
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
