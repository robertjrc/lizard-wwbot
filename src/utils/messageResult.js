export function msgResult(type, { title, message }) {
    const msgTypes = {
        "alert": "⚠️",
        "error": "❎",
        "success": "✅"
    }

    let text = `> ${msgTypes[type]} *${title.toUpperCase()}*`;
    text += (!message) ? "" : `\n\n${message}`;

    return text;
}
