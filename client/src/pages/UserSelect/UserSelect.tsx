import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styles from './UserSelect.module.css';

const server = "http://localhost:3000";

function Users({userName, onClick} : {userName: string; onClick: () => void}){
    return(
        <button onClick={onClick}>{userName}</button>
    );
}

type User = {
    _id: string,
    name: string,
    inUse: boolean
};

export default function UserSelect(){
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${server}/api/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.log(`Server Error: ${err}`));
    }, []);

    function onUserClick(user: User){
        fetch(`${server}/api/users/${user._id}`, {
            method: 'PUT',
        })
            .then(res => res.json())
            .then(data => {
                setUsers(prev => prev.filter(u => u._id !== user._id));
                navigate(`chat/${data._id}`);
            });
    }

    const mappedUsers = users.map(user => {
        return(
            <Users
                userName={user.name}
                onClick={() => onUserClick(user)}
            />
        );
    });

    return(
        <>
            <h1>User Select</h1>
            {mappedUsers}
        </>
    );
}
