// Especies comunes en agua dulce y mar en España. "otra" se gestiona aparte
// como texto libre en los formularios.
export const SPECIES = [
  "Lubina",
  "Dorada",
  "Trucha",
  "Lucio",
  "Black bass",
  "Carpa",
  "Barbo",
  "Siluro",
  "Perca",
  "Lucioperca",
  "Anguila",
  "Boga",
  "Sargo",
  "Corvina",
] as const;

export type Species = (typeof SPECIES)[number];
