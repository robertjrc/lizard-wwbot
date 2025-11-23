import { Group, Player } from "hangman-game";
import { isAdmin } from "../helpers/isAdmin.js";

export class HangmanGameService {
    #group = Group;
    #player = Player;
    #text = "";

    constructor(groupId, playerId, chat, msg) {
        this.groupId = groupId;
        this.playerId = playerId;
        this.chat = chat;
        this.msg = msg;
    }

    async run(playerResponse, client) {
        const response = await this.#group.getById(this.groupId);

        if (!response.success) return await this.msg.reply('Use "start" para iniciar o jogo.');
        if (!response.data.status) return await this.msg.reply("O jogo está parado.");

        let { data } = response;

        let player = data.players.find(x => x.id === this.playerId);

        if (!player) {
            const playerForm = {
                id: this.playerId,
                name: this.msg._data.notifyName.split(" ")
            }

            player = this.#player.create(playerForm);

            data.players.push(player);
        }

        if (this.#group.charExist(data.current_info.chars, playerResponse.toLowerCase())) return;

        const charResponse = this.#group.findChar(playerResponse, data.current_info);

        if (charResponse.success) {
            await this.msg.react("✅");

            data.current_info = charResponse.data;

            const isFinalResponse = this.#group.isMatch(data.current_info);

            if (isFinalResponse) {
                const playerWon = this.#player.correctAnswer(player);

                player = playerWon;

                data.words = this.#group.removeWordById(data.words, data.current_info.word_id);

                const isWordEmptyResponse = await this.#group.isEmpty(data);
                if (isWordEmptyResponse.success) data.words = isWordEmptyResponse.data;

                data.current_info = this.#group.newWord(data);
                data.moves += 1;

                if (data.moves % 10 === 0) await this.msg.reply(this.#player.overallScore(data.players));

                this.#text = `${data.moves}° ${this.#display(data.current_info)}`;

                const message = await client.getMessageById(data.current_info.message_id);
                if (message) await message.delete(true);

                await this.chat.sendStateTyping();
                await this.#delay(1000);
                data.current_info.message_id = (await this.chat.sendMessage(this.#text)).id._serialized;
                await this.chat.clearState();

                await this.#group.save(this.groupId, data);
                return;
            }

            this.#text = `${data.moves}° ${this.#display(data.current_info)}`;

            const message = await client.getMessageById(data.current_info.message_id);
            if (message) await message.delete(true);

            await this.chat.sendStateTyping();
            await this.#delay(1000);
            data.current_info.message_id = (await this.chat.sendMessage(this.#text)).id._serialized;
            await this.chat.clearState();

            await this.#group.save(this.groupId, data);
            return;
        }

        data.current_info = charResponse.data;

        await this.msg.react("❌");

        const hangmanResponse = this.#group.hangmanVerify(data.current_info.hangman_level);

        if (hangmanResponse) {
            const playerLose = this.#player.wrongAnswer(player);
            player = playerLose;

            data.current_info = this.#group.newWord(data);

            this.#text = `${data.moves}° ${this.#display(data.current_info)}`;

            const message = await client.getMessageById(data.current_info.message_id);
            if (message) await message.delete(true);

            await this.chat.sendStateTyping();
            await this.#delay(1000);
            data.current_info.message_id = (await this.chat.sendMessage(this.#text)).id._serialized;
            await this.chat.clearState();

            await this.#group.save(this.groupId, data);

            return;
        }

        this.#text = `${data.moves}° ${this.#display(data.current_info)}`;

        const message = await client.getMessageById(data.current_info.message_id);
        if (message) await message.delete(true);

        await this.chat.sendStateTyping();
        await this.#delay(1000);
        data.current_info.message_id = (await this.chat.sendMessage(this.#text)).id._serialized;
        await this.chat.clearState();

        await this.#group.save(this.groupId, data);

        return;
    }

    async start(client) {
        if (!(await isAdmin(client, this.chat, this.playerId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para iniciar o jogo.");
        }

        const response = await this.#group.getById(this.groupId);

        if (!response.success) {
            const groupForm = { id: this.groupId, name: this.chat.name };

            const group = (await this.#group.create(groupForm)).data;

            this.#text = `${group.moves}° ${this.#display(group.current_info)}`;

            const { id } = await this.chat.sendMessage(this.#text);
            group.current_info.message_id = id._serialized;
            group.status = true;

            await this.#group.save(group.id, group);

            return await this.msg.react("✅");
        }

        const { data } = response;

        if (data.status) return await this.msg.reply("O jogo já foi iniciado.")

        this.#text = `${data.moves}° ${this.#display(data.current_info)}`;

        const { id } = await this.chat.sendMessage(this.#text);
        data.current_info.message_id = id._serialized;
        data.status = true;

        await this.#group.save(data.id, data);

        return await this.msg.react("✅");
    }

    async stop(client) {
        if (!(await isAdmin(client, this.chat, this.playerId))) {
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
        if (!(await isAdmin(client, this.chat, this.playerId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para resetar o jogo.");
        }

        const response = await this.#group.getById(this.groupId);
        if (!response.success) return await this.msg.reply("O jogo não foi inicializado.");

        const { message_id } = response.data.current_info;

        const message = await client.getMessageById(message_id);
        if (message) await message.delete(true);

        response.data = await this.#group.reset({ id: response.data.id, name: response.data.name });

        const { data } = response;

        this.#text = `${data.moves}° ${this.#display(data.current_info)}`;

        const { id } = await this.chat.sendMessage(this.#text);

        data.current_info.message_id = id._serialized;

        await this.#group.save(this.groupId, data);

        return await this.msg.react("✅");
    }

    #display(info) {
        let text = "";

        text += `*${info.hint}*\n`
        text += `${this.#group.getHangmanStatus(info.hangman_level)}\n`
        text += `*${info.traits.join(" ")}* (${info.traits.length} letras)`

        return text;
    }

    #delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
}
