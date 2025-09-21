import { existsSync, mkdirSync } from "node:fs";
import fs from "node:fs/promises";
import { RNG } from "../utils/RNG.js";
import { join } from "node:path";
import { isAdmin } from "../helpers/isAdmin.js";
import { importJson } from "../utils/importJson.js";

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

        const member = data.members.find(x => x.id === this.userId);
        if (!member) {
            const newCm = this.#cmGenerator();

            const newMember = {
                id: this.userId,
                name: this.msg._data.notifyName.split(" ")[0],
                cm: newCm,
                lastRank: (data.members.length + 1),
                nextAttemp: this.#setAttemp(),
                isAlert: false
            }

            data.members.push(newMember);

            await this.#save(this.groupId, data);

            text += await this.#growMessage(`*${newMember.name}*`, `*${newCm}cm*`, `*${newMember.cm}cm*`);
            text += `você está em *${this.#getRank(data.members, newMember)}*° no ranque.\n\n`;
            text += `próxima tentativa às *${this.#formatDate(new Date(newMember.nextAttemp))}*.`;

            return await this.msg.reply(text);
        }

        if (!this.#isTime(member.nextAttemp)) {
            if (member.isAlert) return;

            const alertMessage = await this.#alertMessage(`*${member.name}*`, `*${this.#formatDate(new Date(member.nextAttemp))}*`);

            text += `${alertMessage}`;
            member.isAlert = true;

            await this.#save(this.groupId, data);

            return await this.msg.reply(text);
        }

        const newCm = this.#cmGenerator();

        let lastRank = this.#getRank(data.members, member);

        member.cm += newCm
        member.lastRank = lastRank
        member.nextAttemp = this.#setAttemp();
        member.isAlert = false;

        await this.#save(this.groupId, data);

        text += await this.#growMessage(`*${member.name}*`, `*${newCm}cm*`, `*${member.cm}cm*`);
        text += `você está em *${this.#getRank(data.members, member)}*° no ranque.\n\n`;
        text += `próxima tentativa às *${this.#formatDate(new Date(member.nextAttemp))}*.`;

        return await this.msg.reply(text);
    }

    async rank() {
        let text = "";

        text += "Ranque dos maiores *PINTOS*\n\n";

        const response = await this.#getGroupById(this.groupId);

        if (!response.success) return await this.msg.reply('Use "start" para iniciar o jogo.');
        if (!response.data.status) return await this.msg.reply("O jogo está parado.");

        const { data } = response;

        if (data.members.length === 0) return await this.chat.sendMessage(text += "seja o primeiro no ranque.\n");

        data.members.sort((x, y) => {
            return x.cm - y.cm;
        }).reverse();

        let index = 0;

        const topThreeMembers = data.members.slice(0, 3);
        const othersMembers = data.members.slice(3);
        const medals = ["🥇", "🥈", "🥉"];

        for (let i = 0; i < topThreeMembers.length; i++) {
            index += 1;
            text += `${index}° *@${topThreeMembers[i].name}* ─ ${topThreeMembers[i].cm}cm `;
            text += `${medals[i]} ${this.#arrowPosition(index, topThreeMembers[i].lastRank)}\n`;
        }

        for (let i = 0; i < othersMembers.length; i++) {
            index += 1;
            text += `${index}° *@${othersMembers[i].name}* ─ ${othersMembers[i].cm}cm `;
            text += `${this.#arrowPosition(index, othersMembers[i].lastRank)}\n`;
        }

        return await this.chat.sendMessage(text);
    }

    async start() {
        if (!isAdmin(this.chat, this.userId)) {
            return await this.msg.reply("Por favor, peça a um *admin* para iniciar o jogo.");
        }

        const response = await this.#getGroupById(this.groupId);

        if (!response.success) {
            const newGroup = {
                id: this.groupId,
                name: this.chat.name,
                members: [],
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

    async stop() {
        if (!isAdmin(this.chat, this.userId)) {
            return await this.msg.reply("Por favor, peça a um *admin* para parar o jogo.");
        }

        const response = await this.#getGroupById(this.groupId);

        if (!response.success) return await this.msg.reply("O jogo não foi inicializado.");
        if (!response.data.status) return await this.msg.reply("O jogo já está parado.");

        response.data.status = false

        await this.#save(this.groupId, response.data);

        return await this.msg.react("✅");
    }

    async reset() {
        if (!isAdmin(this.chat, this.userId)) {
            return await this.msg.reply("Por favor, peça a um *admin* para resetar o jogo.");
        }

        const response = await this.#getGroupById(this.groupId);
        if (!response.success) return await this.msg.reply("O jogo não foi inicializado.");

        const newGroup = {
            id: this.groupId,
            name: this.chat.name,
            members: [],
            status: true
        }

        await this.#save(this.groupId, newGroup);

        return await this.msg.react("✅");
    }

    async #getGroupById(id) {
        const filePath = `${this.#storagePath}/${id}.json`;

        if (!existsSync(filePath)) return { success: false }

        const data = JSON.parse(await fs.readFile(filePath, "utf8"));

        return {
            success: true,
            data
        }
    }

    async #save(id, data) {
        const filePath = `${this.#storagePath}/${id}.json`;
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }

    #setAttemp() {
        return Date.now() + (3 * 60 * 60 * 1000);
    }


    #getRank(members, member) {
        members.sort((x, y) => {
            return x.cm - y.cm;
        }).reverse();

        return (members.indexOf(member) + 1);
    }

    #cmGenerator() {
        return RNG(47, 1);
    }

    #isTime(time) {
        return ((time - Date.now()) < 0) ? true : false;
    }

    #formatDate(date) {
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }


    #arrowPosition(index, lastRank) {
        let text;

        if ((index) !== lastRank) {
            if ((index) < lastRank) {
                text = "⇧";
            } else if ((index) > lastRank) {
                text = "⇩";
            }
        } else {
            text = "";
        }

        return text;
    }

    async #alertMessage(playerName, time) {
        const messages = (await importJson("src/data/dickGrowerMessages.json")).alertMessages;

        let message = messages[RNG(messages.length, 0)];

        message = message.replace("#playername#", playerName);
        message = message.replace("#time#", time);

        return message;
    }

    async #growMessage(playerName, newCm, currentCm) {
        const messages = (await importJson("src/data/dickGrowerMessages.json")).growMessages;

        let message = messages[RNG(messages.length, 0)];

        message = message.replace("#playerName#", playerName);
        message = message.replace("#newCm#", newCm);
        message = message.replace("#currentCm#", currentCm);

        return `${message}\n\n`;
    }

    #init() {
        if (!existsSync(this.#storagePath)) {
            mkdirSync(this.#storagePath);
        }
    }
}

