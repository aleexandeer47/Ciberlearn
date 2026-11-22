// Modo colegio: el docente crea una clase y los estudiantes entran con un código. Funciones puras.

export const SCHOOL = {
  /** Clases por docente */
  classesPerTeacher: 10,
  /** Estudiantes por clase */
  studentsPerClass: 80,
  /** Clases en las que puede estar un estudiante */
  classesPerStudent: 5,
  codeLength: 6,
} as const;

// Sin letras ni números que se confundan al dictarlos o copiarlos de la pizarra (0/O, 1/I/L, 5/S…)
const ALPHABET = "ABCDEFGHJKMNPQRTUVWXYZ2346789";

/** Código de clase de 6 caracteres. `rand` se puede inyectar para pruebas. */
export function newClassCode(rand = Math.random) {
  let s = "";
  for (let i = 0; i < SCHOOL.codeLength; i++) s += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  return s;
}

/** Limpia lo que escribe el estudiante (mayúsculas, sin espacios ni guiones). null si no puede ser un código. */
export function normalizeClassCode(raw: unknown) {
  const s = String(raw ?? "")
    .toUpperCase()
    .replace(/[\s-]/g, "");
  return s.length === SCHOOL.codeLength && [...s].every((c) => ALPHABET.includes(c)) ? s : null;
}

export const isValidClassName = (s: string) => s.trim().length >= 2 && s.trim().length <= 60;
