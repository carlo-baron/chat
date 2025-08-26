import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { server } from '../../lib/consts';
import type { User } from '../../lib/types';
import styles from './UserSelect.module.css';


function Users({user, onClick} : {user: User; onClick: () => void}){
    return(
        <button onClick={onClick}>{user.name}</button>
    );
}

export default function UserSelect(){
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.clear();
        fetch(`${server}/api/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.log(`Server Error: ${err}`));
    }, []);

    function onUserClick(user: User){
        sessionStorage.setItem("User", JSON.stringify(user));
        navigate(`rooms`);
    }

    const mappedUsers = users.map(user => {
        return(
            <Users
                key={user._id}
                user={user}
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
