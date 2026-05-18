export function vnSlug(input: string): string { return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function formatVnd(value: number): string { return new Intl.NumberFormat("vi-VN").format(value) + "₫"; }
export function clamp(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, value)); }
export function includesText(value: string, query: string): boolean { return value.toLowerCase().includes(query.trim().toLowerCase()); }
export const priceRangeLabel: Record<string, string> = { "duoi-10-trieu": "Dưới 10 triệu", "10-15-trieu": "10-15 triệu", "15-20-trieu": "15-20 triệu", "20-30-trieu": "20-30 triệu", "tren-30-trieu": "Trên 30 triệu" };
