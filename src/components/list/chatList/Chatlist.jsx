import { useEffect, useState } from 'react';
import './chatList.css';
import AddUser from './addUser/addUser';
import { useUserStore } from '../../../lib/userStore';
import { useChatStore } from '../../../lib/chatStore';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

function Chatlist(){
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);

  const { currentUser } = useUserStore();
  const { chatId, changeChat, changeSelectedChat, selectedChat } = useChatStore();

  const [input, setInput] = useState("");


  try{
    useEffect(() => {
      const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
          const items = res.data().chats;

          const promises = items.map(async (item) => {
            const userDocRef = doc(db, "users", item.recieverId);
            const userDocSnap = await getDoc(userDocRef);
  
            const user = userDocSnap.data();
  
            return { ...item, user };
          });
  
          const chatData = await Promise.all(promises);
            
          setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        }
      );  
      return () => {
        unSub();
      };
    }, [currentUser.id]);

  }catch(err){
    alert(err.message)
  }

  const handleSelect = async (selectedChat) => {
    const updatedChats = chats.map(chat => ({
        ...chat,
        isSeen: chat.chatId === selectedChat.chatId ? true : chat.isSeen // Ensure isSeen is true for selected chat
    }));

    const userChatsRef = doc(db, 'userchats', currentUser.id);

    try {
        await updateDoc(userChatsRef, { chats: updatedChats });
        changeChat(selectedChat.chatId, selectedChat.user);
        changeSelectedChat(selectedChat.chatId)
    } catch (err) {
        alert(err.message);
    }
};

  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()))

  const toggleAddMode = () => {
    setAddMode(prev => !prev);
  };

  return (
    <div className='chatlist'>
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt=""/>
          <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)}/>
        </div>
        <img className="add" src={addMode ? "./minus.png" : "./plus.png"} alt="" onClick={toggleAddMode} />
      </div>

      {filteredChats.map((chat) =>(
        <div className="item" key={chat.chatID} onClick={() => handleSelect(chat)} style={{backgroundColor: chat?.isSeen ? 'transparent' : '#A7B6B5', backdropFilter: chat.chatId == selectedChat ? "blur(5px)" : "none" }}>
        <img src={chat.user.blocked.includes(currentUser.id) ? "./avatar.png": chat.user.avatar || "./avatar.png"} alt=""/>
        <div className="texts">
          <span>{chat.user.blocked.includes(currentUser.id) ? "User" : chat.user.username}</span>
          {!chat.user.blocked.includes(currentUser.id) && <p className='recent_msg'>{chat.lastMessage ? chat.lastMessage.slice(0, 50) : "Sent an Image"}</p>}
          </div>
      </div>
      ))}
      {addMode && <AddUser/>} 
    </div>
  )
}

export default Chatlist