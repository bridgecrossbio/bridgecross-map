"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Company } from "@/types/company";
import { CATEGORY_COLORS } from "@/lib/companies";

interface MapProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
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
      },
    })),
  };
}

export default function Map({ companies, selectedCompany, onSelectCompany }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
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
      // ── GeoJSON source with clustering ─────────────────────────────────────
      map.addSource("companies", {
        type: "geojson",
        data: toGeoJSON(companiesRef.current),
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      });

      // ── Cluster circles ────────────────────────────────────────────────────
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "companies",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#B83A2A",
          "circle-radius": [
            "step", ["get", "point_count"],
            20,
            10, 26,
            30, 32,
          ],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.9,
        },
      });

      // ── Cluster count label ────────────────────────────────────────────────
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "companies",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 13,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
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

      // ── Click cluster → zoom in ────────────────────────────────────────────
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id as number;
        const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
        const source = map.getSource("companies") as mapboxgl.GeoJSONSource;
        (source.getClusterExpansionZoom(clusterId) as unknown as Promise<number>)
          .then((zoom) => { map.easeTo({ center: coords, zoom }); })
          .catch(() => {});
      });

      // ── Click individual pin → select company ──────────────────────────────
      map.on("click", "unclustered-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const company = companiesRef.current.find((c) => String(c.id) === id);
        if (company) onSelectRef.current(company);
      });

      // ── Cursors ────────────────────────────────────────────────────────────
      map.on("mouseenter", "clusters", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "clusters", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "unclustered-point", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "unclustered-point", () => { map.getCanvas().style.cursor = ""; });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Update source when companies filter changes ──────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("companies") as mapboxgl.GeoJSONSource | undefined;
    source?.setData(toGeoJSON(companies));
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
