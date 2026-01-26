import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import fs from "node:fs/promises";
import { RNG } from "../utils/RNG.js";
import { join } from "node:path";
import { isAdmin } from "../helpers/isAdmin.js";
import { importJson } from "../utils/importJson.js";
import { timeDuration } from "../helpers/timeDuration.js";

export class DickGrowerService {
    #storagePath = join(process.cwd(), `${process.env.STORAGE_PATH}/dickgrower_storage`);

    constructor(groupId, userId, chat, msg) {
        this.groupId = groupId;
        this.userId = userId;
        this.chat = chat;
        this.msg = msg;

        this.#init();
    }

    async grow() {
        const response = await this.#getGroupById(this.groupId);

        if (!response.success) return await this.msg.reply('Use "start" para iniciar o jogo.');
        if (!response.data.status) return await this.msg.reply("O jogo está parado.");

        let text = "";

        const { data } = response;

        const resetResponse = await this.#endSeasonVerify(data);
        if (resetResponse.reseted) if (resetResponse.stop) return;

        const player = data.players.find(x => x.id === this.userId);
        const championsByPlayer = data.seasons.find(x => x.id === this.userId);
        const custBoost = 30;

        if (!player) {
            const newCm = this.#cmGenerator();

            const newCredit = this.#creditsCalc(newCm);

            const newPlayer = {
                id: this.userId,
                name: this.msg._data.notifyName.split(" ")[0],
                cm: newCm,
                credits: newCredit,
                lastRank: (data.players.length + 1),
                nextAttemp: this.#setAttemp(),
                isAlert: false
            }

            data.players.push(newPlayer);

            const medals = ["🥇", "🥈", "🥉"];
            const rank = this.#getRank(data.players, newPlayer);

            text += "📋️ Status do seu *Pinto* 📋️\n\n";
            text += `👤️ @${newPlayer.name} `;
            text += (championsByPlayer) ? ` ─ 🏆 *${championsByPlayer.victories}×*\n\n` : "\n\n";
            text += `🆕️ *Ganho:* +${newCm} cm ${(newCm >= 30) ? "🔥️" : " "}\n`;
            text += `🍆 *Total:* ${newPlayer.cm} cm\n`;
            text += `🪙 *Credit:* ${newPlayer.credits}/*${custBoost}* +${newCredit}\n`;
            text += `${(medals[rank - 1]) ? medals[rank - 1] : "💩️"} *Ranking:* ${rank}°\n\n`;
            text += `⏰ Nova tentativa às *${this.#formatDate(newPlayer.nextAttemp)}*`;

            await this.#save(this.groupId, data);

            return await this.msg.reply(text);
        }

        if (!this.#isTime(player.nextAttemp)) {
            if (player.isAlert) return;

            const alertMessage = await this.#alertMessage(`*${player.name}*`, `*${this.#formatDate(player.nextAttemp)}*`);

            text += `${alertMessage}`;
            player.isAlert = true;

            await this.#save(this.groupId, data);

            return await this.msg.reply(text);
        }

        let newCm = this.#cmGenerator();
        let lastRank = this.#getRank(data.players, player);
        let isBoost = false;

        const newCredit = this.#creditsCalc(newCm);

        player.credits += newCredit;
        player.lastRank = lastRank;
        player.nextAttemp = this.#setAttemp();
        player.isAlert = false;

        if (player.credits >= custBoost) {
            player.cm += newCm * 3;
            player.credits -= custBoost;
            isBoost = true;
        } else {
            player.cm += newCm;
        }

        data.players.sort((x, y) => {
            return x.cm - y.cm;
        }).reverse();

        await this.#save(this.groupId, data);

        const medals = ["🥇", "🥈", "🥉"];
        const rank = this.#getRank(data.players, player);

        text += "📋️ Status do seu *Pinto* 📋️\n\n";
        text += `👤️ @${player.name}`;
        text += (championsByPlayer) ? ` ─ 🏆 *${championsByPlayer.victories}×*\n\n` : "\n\n";
        text += `🆕️ *Ganho:* +${newCm} cm ${(newCm >= 30) ? "🔥️" : ""} ${(isBoost ? "(3×)" : "")}\n`;
        text += "🍆 *Total:* ";
        text += (isBoost) ? `${player.cm - newCm} ➟ ${player.cm} cm\n` : `${player.cm} cm\n`;
        text += `🪙 *Credit:* ${player.credits}/*${custBoost}* +${newCredit}\n`;
        text += `${(medals[rank - 1]) ? medals[rank - 1] : "💩️"} *Ranking:* ${rank}° ${this.#arrowPosition(rank, lastRank)}\n\n`;
        text += `⏰ Nova tentativa às *${this.#formatDate(player.nextAttemp)}*`;

        return await this.msg.reply(text);
    }

