export function isAdmin(chat, userId) {
    return (chat.participants.find((user) => user.id._serialized === userId)).isAdmin; 
}
