"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Fish } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { spotIcon, pendingIcon } from "./marker-icons";
import type { SpotWithAuthor } from "./types";

// Centro y zoom por defecto: España (Madrid).
const FALLBACK_CENTER: [number, number] = [40.4168, -3.7038];
const FALLBACK_ZOOM = 6;

function authorName(spot: SpotWithAuthor): string {
  return spot.author?.full_name || spot.author?.username || "Anónimo";
}

// Centra en la geolocalización del usuario (una vez). Si falla, deja España.
function LocateOnMount() {
  const map = useMap();
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 12),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [map]);
  return null;
}

function ClickToPick({
  enabled,
  onPick,
}: {
  enabled: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (enabled) onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapCanvasProps {
  spots: SpotWithAuthor[];
  addMode: boolean;
  pending: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
}

export default function MapCanvas({
  spots,
  addMode,
  pending,
  onPick,
}: MapCanvasProps) {
  return (
    <MapContainer
      center={FALLBACK_CENTER}
      zoom={FALLBACK_ZOOM}
      scrollWheelZoom
      className={addMode ? "cursor-crosshair" : ""}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocateOnMount />
      <ClickToPick enabled={addMode} onPick={onPick} />

      {spots.map((spot) =>
        spot.latitude != null && spot.longitude != null ? (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={spotIcon}
          >
            <Popup>
              <div className="flex w-56 flex-col gap-2 p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {spot.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    por {authorName(spot)}
                  </p>
                </div>
                {spot.description && (
                  <p className="text-xs text-slate-600">{spot.description}</p>
                )}
                {spot.fish_types.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {spot.fish_types.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href={`/catches?spot=${spot.id}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:underline"
                >
                  <Fish className="size-3.5" />
                  Ver capturas
                </Link>
              </div>
            </Popup>
          </Marker>
        ) : null,
      )}

      {pending && (
        <Marker position={[pending.lat, pending.lng]} icon={pendingIcon} />
      )}
    </MapContainer>
  );
}
