import { NextResponse } from "next/server";
import { validarCupom } from "@/lib/cupom";

export async function POST(req: Request) {
  const { codigo, subtotalCentavos } = await req.json();

  if (typeof codigo !== "string" || !Number.isInteger(subtotalCentavos)) {
    return NextResponse.json({ ok: false, erro: "Dados inválidos." }, { status: 400 });
  }

  const r = await validarCupom(codigo, subtotalCentavos);
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}