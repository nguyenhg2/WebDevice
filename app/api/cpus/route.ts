import { enforceRateLimit, ok } from "@/lib/api";
import { cpus } from "@/lib/data";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "cpus");
  if (limited) return limited;
  return ok(cpus);
}
