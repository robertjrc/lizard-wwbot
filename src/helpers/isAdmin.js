export async function isAdmin(client, chat, userId) {
    const pn = (userId && userId.endsWith("@lid")
        ? (await client.getContactLidAndPhone(userId))[0].pn
        : userId);

    return (chat.participants.find((user) => user.id._serialized === pn)).isAdmin;
}
