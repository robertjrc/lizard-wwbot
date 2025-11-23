import NodeCache from "node-cache";

const contactsLidCache = new NodeCache();

export async function getContactLid(client, msgAuthor) {
    if(!msgAuthor) return;
    if (!contactsLidCache.get(msgAuthor)) {
        if (msgAuthor && msgAuthor.endsWith("@c.us")) {
            const contactId = (await client.getContactLidAndPhone(msgAuthor))[0].lid;

            contactsLidCache.set(contactId, contactId);

            return contactId;
        }

        contactsLidCache.set(msgAuthor, msgAuthor);

        return msgAuthor;
    }

    return contactsLidCache.get(msgAuthor);
}
