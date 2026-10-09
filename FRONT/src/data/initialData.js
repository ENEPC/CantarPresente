export const INITIAL_CHOIRS = [
  { id: 1, name: "Coro Niños - Sede San Cayetano", venue: "Virreyes Oeste" },
  { id: 2, name: "Coro Juvenil - Sede San Cayetano", venue: "Virreyes Oeste" },
  { id: 3, name: "Coro Infantil - Sede Capilla Santa Ana", venue: "Virreyes" },
  { id: 4, name: "Coro Voces Jóvenes - Sede Itatí", venue: "Virreyes" },
  { id: 5, name: "Coro Inicial - Sede Esperanza", venue: "Virreyes Sur" }
];

export const INITIAL_STUDENTS = [
  { id: 101, name: "Mateo", lastname: "Gómez", choirId: 1, tutor: "Rosa Gómez", active: true },
  { id: 102, name: "Lucía", lastname: "Fernández", choirId: 1, tutor: "Carmen Fernández", active: true },
  { id: 103, name: "Thiago", lastname: "Benítez", choirId: 1, tutor: "Valeria Benítez", active: true },
  { id: 104, name: "Bautista", lastname: "Romero", choirId: 2, tutor: "Mirta Romero", active: true },
  { id: 105, name: "Martina", lastname: "Díaz", choirId: 3, tutor: "Estela Díaz", active: true }
];

export function normalizeText(text) {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}