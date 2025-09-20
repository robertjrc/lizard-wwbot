import { Group } from "group-analyzer";
import NodeCache from "node-cache";

const usersStorage = new NodeCache({ stdTTL: 300, checkperiod: 600 });

export class AntiSpamService {
    static #messageLimit = 3;
    static #imeWindow = 10000;

    static async check(groupId, memberId) {
        const now = Date.now();
        if (!usersStorage.has(memberId)) {
            usersStorage.set(memberId, { count: 1, firstMessageTime: now });
            return { success: true };
        }

        const { count, firstMessageTime } = usersStorage.get(memberId);

        if (now - firstMessageTime < AntiSpamService.#imeWindow) {
            if (count < AntiSpamService.#messageLimit) {
                let data = usersStorage.get(memberId);
                data.count += 1;
                usersStorage.set(memberId, data);
                return { success: true };
            }

            const response = await this.#setTimemout(groupId, memberId);

            let text = `Duração: *${response.timeRef}*\n`;
            text += `Motivo: *${response.reason}*\n\n`;
            text += "Durante esse período, você não poderá usar os comandos do bot."

            return { success: true, message: text };
        }

        usersStorage.set(memberId, { count: 1, firstMessageTime: now });
        return { success: true };
    }

    static async #setTimemout(groupId, memberId) {
        const timeoutForm = {
            timeRef: "30m",
            reason: "Uso excessivo de comandos."
        }

        await Group.setTimeout(groupId, memberId, timeoutForm);

        return timeoutForm;
    }
}
