"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Company } from "@/types/company";
import { CATEGORY_COLORS } from "@/lib/companies";

interface MapProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
}

// Pin SVG path — a teardrop marker
function createMarkerEl(color: string, isSelected: boolean): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 32px;
    height: 40px;
    cursor: pointer;
    transition: transform 0.15s ease, filter 0.15s ease;
  `;
  if (isSelected) {
    el.style.transform = "scale(1.3)";
    el.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.35))";
  } else {
    el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.25))";
  }

  el.innerHTML = `
    <svg viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="40">
      <path d="M16 1C8.82 1 3 6.82 3 14C3 22.5 16 39 16 39C16 39 29 22.5 29 14C29 6.82 23.18 1 16 1Z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="14" r="5" fill="white" opacity="0.85"/>
    </svg>
  `;
  return el;
}

export default function Map({ companies, selectedCompany, onSelectCompany }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<globalThis.Map<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>(new globalThis.Map());

  // Stable callback ref to avoid re-creating markers on every render
  const onSelectRef = useRef(onSelectCompany);
  onSelectRef.current = onSelectCompany;

  // Initialise map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("NEXT_PUBLIC_MAPBOX_TOKEN not set — map won't load");
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [104.1954, 35.8617], // geographic centre of China
      zoom: 4,
      minZoom: 2,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add/update markers when companies list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existingIds = new Set(markersRef.current.keys());
    const incomingIds = new Set(companies.map((c) => c.id));

    // Remove markers no longer in the filtered list
    existingIds.forEach((id) => {
      if (!incomingIds.has(id)) {
        markersRef.current.get(id)?.marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add new markers
    companies.forEach((company) => {
      if (markersRef.current.has(company.id)) return;

      const color = CATEGORY_COLORS[company.category];
      const el = createMarkerEl(color, false);

      el.addEventListener("click", () => {
        onSelectRef.current(company);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([company.lng, company.lat])
        .addTo(map);

      markersRef.current.set(company.id, { marker, el });
    });
  }, [companies]);

  // Update selected marker appearance
  useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      const isSelected = selectedCompany?.id === id;
      if (isSelected) {
        el.style.transform = "scale(1.35)";
        el.style.filter = "drop-shadow(0 4px 10px rgba(0,0,0,0.4))";
        el.style.zIndex = "10";
      } else {
        el.style.transform = "scale(1)";
        el.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.25))";
        el.style.zIndex = "1";
      }
    });

    // Fly to selected company
    if (selectedCompany && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedCompany.lng, selectedCompany.lat],
        zoom: Math.max(mapRef.current.getZoom(), 6),
        duration: 700,
        offset: [120, 0], // offset left to account for panel on right
      });
    }
  }, [selectedCompany]);

  return (
    <div ref={mapContainerRef} className="w-full h-full">
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