    async rank() {
        const response = await this.#getGroupById(this.groupId);

        if (!response.success) return await this.msg.reply('Use "start" para iniciar o jogo.');
        if (!response.data.status) return await this.msg.reply("O jogo está parado.");
        const { data } = response;

        let text = `🏆 *Pinto de Ouro ${data.currentSeason.season}* 🏆\n\n`;

        const resetResponse = await this.#endSeasonVerify(data);
        if (resetResponse.reseted) if (resetResponse.stop) return;

        if (data.players.length === 0) return await this.chat.sendMessage(text += "seja o primeiro no rank.\n");

        data.players.sort((x, y) => {
            return x.cm - y.cm;
        }).reverse();

        let index = 0;

        const topThreePlayers = data.players.slice(0, 3);
        const othersPlayers = data.players.slice(3);
        const medals = ["🥇", "🥈", "🥉"];

        for (let i = 0; i < topThreePlayers.length; i++) {
            index += 1;
            text += `${medals[i]} *@${topThreePlayers[i].name}* ─ ${topThreePlayers[i].cm} cm `;
            text += `${this.#arrowPosition(index, topThreePlayers[i].lastRank)}\n`;
        }

        for (let i = 0; i < othersPlayers.length; i++) {
            index += 1;
            text += ` ${index}° @${othersPlayers[i].name} ─ ${othersPlayers[i].cm} cm `;
            text += `${this.#arrowPosition(index, othersPlayers[i].lastRank)}\n`;
        }

        text += `\n⏳ *TEMPORADA ${data.currentSeason.season + 1}* | ${this.#timeDuration(data.seasonTime)}`;

        return await this.chat.sendMessage(text);
    }

    async seasons() {
        const response = await this.#getGroupById(this.groupId);

        if (!response.success) return await this.msg.reply('Use "start" para iniciar o jogo.');
        if (!response.data.status) return await this.msg.reply("O jogo está parado.");
        const { data } = response;

        let text = "🏆 *Pinto de Ouro* 🏆\n\n";

        if (data.seasons.length === 0) return await this.chat.sendMessage(text += "nenhum vencedor ainda.\n");

        data.seasons.sort((x, y) => {
            return x.victories - y.victories
        }).reverse();

        let index = 0;

        for (let i = 0; i < data.seasons.length; i++) {
            index += 1;
            text += `${index}° *@${data.seasons[i].name}* ─ 🏆 ${data.seasons[i].victories}×\n`;
        }

        return await this.chat.sendMessage(text);
    }

    async start(client) {
        if (!(await isAdmin(client, this.chat, this.userId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para iniciar o jogo.");
        }

        const response = await this.#getGroupById(this.groupId);

        if (!response.success) {
            const newGroup = {
                id: this.groupId,
                name: this.chat.name,
                players: [],
                currentSeason: {
                    season: 1,
                    createdAt: Date.now()
                },
                seasons: [],
                seasonTime: this.#setSeasonTime(),
                status: true
            }

            await this.#save(this.groupId, newGroup);

            return await this.msg.react("✅");
        }

        const { data } = response;

        if (data.status) return await this.msg.reply("O jogo já foi iniciado.");

        data.status = true;

        await this.#save(this.groupId, data);

        return await this.msg.react("✅");
    }

    async stop(client) {
        if (!(await isAdmin(client, this.chat, this.userId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para parar o jogo.");
        }

        const response = await this.#getGroupById(this.groupId);

        if (!response.success) return await this.msg.reply("O jogo não foi inicializado.");
        if (!response.data.status) return await this.msg.reply("O jogo já está parado.");

        response.data.status = false

        await this.#save(this.groupId, response.data);

        return await this.msg.react("✅");
    }

    async reset(client) {
        if (!(await isAdmin(client, this.chat, this.userId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para resetar o jogo.");
        }

        const response = await this.#getGroupById(this.groupId);
        if (!response.success) return await this.msg.reply("O jogo não foi inicializado.");

        const newGroup = {
            id: this.groupId,
            name: this.chat.name,
            players: [],
            currentSeason: {
                season: 1,
                createdAt: Date.now()
            },
            seasons: [],
            seasonTime: this.#setSeasonTime(),
            status: true
        }

        await this.#save(this.groupId, newGroup);

        return await this.msg.react("✅");
    }

    async #getGroupById(id) {
        const filePath = `${this.#storagePath}/${id}.json`;

        if (!existsSync(filePath)) return { success: false }

        const contect = await fs.readFile(filePath, "utf8");
        const data = JSON.parse(contect);

        return {
            success: true,
            data
        }
    }

    async #save(id, data) {
        writeFileSync(
            `${this.#storagePath}/${id}.json`,
            JSON.stringify(data, null, 2)
        );
    }

    #setAttemp() {
        return Date.now() + (3 * 60 * 60 * 1000);
    }

    #getRank(players, player) {
        players.sort((x, y) => {
            return x.cm - y.cm;
        }).reverse();

        return (players.indexOf(player) + 1);
    }

    #cmGenerator() {
        return RNG(47, 1);
    }

    #isTime(time) {
        return ((time - Date.now()) < 0) ? true : false;
    }

