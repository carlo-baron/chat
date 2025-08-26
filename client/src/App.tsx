import './App.css';
import ChatRoom from './pages/ChatRoom/ChatRoom';
import UserSelect from './pages/UserSelect/UserSelect';
import RoomSelect from './pages/RoomSelect/RoomSelect';
import { Routes, Route } from 'react-router';


function App() {
    return(
        <Routes>
            <Route path='/' index element={<UserSelect />} />
            <Route path='rooms' index element={<RoomSelect />} />
            <Route path='room/:roomName' index element={<ChatRoom />} />
        </Routes>
    );
}

export default App;
