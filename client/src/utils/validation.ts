export function isValidEmail(email: string): boolean {
    // Standard, widely-used pragmatic email regex (not full RFC 5322, which is
    // impractically complex — this catches the real-world malformed cases).
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}