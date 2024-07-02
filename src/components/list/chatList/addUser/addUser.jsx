import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import './addUser.css'
import {db} from "../../../../lib/firebase"
import { useState } from 'react';
import {useUserStore} from "../../../../lib/userStore";
import Chatlist from '../Chatlist';

function AddUser(){

  const [user, setUser] = useState(null)

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      // Fetch the current user's document to get the "added" array
      const currentUserRef = doc(db, "users", currentUser.id);
      const currentUserDoc = await getDoc(currentUserRef);

      const currentUserData = currentUserDoc.data();
      const addedUsers = currentUserData.added || [];

      // Query to search for the user by username
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const foundUserDoc = querySnapShot.docs[0];
        const foundUserId = foundUserDoc.id;
        const foundUserData = foundUserDoc.data();

        // Check if the found user is already in the "added" array
        if (!addedUsers.includes(foundUserId) && foundUserId != currentUser.id) {
          setUser(foundUserData);
        } else {
          setUser(null);
          alert("Try Again");
        }
      } else {
        setUser(null);
        alert("User not found.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAdd = async () =>{

    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");

    try{

      const newChatRef = doc(chatRef);
      
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        photos: [],
        background: ""
      })

      await updateDoc(doc(userChatRef, user.id),{
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "Added you!",
          recieverId: currentUser.id,
          updatedAt: Date.now(),
          isSelected: false
        })
      })

      await updateDoc(doc(userChatRef, currentUser.id),{
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "Say Hi...",
          recieverId: user.id,
          updatedAt: Date.now(),
          isSelected: false
        })
      })

      try {
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", currentUser.username));
        const querySnapShot = await getDocs(q);

        if (!querySnapShot.empty) {
            const userDoc = querySnapShot.docs[0];
            const userDocRef = doc(db, "users", userDoc.id);

            await updateDoc(userDocRef, {
                added: arrayUnion(user.id)
            });

            const userdocRef = doc(db, "users", user.id);

            await updateDoc(userdocRef, {
                added: arrayUnion(currentUser.id)
            });

            window.location.reload();
            
        } else {
            alert("Something went wrong");
        }
    } catch (err) {
        alert(err.message);
    }

    }catch(err){
      alert(err.message)
    }

  }

  return (
    <div className='addUser'>
        <form onSubmit={handleSearch}>
            <input type="text" placeholder='Username' name='username'/>
            <button>Search</button>
        </form>
        {user && <div className="user">
            <div className="detail">
                <img src={user.avatar || "./avatar.png"} alt=''/>
                <span>{user.username}</span>
                <button onClick={handleAdd}>Add User</button>
            </div>
        </div>}
    </div>
  )
}

export default AddUser