import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { join } from "node:path";

export function tempFile(extension) {
    return join(
        tmpdir(),
        `${randomBytes(6).readUIntLE(0, 6).toString(36)}.${extension}`
    )
}
