import pkg from "guess-flag";
import { isAdmin } from "../helpers/isAdmin.js";
import { MessageMedia } from "../lib/wwbotjs.js";

const { Group, Player } = pkg;

let singlePlayer = false;

export class FlagService {
    #group = Group;
    #player = Player;
    #text = "*VOCÊ CONHECE ESSA BANDEIRA?*\n\n";

    constructor(groupId, userId, chat, msg) {
        this.groupId = groupId;
        this.userId = userId;
        this.chat = chat;
        this.msg = msg;
    }

    async run(playerResponse, client) {
        const response = await this.#group.getById(this.groupId);

        if (!response.success) return await this.msg.reply('Use "start" para iniciar o jogo.');
        if (!response.data.status) return await this.msg.reply("O jogo está parado.");

        let { data } = response;

        const alternatives = data.current_info.alternatives;

        const _alternatives = {
            "A": alternatives[0],
            "B": alternatives[1],
            "C": alternatives[2],
            "D": alternatives[3]
        }

        let player = data.players.find(x => x.id === this.userId);

        if (!player) {
            const playerForm = {
                id: this.userId,
                name: this.msg._data.notifyName.split(" ")[0]
            }

            player = this.#player.create(playerForm);

            data.players.push(player);
        }

        if (!_alternatives[playerResponse.toUpperCase()]) return;

        if (_alternatives[playerResponse.toUpperCase()] === data.current_info.flag_name) {
            if (singlePlayer) return;
            singlePlayer = true;

            await this.msg.react("✅");

            const playerWon = this.#player.won(player, data.level);

            player = playerWon;

            data[data.current_info.flags_difficulty] = this.#group.removeFlag(
                data[data.current_info.flags_difficulty],
                data.current_info.flag_name
            );

            const checkedResponse = this.#group.flagCheck(
                data[data.current_info.flags_difficulty],
                data.current_info.flags_difficulty
            );

            if (checkedResponse.success) data[data.current_info.flags_difficulty] = checkedResponse.flags;

            data = this.#group.setFlag(data);

            if (data.moves % 10 === 0) await this.msg.reply(this.#group.overallScore(data.players));

            this.#text += `${this.#alternativesDisplay(data.current_info.alternatives)}`;
            this.#text += `Partida: *${data.moves}°*\n`;
            this.#text += this.#group.levelSwitch(data.level);

            const message = await client.getMessageById(data.current_info.message_id);
            if (message) await message.delete(true);

            const { id } = await this.chat.sendMessage(
                await MessageMedia.fromUrl(data.current_info.flag_img),
                { caption: this.#text }
            );

            data.current_info.message_id = id._serialized;

            await this.#group.save(this.groupId, data);

            singlePlayer = false;

            return;
        }

        const playerLose = this.#player.lose(player);

        player = playerLose;

        await this.#group.save(this.groupId, data);

        return await this.msg.react("❌");
    }

    async start(client) {
        if (!(await isAdmin(client, this.chat, this.userId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para iniciar o jogo.");
        }

        const response = await this.#group.getById(this.groupId);
        if (!response.success) {
            const groupForm = { id: this.groupId, name: this.chat.name };

            const groupCreatedResponse = await this.#group.create(groupForm);
            if (!groupCreatedResponse.success) return await this.msg.reply(groupCreatedResponse.message);

            const { data } = groupCreatedResponse;

            this.#text += `${this.#alternativesDisplay(data.current_info.alternatives)}`;
            this.#text += `Partida: *${data.moves}°*\n`;
            this.#text += this.#group.levelSwitch(data.level);

            const { id } = await this.chat.sendMessage(
                await MessageMedia.fromUrl(data.current_info.flag_img),
                { caption: this.#text }
            );

            data.current_info.message_id = id._serialized;

            await this.#group.save(this.groupId, data);

            return await this.msg.react("✅");
        }

        const { data } = response;

        if (data.status) return await this.msg.reply("O jogo já foi iniciado.")

        this.#text += `${this.#alternativesDisplay(data.current_info.alternatives)}`;
        this.#text += `Partida: *${data.moves}°*\n`;
        this.#text += this.#group.levelSwitch(data.level);

        const media = await MessageMedia.fromUrl(data.current_info.flag_img);
        const { id } = await this.chat.sendMessage(media, { caption: this.#text });

        data.current_info.message_id = id._serialized;
        data.status = true;

        await Group.save(this.groupId, data);

        return await this.msg.react("✅");
    }

    async stop(client) {
        if (!(await isAdmin(client, this.chat, this.userId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para parar o jogo.");
        }

        const response = await this.#group.getById(this.groupId);

        if (!response.success) return await this.msg.reply("O jogo não foi inicializado.");
        if (!response.data.status) return await this.msg.reply("O jogo já está parado.");

        response.data.status = false

        await this.#group.save(this.groupId, response.data);

        return await this.msg.react("✅");
    }

    async reset(client) {
        if (!(await isAdmin(client, this.chat, this.userId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para resetar o jogo.");
        }

        const response = await this.#group.getById(this.groupId);
        if (!response.success) return await this.msg.reply("O jogo não foi inicializado.");

        const { message_id } = response.data.current_info;

        const message = await client.getMessageById(message_id);
        if (message) await message.delete(true);

        const resetResponse = await this.#group.reset({ id: response.data.id, name: response.data.name });
        response.data = resetResponse.data;

        const { data } = response;

        this.#text += `${this.#alternativesDisplay(data.current_info.alternatives)}`;
        this.#text += `Partida: *${data.moves}°*\n`;
        this.#text += this.#group.levelSwitch(data.level);

        const { id } = await this.chat.sendMessage(
            await MessageMedia.fromUrl(data.current_info.flag_img),
            { caption: this.#text }
        );

        data.current_info.message_id = id._serialized;

        await this.#group.save(this.groupId, data);

        return await this.msg.react("✅");
    }

    #alternativesDisplay(alternatives) {
        let text = "";

        text += `*A)* ${alternatives[0]}\n`
        text += `*B)* ${alternatives[1]}\n`
        text += `*C)* ${alternatives[2]}\n`
        text += `*D)* ${alternatives[3]}\n\n`

        return text;
    }
}
