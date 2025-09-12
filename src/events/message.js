import messageHandler from "../handlers/messageHandler.js";

export default (client) => client.on("message", async msg => await messageHandler(client, msg));
