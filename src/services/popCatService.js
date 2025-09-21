import axios from "axios";
import { URL } from "node:url";
import { importJson } from "../utils/importJson.js";

const { popcat_api } = await importJson("src/data/URLs.json");

export class PopCatService {
    #url = new URL(popcat_api);

    async joke() {
        this.#url.pathname = "/joke";

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: "Não foi possível obter a piada."
            }
        }

        return {
            success: true,
            data: await this.translate(data.joke, "pt")
        };
    }

    async fact() {
        this.#url.pathname = "/fact";

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: "Não foi possível obter o fato aleatório."
            }
        }

        return {
            success: true,
            data: await this.translate(data.fact, "pt")
        };
    }

    async lyrics(song) {
        this.#url.pathname = "/lyrics";
        this.#url.searchParams.append("song", song);

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: await this.translate(data.error, "pt")
            }
        }

        return {
            success: true,
            data: {
                lyrics: data.message.lyrics,
                url: data.message.url
            }
        };
    }

    async npm(packageName) {
        this.#url.pathname = "/npm";
        this.#url.searchParams.append("q", packageName);

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: await this.translate(data.error, "pt")
            }
        }

        return {
            success: true,
            data: {
                name: data.name,
                version: data.version,
                description: await this.translate(data.description, "pt"),
                author: data.author,
                last_published: data.last_published,
                repository: data.repository || null,
                downloads_this_year: data.downloads_this_year
            }
        };
    }

    async steam(gameName) {
        this.#url.pathname = "/steam";
        this.#url.searchParams.append("q", gameName);

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: await this.translate(data.error, "pt")
            }
        }

        return {
            success: true,
            data: {
                type: data.type,
                name: data.name,
                description: await this.translate(data.description, "pt"),
                website: data.website,
                developers: data.developers,
                publishers: data.publishers,
                price: data.price
            }
        };
    }

    async periodicTable() {
        this.#url.pathname = "/periodic-table/random";

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: await this.translate(data.error, "pt")
            }
        }

        return {
            success: true,
            data: {
                name: data.name,
                symbol: data.symbol,
                atomic_number: data.atomic_number,
                atomic_mass: data.atomic_mass,
                period: data.period,
                phase: data.phase,
                discovered_by: data.discovered_by,
                img_url: data.image,
                summary: await this.translate(data.summary, "pt")
            }
        };
    }

    async pickuplines() {
        this.#url.pathname = "/pickuplines";

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: await this.translate(data.error, "pt")
            }
        }

        return {
            success: true,
            data: await this.translate(data.pickupline, "pt")
        };
    }

    async showerThought() {
        this.#url.pathname = "/showerthoughts";

        const { data } = await axios.get(this.#url.href);

        if (data.error) {
            return {
                success: false,
                message: await this.translate(data.error, "pt")
            }
        }

        return {
            success: true,
            data: await this.translate(data.result, "pt")
        };
    }

    async randomColor() {
        this.#url.pathname = "/randomcolor";

        const colorRand = await axios.get(this.#url.href);

        if (colorRand.error) {
            return {
                success: false,
                message: await this.translate(colorRand.error, "pt")
            }
        }

        this.#url.pathname = `/color/${colorRand.data.hex}`;

        const { data } = await axios.get(this.#url.href);

        return {
            success: true,
            data: {
                name: await this.translate(data.name, "pt"),
                hex: data.hex,
                rgb: data.rgb,
                hsl: data.hsl_string,
                brightened: data.brightened,
                img_url: data.color_image
            }
        };
    }

    async randomCar() {
        this.#url.pathname = "/car";

        const { data } = await axios.get(this.#url.href);

        return {
            success: true,
            data: { 
                title: data.title.split(" [")[0],
                img_url: data.image
            }
        };
    }

    async translate(text, lang) {
        this.#url.pathname = "/translate";
        this.#url.searchParams.append("to", lang);
        this.#url.searchParams.append("text", text);

        const { data } = await axios.get(this.#url.href);

        return (data.error) ? "Não foi possível traduzir." : data.translated;
    }
}
