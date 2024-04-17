import { User } from "src/users/database/entity/users.entity";
export declare enum MatchState {
    PENDING = "PENDING",
    MATCH = "MATCH",
    REJECT = "REJECT",
    EXPIRE = "EXPIRE"
}
export declare class DevMatch {
    id: number;
    sender: User;
    receiver: User;
    status: string;
    createdAt: string;
}
