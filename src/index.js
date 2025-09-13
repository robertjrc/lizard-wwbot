import { Client, LocalAuth } from "./lib/wwbotjs.js";
import fs from "node:fs";
import path from "node:path";
import { importJson } from "./utils/importJson.js";
(await import("./utils/commandRegistry.js")).loadCommands();

const { ffmpeg_path, executable_path, args } = await importJson("src/config/settings.json");

const client = new Client({
    authStrategy: new LocalAuth(),
    ffmpegPath: ffmpeg_path,
    puppeteer: {
        timeout: 60000,
        executablePath: executable_path,
        ignoreHTTPSErrors: true,
        args
    },
})

client.initialize();

const eventsPath = path.join(process.cwd(), "src", "events");
const eventFile = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFile) {
    const event = (await import(path.join(eventsPath, file))).default;
    event(client);
}
