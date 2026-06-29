export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidCep(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep);
}

export function isValidPhone(phone: string): boolean {
  return /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone);
}
