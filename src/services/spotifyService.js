import axios from "axios";
import fs from "node:fs/promises";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { URL } from "node:url";
import { importJson } from "../utils/importJson.js";

export class SpofityService {
    #storagePath = join(process.env.STORAGE_PATH, "spotify_storage", "token.json");

    constructor() { this.#init(this.#storagePath); }

    async getTrack(track) {
        const { spotify_search_api } = await importJson("src/data/URLs.json");
        const url = new URL(spotify_search_api);

        url.searchParams.append("q", track);
        url.searchParams.append("type", "track");
        url.searchParams.append("market", "PT");
        url.searchParams.append("limit", 1);
        url.searchParams.append("include_external", "audio");

        const token = JSON.parse(await fs.readFile(this.#storagePath, 'utf8'));
        const result = { data: null };

        const options = { headers: { 'Authorization': `Bearer ${token[0]}` } };

        try {
            const response = await axios.get(url.href, options);
            result.data = response.data.tracks.items[0];
        } catch (_) {
            result.data = await this.#getNewToken(track);
        }

        return result.data;
    }

    async #getNewToken(track) {
        const { spotify_token_api } = await importJson("src/data/URLs.json");
        const url = spotify_token_api;
        const form = { "grant_type": "client_credentials" };
        const options = {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (
                    new Buffer.from(
                        process.env.SPOTIFY_API_CLIENT_ID
                        + ':' +
                        process.env.SPOTIFY_API_CLIENT_SECRET).toString("base64")
                )
            }
        };

        const { data } = await axios.post(url, form, options);
        if (!data) return;

        await fs.writeFile(this.#storagePath, JSON.stringify([data.access_token]));

        return await this.getTrack(track);
    }

    #init() {
        if (!existsSync(this.#storagePath)) {
            mkdirSync(dirname(this.#storagePath), { recursive: true });
            writeFileSync(this.#storagePath, JSON.stringify(["fake_token"]));
        }
    }
}
