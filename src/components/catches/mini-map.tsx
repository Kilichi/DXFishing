"use client";

import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { spotIcon } from "@/components/map/marker-icons";

const FALLBACK_CENTER: [number, number] = [40.4168, -3.7038];

function ClickToSet({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MiniMapProps {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}

export default function MiniMap({ value, onChange }: MiniMapProps) {
  const center = value ? [value.lat, value.lng] : FALLBACK_CENTER;
  return (
    <MapContainer
      center={center as [number, number]}
      zoom={value ? 12 : 6}
      scrollWheelZoom
      className="h-48 w-full cursor-crosshair"
    >
      <TileLayer
        attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        maxZoom={17}
      />
      <ClickToSet onChange={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={spotIcon} />}
    </MapContainer>
  );
}
