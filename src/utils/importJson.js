import path from "node:path";

export async function importJson(filePath) {
    return (await import(path.join(process.cwd(), filePath), { with: { type: "json" } })).default;
}
