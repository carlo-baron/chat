import './App.css';
import ChatRoom from './pages/ChatRoom/ChatRoom';
import UserSelect from './pages/UserSelect/UserSelect';
import RoomSelect from './pages/RoomSelect/RoomSelect';
import { Routes, Route, useNavigate } from 'react-router';


function App() {
    return(
        <Routes>
            <Route path='/' index element={<UserSelect />} />
            <Route path='room' index element={<RoomSelect />} />
            <Route path='chat/:id' index element={<ChatRoom />} />
        </Routes>
    );
}

export default App;
