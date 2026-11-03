import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX = 5 * 1024 * 1024; // 5 MB (após a redução costuma ter menos de 1 MB)

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const form = await req.formData();
  const arquivo = form.get("arquivo");

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
  }
  const ext = EXT[arquivo.type];
  if (!ext) {
    return NextResponse.json({ erro: "Use JPG, PNG ou WEBP" }, { status: 400 });
  }
  if (arquivo.size > MAX) {
    return NextResponse.json({ erro: "Foto muito grande (máx. 5 MB)" }, { status: 413 });
  }

  try {
    const blob = await put(`produtos/foto.${ext}`, arquivo, {
      access: "public",
      addRandomSuffix: true,
      contentType: arquivo.type,
    });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json(
      { erro: "Falha ao salvar. Confira o BLOB_READ_WRITE_TOKEN." },
      { status: 500 },
    );
  }
}