    #timeDuration(date) {
        return timeDuration(date, "future");
    }

    #formatDate(date) {
        return new Date(date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }

    #arrowPosition(currRank, lastRank) {
        let text;

        if (currRank < lastRank) {
            text = "⇧";
        } else if (currRank > lastRank) {
            text = "⇩";
        } else { text = ""; }

        return text;
    }

    #creditsCalc(cm) {
        let credits = 0;

        const table = [
            { min: 1, max: 4, credit: 10 },
            { min: 5, max: 9, credit: 7 },
            { min: 10, max: 19, credit: 5 },
            { min: 20, max: 34, credit: 3 },
            { min: 35, max: 46, credit: 1 }
        ];

        for (let credit of table) {
            if (cm >= credit.min && cm <= credit.max) credits = credit.credit;
        }

        return credits;
    }

    #resetSeason(data) {
        if (data.players.length === 0) {
            data.players = [];
            data.seasonTime = this.#setSeasonTime();

            return data;
        }

        let topPlayer = data.players[0];

        data.players = [];
        data.seasonTime = this.#setSeasonTime();

        const topPlayerExist = data.seasons.find(x => x.id === topPlayer.id);

        if (!topPlayerExist) {
            data.seasons.push({
                id: topPlayer.id,
                name: topPlayer.name,
                victories: 1
            });
        } else {
            topPlayerExist.victories += 1;
        }

        data.currentSeason.season += 1;
        data.currentSeason.createdAt = Date.now();

        return data;
    }

    #setSeasonTime() {
        let date = new Date();
        let day = date.getDay();

        if (day === 0) {
            date.setDate(date.getDate() + 7);
            date.setHours(0, 0, 0);
            return date.getTime();
        }

        let lastWeekDay = 6;
        let daysRemaining = lastWeekDay - day;

        date.setDate(date.getDate() + daysRemaining + 1);
        date.setHours(0, 0, 0);

        return date.getTime();
    }

    async #endSeasonVerify(data) {
        if (data.seasonTime < Date.now()) {
            if (data.players.length > 0) {
                data.players = (data.players.sort((x, y) => {
                    return x.cm - y.cm
                }).reverse());

                let text = `Fim da *TEMPORADA* #season01# 🏆️\n\n`;

                text += "🥇 *@#playername#* venceu o *Pinto de Ouro* #season02# com *#playercm# cm* de ";
                text += "pinto pulsando e jorrando leite quente na cara dos perdedores.\n\n";

                const currentSeason = data.currentSeason.season;

                text = text.replace("#season01#", currentSeason);
                text = text.replace("#season02#", currentSeason);
                text = text.replace("#playername#", data.players[0].name);
                text = text.replace("#playercm#", data.players[0].cm);

                if (data.players.length >= 3) {
                    text += `🥈 *@${data.players[1].name}* ─ ${data.players[1].cm} cm\n`;
                    text += `🥉 *@${data.players[2].name}* ─ ${data.players[2].cm} cm \n`;
                }

                this.#resetSeason(data);

                await this.chat.sendMessage(text);
                await this.#save(this.groupId, data);

                return {
                    reseted: true,
                    stop: true
                }
            }

            this.#resetSeason(data);
            await this.#save(this.groupId, data);

            return {
                reseted: true,
                stop: false
            }
        }

        return {
            reseted: false,
        }
    }

    async #alertMessage(playerName, time) {
        const messages = (await importJson("src/data/dickGrowerMessages.json")).alertMessages;

        let message = messages[RNG(messages.length, 0)];

        message = message.replace("#playername#", playerName);
        message = message.replace("#time#", time);

        return message;
    }

    #init() {
        if (!existsSync(this.#storagePath)) {
            mkdirSync(this.#storagePath);
        }
    }
}

