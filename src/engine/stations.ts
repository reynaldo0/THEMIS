import type { Station } from "@/types";

/**
 * Demo route — realistic KRL Commuter Line naming so the digital twin has a
 * believable journey context (backend exposes no station list constant).
 */
export const STATIONS: Station[] = [
  { id: "jakk", code: "JAKK", name: "Jakarta Kota", distanceKm: 0 },
  { id: "jayk", code: "JAYK", name: "Jayakarta", distanceKm: 0.9 },
  { id: "mgbs", code: "MGBS", name: "Mangga Besar", distanceKm: 2.1 },
  { id: "swbr", code: "SWBR", name: "Sawah Besar", distanceKm: 3.2 },
  { id: "juan", code: "JUAN", name: "Juanda", distanceKm: 4.3 },
  { id: "gdng", code: "GDNG", name: "Gondangdia", distanceKm: 5.6 },
  { id: "ciki", code: "CIKI", name: "Cikini", distanceKm: 6.9 },
  { id: "mri", code: "MRI", name: "Manggarai", distanceKm: 8.0 },
  { id: "tebt", code: "TEBT", name: "Tebet", distanceKm: 10.1 },
  { id: "cwan", code: "CWAN", name: "Cawang", distanceKm: 11.4 },
  { id: "drkl", code: "DRKL", name: "Duren Kalibata", distanceKm: 12.8 },
  { id: "psmg", code: "PSMG", name: "Pasar Minggu", distanceKm: 15.1 },
  { id: "tntb", code: "TNTB", name: "Tanjung Barat", distanceKm: 16.4 },
  { id: "lnag", code: "LNAG", name: "Lenteng Agung", distanceKm: 17.7 },
  { id: "ctay", code: "CTAY", name: "Citayam", distanceKm: 24.0 },
  { id: "boo", code: "BOO", name: "Bogor", distanceKm: 31.2 },
];

export const DEFAULT_STATION_INDEX = 7;

export function stationAt(index: number): Station {
  return STATIONS[Math.max(0, Math.min(STATIONS.length - 1, index))];
}
