import { RNG } from "../../utils/RNG.js";

export default {
    name: "coinflip",
    category: "diversão",
    desc: `
        Simula o lançamento de uma
        moeda e retorna aleatoriamente
        cara ou coroa.
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg) {
        const result = RNG(2, 0);

        let text = (result === 0) ? "Deu Cara!" : "Deu Coroa!";

        return await msg.reply(text);
    }
}
