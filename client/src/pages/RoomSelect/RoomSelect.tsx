import { useEffect, useState } from 'react';
import { server } from '../../lib/consts';
import type { Room } from '../../lib/types';

function Rooms({rooms} : {rooms: Room[]}){
    if (rooms.length <= 0) return <h1>No rooms available</h1>
    return rooms.map(room => {
        return (
            <input type="button" value={room.name}/>
        );
    });
}

export default function RoomSelect(){
    const [rooms, setRooms] = useState<Room[]>([]);
    useEffect(() => {
        fetch(`${server}/api/rooms`)
            .then(res => res.json())
            .then(data => setRooms(data));
    }, []);

    return(
        <>
            <Rooms rooms={rooms}/>
            <button>Create Room</button>
        </>
    );
}
