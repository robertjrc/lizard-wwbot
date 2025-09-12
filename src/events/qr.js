import qrcode from "qrcode-terminal";

export default (client) => client.on("qr", qr => { qrcode.generate(qr, { small: true }) });
