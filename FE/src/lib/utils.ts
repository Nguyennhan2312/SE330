export function cn(...inputs: unknown[]) {
  return inputs.filter((input): input is string => typeof input === "string" && input.length > 0).join(" ");
}
