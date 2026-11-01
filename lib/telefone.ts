// lib/telefone.ts
// Telefone brasileiro em uma única forma: "55" + DDD + número (ex.: 5583999999999).
// Devolve null quando não é um telefone válido (nunca "adivinha" dígitos).
export function normalizarTelefone(entrada: string): string | null {
  // só dígitos, sem zeros à esquerda (o "0" antes do DDD)
  let n = entrada.replace(/\D/g, "").replace(/^0+/, "");

  // tira o código do país (55) quando sobra DDD + número
  if ((n.length === 12 || n.length === 13) && n.startsWith("55")) n = n.slice(2);

  // agora tem que ser DDD (2 dígitos) + número de 8 ou 9 dígitos
  if (n.length !== 10 && n.length !== 11) return null;

  const ddd = n.slice(0, 2);
  let numero = n.slice(2);

  if (!/^[1-9][1-9]$/.test(ddd)) return null;

  // celular antigo, sem o 9 (8 dígitos começando em 6 a 9): acrescenta o 9
  if (numero.length === 8 && /^[6-9]/.test(numero)) numero = "9" + numero;

  // celular (9 dígitos) começa com 9; fixo (8 dígitos) começa com 2 a 5
  if (numero.length === 9 && numero[0] !== "9") return null;
  if (numero.length === 8 && !/^[2-5]/.test(numero)) return null;

  return "55" + ddd + numero;
}