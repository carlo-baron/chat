export type User = {
    _id: string;
    name: string;
    inUse: boolean;
};

export type Room = {
    name: string;
    users: User[];
    maxSize: number;
};

export type Chat = {
    sender: User,
    message: string
};

