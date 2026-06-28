import L from "leaflet";

// Pin con forma de gota + icono de pez. Solo se importa desde el canvas
// (que se carga con ssr:false), por eso es seguro tocar Leaflet aquí.
function pinSvg(fill: string, stroke: string): string {
  return `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 15.3 24.6 16 25.1.6.5 1.4.5 2 0 .7-.5 16-12.5 16-25.1C34 8.06 27.94 0 18 0Z"
        fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <g transform="translate(8.5 9.5)" fill="#ffffff">
        <path d="M2.2 6.5c2.6-3.6 7.2-4.8 10.6-3 .9.5 1.7 1.2 2.3 2.1.6-.9 1.7-1.4 2.9-1.1l-1 2 1 2c-1.2.3-2.3-.2-2.9-1.1-.6.9-1.4 1.6-2.3 2.1-3.4 1.8-8 .6-10.6-3Z"/>
        <circle cx="5.4" cy="6.5" r="0.9" fill="${fill}"/>
      </g>
    </svg>`;
}

function makeIcon(fill: string, stroke: string, extraClass = "") {
  return L.divIcon({
    html: pinSvg(fill, stroke),
    className: `dx-marker ${extraClass}`.trim(),
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
}

// sky-500 / sky-700
export const spotIcon = makeIcon("#0EA5E9", "#0369A1");
// acento más oscuro + clase para animación de pulso del punto pendiente
export const pendingIcon = makeIcon("#0369A1", "#0F172A", "dx-marker-pending");
