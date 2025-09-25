export async function getContactLid(client, msgAuthor) {
    return (msgAuthor && msgAuthor.endsWith("@c.us")
        ? (await client.getContactLidAndPhone(msgAuthor))[0].lid
        : msgAuthor.author);
}
