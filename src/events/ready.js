export default (client) => {
    client.on("ready", async () => {
        global.uptime = Date.now();

        console.log("Client is ready! 🔥");
        console.log(`WhatsApp Web Client: ${await client.getWWebVersion()} 🛠️`);

        client.pupPage.on('pageerror', function(err) {
            console.log('Page error: ' + err.toString());
        });
        client.pupPage.on('error', function(err) {
            console.log('Page error: ' + err.toString());
        });
    });
}
