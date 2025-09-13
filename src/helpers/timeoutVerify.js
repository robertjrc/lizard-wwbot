import { Group } from "group-analyzer";

export async function timeoutVerify(groupId, memberId) {
    return (await Group.timeoutVerify(groupId, memberId)).data
}
