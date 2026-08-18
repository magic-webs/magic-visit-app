// Dependency-free base64 -> UTF-8 decode (no reliance on Buffer, which isn't
// a JS-engine global in Hermes/React Native — and, since app/+html.tsx also
// uses this at web export time, not guaranteed to have @types/node typed in
// this project either — or atob/escape, which are inconsistently
// available/deprecated).
export function base64ToUtf8(base64: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const char of base64) {
    const value = chars.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}
