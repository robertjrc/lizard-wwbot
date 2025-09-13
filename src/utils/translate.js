import axios from "axios";
import { URL } from "node:url";
import { importJson } from "../utils/importJson.js";

const { popcat_api } = await importJson("src/data/URLs.json");

export async function translate(text, lang) {
    const url = new URL(popcat_api);

    url.pathname = "/translate";
    url.searchParams.append("to", lang);
    url.searchParams.append("text", text);

    const { status, data } = await axios.get(url.href);

    return (status !== 200) ? "Não foi possível traduzir." : data.translated;
}
