import { NextResponse } from "next/server";

export interface DollarRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

// Cache simple en memoria de 2 minutos
let cachedRates: DollarRate[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

const FALLBACK_RATES: DollarRate[] = [
  { moneda: "USD", casa: "blue", nombre: "Dólar Blue", compra: 1210, venta: 1230, fechaActualizacion: new Date().toISOString() },
  { moneda: "USD", casa: "oficial", nombre: "Dólar Oficial", compra: 990, venta: 1030, fechaActualizacion: new Date().toISOString() },
  { moneda: "USD", casa: "bolsa", nombre: "Dólar MEP", compra: 1195, venta: 1205, fechaActualizacion: new Date().toISOString() },
  { moneda: "USD", casa: "tarjeta", nombre: "Dólar Tarjeta", compra: 1580, venta: 1648, fechaActualizacion: new Date().toISOString() },
  { moneda: "USD", casa: "cripto", nombre: "Dólar Cripto", compra: 1215, venta: 1225, fechaActualizacion: new Date().toISOString() },
];

export async function GET() {
  const now = Date.now();
  if (cachedRates && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedRates);
  }

  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", {
      next: { revalidate: 120 },
      headers: { "Accept": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      cachedRates = data;
      lastFetchTime = now;
      return NextResponse.json(data);
    }
  } catch (error) {
    console.warn("Could not fetch live dollar rates, using fallback:", error);
  }

  return NextResponse.json(FALLBACK_RATES);
}
