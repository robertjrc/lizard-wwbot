import axios from "axios";
import { URL } from "node:url";
import { importJson } from "../utils/importJson.js";

const { popcat_api } = await importJson("src/data/URLs.json");

export class PopCatService {
    #url = new URL(popcat_api);

    async joke() {
        this.#url.pathname = "/joke";

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: await this.translate(res.data.joke, "pt")
        };
    }

    async fact() {
        this.#url.pathname = "/fact";

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: await this.translate(res.data.fact, "pt")
        };
    }

    async lyrics(song) {
        this.#url.pathname = "/lyrics";
        this.#url.searchParams.append("song", song);

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: {
                lyrics: res.data.message.lyrics,
                url: res.data.message.url
            }
        };
    }

    async npm(packageName) {
        this.#url.pathname = "/npm";
        this.#url.searchParams.append("q", packageName);

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: {
                name: res.data.name,
                version: res.data.version,
                description: await this.translate(res.data.description, "pt"),
                author: res.data.author,
                last_published: res.data.last_published,
                repository: res.data.repository || null,
                downloads_this_year: res.data.downloads_this_year
            }
        };
    }

    async steam(gameName) {
        this.#url.pathname = "/steam";
        this.#url.searchParams.append("q", gameName);

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: {
                type: res.data.type,
                name: res.data.name,
                description: await this.translate(res.data.description, "pt"),
                website: res.data.website,
                developers: res.data.developers,
                publishers: res.data.publishers,
                price: res.data.price
            }
        };
    }

    async periodicTable() {
        this.#url.pathname = "/periodic-table/random";

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: {
                name: res.data.name,
                symbol: res.data.symbol,
                atomic_number: res.data.atomic_number,
                atomic_mass: res.data.atomic_mass,
                period: res.data.period,
                phase: res.data.phase,
                discovered_by: res.data.discovered_by,
                img_url: res.data.image,
                summary: await this.translate(res.data.summary, "pt")
            }
        };
    }

    async pickuplines() {
        this.#url.pathname = "/pickuplines";

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: await this.translate(res.data.pickupline, "pt")
        };
    }

    async showerThought() {
        this.#url.pathname = "/showerthoughts";

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: await this.translate(res.data.result, "pt")
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

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: {
                title: res.data.title.split(" [")[0],
                img_url: res.data.image
            }
        };
    }

    async eightBall() {
        this.#url.pathname = "/8ball";

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return {
            success: true,
            data: await this.translate(res.data.answer, "pt")
        };
    }

    async translate(text, lang) {
        this.#url.pathname = "/translate";
        this.#url.searchParams.append("to", lang);
        this.#url.searchParams.append("text", text);

        const res = await this.req(this.#url.href);

        if (!res.success) {
            return {
                success: false,
                message: res.message
            }
        }

        return res.data.translated;
    }

    async req(url) {
        try {
            const { data } = await axios.get(url);

            if (data.error) {
                return {
                    success: false,
                    message: await this.translate(data.error, "pt")
                }
            }

            return {
                success: true,
                data
            }
        } catch (error) {
            return {
                success: false,
                message: "Não foi possível."
            }
        }
    }
}
