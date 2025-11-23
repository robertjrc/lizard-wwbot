import { Group, Player } from "trivia";
import { isAdmin } from "../helpers/isAdmin.js";

let singlePlayer = false;

export class TriviaService {
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

        const alternatives = data.current_info.alternatives;

        const _alternatives = {
            "A": alternatives[0],
            "B": alternatives[1],
            "C": alternatives[2],
            "D": alternatives[3]
        }

        let player = data.players.find(x => x.id === this.playerId);

        if (!player) {
            const playerForm = {
                id: this.playerId,
                name: this.msg._data.notifyName.split(" ")[0]
            }

            player = this.#player.create(playerForm).data;

            data.players.push(player);
        }

        if (!_alternatives[playerResponse.toUpperCase()]) return;

        if (_alternatives[playerResponse.toUpperCase()] === data.current_info.response) {
            if (singlePlayer) return;
            singlePlayer = true;

            await this.msg.react("✅");

            const playerWon = this.#player.correctAnswer(player).data;

            player = playerWon;

            data.questions = this.#group.removeQuestionById(data.questions, data.current_info.question_id).data;

            const isEmpty = await this.#group.isEmpty(data.questions);
            if (isEmpty.success) data.questions = isEmpty.data;

            data.current_info = this.#group.setQuestion(data).data;
            data.moves += 1;

            if (data.moves % 10 === 0) await this.msg.reply(this.#player.overallScore(data.players));

            this.#text += `*${data.moves}° ${data.current_info.question}*\n\n`;
            this.#text += `${this.#alternativesDisplay(data.current_info.alternatives)}`;

            const message = await client.getMessageById(data.current_info.message_id);
            if (message) await message.delete(true);

            await this.chat.sendStateTyping();
            await this.#delay(2000);
            data.current_info.message_id = (await this.chat.sendMessage(this.#text)).id._serialized;
            await this.chat.clearState();

            await this.#group.save(this.groupId, data);

            singlePlayer = false;

            return;
        }

        const playerLose = this.#player.wrongAnswer(player).data;

        player = playerLose;

        await this.#group.save(this.groupId, data);

        return await this.msg.react("❌");
    }

    async start(client) {
        if (!(await isAdmin(client, this.chat, this.playerId))) {
            return await this.msg.reply("Por favor, peça a um *admin* para iniciar o jogo.");
        }

        const response = await this.#group.getById(this.groupId);

        if (!response.success) {
            const groupForm = { id: this.groupId, name: this.chat.name };

            const group = (await this.#group.create(groupForm)).data;

            this.#text += `*${group.moves}° ${group.current_info.question}*\n\n`;
            this.#text += `${this.#alternativesDisplay(group.current_info.alternatives)}`;

            const { id } = await this.chat.sendMessage(this.#text);
            group.current_info.message_id = id._serialized;
            group.status = true;

            await this.#group.save(group.id, group);

            return await this.msg.react("✅");
        }

        const { data } = response;

        if (data.status) return await this.msg.reply("O jogo já foi iniciado.")

        this.#text += `*${data.moves}° ${data.current_info.question}*\n\n`;
        this.#text += `${this.#alternativesDisplay(data.current_info.alternatives)}`;

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

        const resetResponse = await this.#group.reset({ id: response.data.id, name: response.data.name });
        response.data = resetResponse.data;

        const { data } = response;

        this.#text += `*${data.moves}° ${data.current_info.question}*\n\n`;
        this.#text += `${this.#alternativesDisplay(data.current_info.alternatives)}`;

        const { id } = await this.chat.sendMessage(this.#text);

        data.current_info.message_id = id._serialized;

        await this.#group.save(this.groupId, data);

        return await this.msg.react("✅");
    }

    #alternativesDisplay(alternatives) {
        let text = "";

        text += `*A)* ${alternatives[0]}\n`
        text += `*B)* ${alternatives[1]}\n`
        text += `*C)* ${alternatives[2]}\n`
        text += `*D)* ${alternatives[3]}\n`

        return text;
    }

    #delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }
}
