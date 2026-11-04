// lib/revalidar-loja.ts
import { revalidatePath } from "next/cache";

// limpa o cache da home e de todas as páginas de produto
export function revalidarLoja() {
  revalidatePath("/");
  revalidatePath("/produtos/[slug]", "page");
}