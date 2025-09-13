import { join } from "node:path";

export async function importJson(filePath) {
    return (await import(join(process.cwd(), filePath), { with: { type: "json" } })).default;
}
