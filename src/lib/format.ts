import type { DensityIndicator } from "@/types";

export const DENSITY_COLOR: Record<DensityIndicator, string> = {
  GREEN: "#16A34A",
  YELLOW: "#F59E0B",
  RED: "#ED242B",
};

export const DENSITY_LABEL: Record<DensityIndicator, string> = {
  GREEN: "Lengang",
  YELLOW: "Sedang",
  RED: "Padat",
};

export const DENSITY_HEX_INT: Record<DensityIndicator, number> = {
  GREEN: 0x16a34a,
  YELLOW: 0xf59e0b,
  RED: 0xed242b,
};

export function percent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function ratio(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatIdr(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  return `Rp ${value.toFixed(0)}`;
}

export function carCode(carId: number): string {
  return `car_${String(carId).padStart(2, "0")}`;
}
