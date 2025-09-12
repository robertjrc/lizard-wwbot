import axios from "axios";

export async function axdl(url) {
    try {
        return (await axios.get(url, { responseType: "arraybuffer" })).data.toString("base64");
    } catch (error) { return new Error(error); }
}
