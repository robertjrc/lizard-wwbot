import { Group } from "group-analyzer";

export class TimeoutVerifyService {
    static async on(groupId, memberId) {
        const response = (await Group.timeoutVerify(groupId, memberId)).data
        return { success: response };
    }
}
