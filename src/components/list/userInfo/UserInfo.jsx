import { auth } from '../../../lib/firebase';
import './userInfo.css'
import { useChatStore } from "../../../lib/chatStore";
import { useUserStore } from '../../../lib/userStore';
import { useState } from 'react';
import EditProfile from './editProfile/editProfile';
import Detail from '../../detail/Detail';

function UserInfo(){

  const [editMode, setEditMode] = useState(false);

  const { chatId, resetEverything } = useChatStore();

  const [dropdownVisible, setDropdownVisible] = useState(false);

  const {currentUser} = useUserStore()

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt=""/>
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./edit.png" alt="" onClick={() => setEditMode((prev) => !prev)}/>
        <button className='logout'
                onClick={() => 
                  auth.signOut().then(() => {
                    resetEverything()
                  }).catch((error) => {
                    console.error("Sign out error:", error);
                    alert("An error occurred while signing out.");
                  })
                }
              >
                Log Out
              </button>
      </div>
      {editMode && <EditProfile/>} 
    </div>
  )
}

export default UserInfo