import { RNG } from "../../utils/RNG.js";
import { msgResult } from "../../utils/messageResult.js";

export default {
    name: "slot",
    params: ["<cash>", "<info>"],
    category: "diversão",
    desc: `
    `.replace(/\s+/g, ' ').trim(),
    async execute(msg, { args }) {
        if (!args) {
            return msg.reply(msgResult("alert", {
                title: "sem parâmetro",
                message: "Por favor, forneça o *cash*."
            }));
        }

        let text = "Máquina caça-níquel 🎰\n\n";

        const payLines = [
            { number: 1, icon: "🍒", award: 1, expect: 3 },
            { number: 2, icon: "⭐", award: 3, expect: 6 },
            { number: 3, icon: "💎", award: 5, expect: 9 }
        ]

        if (args === "info") {
            text += `~| ${payLines[0].icon} | ${payLines[0].icon} | ${payLines[0].icon} |~ = *${payLines[0].award}×*\n`;
            text += `~| ${payLines[1].icon} | ${payLines[1].icon} | ${payLines[1].icon} |~ = *${payLines[1].award}×*\n`;
            text += `~| ${payLines[2].icon} | ${payLines[2].icon} | ${payLines[2].icon} |~ = *${payLines[2].award}×*\n`;

            return await msg.reply(text);
        }

        const isNum = args.match('^[0-9]+$');

        if (!isNum) {
            return msg.reply(msgResult("alert", {
                title: "parâmetro inválido",
                message: "Por favor, forneça um parâmetro válido."
            }));
        };

        let slots = [[], [], []];
        let expectValues = [];
        let sumValues = 0;
        let payLineInfo = 0;
        let lines = [];
        let earnings = 0;
        let minCash = 50;
        let maxCash = 100000;
        let cash = Number(args);
        const numFormat = (value) => (value).toLocaleString("pt-BR");

        if (cash < minCash) {
            return msg.reply(msgResult("alert", {
                title: "valor mínimo",
                message: `Cash mínimo de *$${numFormat(minCash)}.*`
            }));
        }

        if (cash > maxCash) {
            return msg.reply(msgResult("alert", {
                title: "valor máximo",
                message: `Cash máximo de *$${numFormat(maxCash)}.*`
            }));
        }

        for (let i = 0; i < slots.length; i++) {
            sumValues = 0
            for (let j = 0; j < 3; j++) {
                let newFigure = payLines[RNG(3, 0)];
                sumValues += newFigure.number;
                slots[i].push(newFigure);
            }
            expectValues.push(sumValues);
        }

        const findPayLine = () => {
            for (let j = 0; j < slots.length; j++) {
                const figure = payLines.filter(x => x.expect === expectValues[j]);
                const iconsIgual = (slots) => slots.icon === figure[0].icon;
                if (!figure[0]) continue;

                if (slots[j].every(iconsIgual)) {
                    lines.push(j);
                    payLineInfo = figure[0];
                    earnings += figure[0].award;
                }
            }
        }

        findPayLine();

        const cashEarned = (payLineInfo) ? cash * earnings : 0;

        const winLines = (line, lines, value) => {
            return (lines.find(x => x === value) !== undefined) ? `~${line}~ ✨` : `${line}`;
        }

        let line01 = `| ${slots[0][0].icon} | ${slots[0][1].icon} | ${slots[0][2].icon} |`;
        let line02 = `| ${slots[1][0].icon} | ${slots[1][1].icon} | ${slots[1][2].icon} |`;
        let line03 = `| ${slots[2][0].icon} | ${slots[2][1].icon} | ${slots[2][2].icon} |`;

        text += `${winLines(line01, lines, 0)}\n`;
        text += `${winLines(line02, lines, 1)}\n`;
        text += `${winLines(line03, lines, 2)}\n`;

        text += (cashEarned > 0) ? `\n*CASH:*  $${numFormat(cashEarned)} (*${earnings}x*)` : "";

        return await msg.reply(text);
    }
}
