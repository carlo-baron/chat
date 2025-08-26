export type User = {
    _id: string;
    name: string;
    inUse: boolean;
};

export type Room = {
    _id: string;
    creator_id: string;
    name: string;
    users: User[];
    maxSize: number;
};

export type Chat = {
    _id: string;
    sender: User,
    message: string
};

