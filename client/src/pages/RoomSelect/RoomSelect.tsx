import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { server } from '../../lib/consts';
import type { Room, User } from '../../lib/types';
import styles from './RoomSelect.module.css';

function Rooms({rooms, onClick} : {rooms: Room[], onClick: (roomName: string) =>void}){
    if (rooms.length <= 0) return <h3>No rooms available</h3>
    return rooms.map(room => {
        return (
            <div className="rooms-container" key={room._id}>
                <label htmlFor="room">Room: </label>
                <input name="room" type="button" value={room.name} onClick={() => onClick(room.name)}/>
            </div>
        );
    });
}

export default function RoomSelect(){
    const [rooms, setRooms] = useState<Room[]>([]);
    const [user, setUser] = useState<User>();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${server}/api/rooms`)
            .then(res => res.json())
            .then(data => setRooms(data));

        const sessionUser = sessionStorage.getItem("User");

        if(!sessionUser) {
            navigate('/');
        }else{
            setUser(JSON.parse(sessionUser));
        }

    }, [navigate]);

    function makeRoom(){
        fetch(`${server}/api/rooms`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: user
            })
        })
            .then(res => res.json())
            .then(data => {
                setRooms(prev => [...prev, data])
            }); 
    }

    function onRoomClick(roomName : string){
        navigate(`/room/${roomName}`);
    }

    return(
        <div className={styles.container}>
            <h1>Rooms</h1>
            <Rooms rooms={rooms}
                onClick={onRoomClick}
            />
            <button onClick={makeRoom}>Create Room</button>
        </div>
    );
}
