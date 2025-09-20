import { setAuidoFilter } from "../helpers/setAudioFilter.js";
import { importJson } from "../utils/importJson.js";
import { timeDuration } from "../helpers/timeDuration.js";
import NodeCache from "node-cache";

const setEffectCache = new NodeCache({ stdTTL: 600, checkperiod: 1200 });
const filters = await importJson("src/data/ffmpegFilters.json");

export class AudioEffectService {
    async setEffect(media, filter) {
        try {
            const data = await setAuidoFilter(media, filters[filter]);

            return {
                success: true,
                data: data.toString(),
            }
        } catch (error) {
            console.error(error);
            return {
                success: false,
                message: "Não foi possível converter."
            };
        }
    }

    getEffect(filter) {
        return (!filters[filter]) ? false : true;
    }

    getEffects() {
        return filters;
    }

    nextEffect(userId, songLength) {
        if (setEffectCache.has(userId)) {
            const userTime = setEffectCache.get(userId);

            if (userTime - Date.now() > 0) return {
                success: false,
                message: `Aguarde *${timeDuration(userTime, "future")}* para usar o efeito.`
            }
            setEffectCache.del(userId);
        }

        setEffectCache.set(userId, Date.now() + (songLength * 1000));
        return { success: true };
    }
}
