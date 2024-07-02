import { arrayRemove, arrayUnion, deleteDoc, getDoc, onSnapshot } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase"
import { useUserStore } from "../../lib/userStore";
import "./detail.css"
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import upload from "../../lib/upload";

function Detail(){

  const {chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  const [shared, setShared] = useState(false)
  const [settings, setSettings] = useState(false)
  const [latestPhotos, setLatestPhotos] = useState([]);


  const handleBlock = async () =>{
    if (!user){
      return;
    }

    const userDocRef = doc(db, "users", currentUser.id);

    try{

      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      })

      changeBlock()

    }catch (err){
      alert(err.message)
    }

  }

  useEffect(() => {
    if (!chatId) return;

    const chatDocRef = doc(db, "chats", chatId);

    const unsubscribe = onSnapshot(chatDocRef, (chatDocSnap) => {
      if (chatDocSnap.exists()) {
        const photos = chatDocSnap.data().photos || [];
        const latestPhotos = photos.reverse();
        setLatestPhotos(latestPhotos);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [chatId]);

  const handleBackgroundImg = async (e) =>{
    
    let imgUrl = null;

    try{

        if (e.target.files[0]){
            imgUrl = await upload(e.target.files[0])
        }

        await updateDoc(doc(db, "chats", chatId), {
          background: `"${imgUrl}"`,
        });

    }catch(err){
        alert(err.message)
    }
  }

  const handleResetChat = async () =>{
    try{
      await updateDoc(doc(db, "chats", chatId), {
        messages: [],
        photos: [],
      });
    }catch (err){
      alert(err.message)
    }
  }

  const handleRemoveUser = async () =>{
    try{
      await deleteDoc(doc(db, "chats", chatId));
      const currentUserChatDoc = await getDoc(doc(db, "userchats", currentUser.id));
      const userChatDoc = await getDoc(doc(db, "userchats", user.id));
      
      if (currentUserChatDoc.exists()) {
        const userChatsData = currentUserChatDoc.data();
        const chatsArray = userChatsData.chats;

        // Step 2: Filter the array to exclude the chat with the specific chatId
        const updatedChatsArray = chatsArray.filter(chat => chat.chatId !== chatId);

        // Step 3: Update the document with the new array
        await updateDoc(doc(db, "userchats", currentUser.id), {
          chats: updatedChatsArray
        });
      }
        
      if (userChatDoc.exists()) {
        const userChatsData = userChatDoc.data();
        const chatsArray = userChatsData.chats;

        // Step 2: Filter the array to exclude the chat with the specific chatId
        const updatedChatsArray = chatsArray.filter(chat => chat.chatId !== chatId);

        // Step 3: Update the document with the new array
        await updateDoc(doc(db, "userchats", user.id), {
          chats: updatedChatsArray
        });
      }

      const currentUserDocRef = doc(db, "users", currentUser.id);
      await updateDoc(currentUserDocRef, {
        added: arrayRemove(user.id)
      });

      const userDocRef = doc(db, "users", user.id);
      await updateDoc(userDocRef, {
        added: arrayRemove(currentUser.id)
      });

      window.location.reload();

    }catch (err){
      alert(err.message)
    }
  }


  return (
    <div className='detail'>
      <div className="user">
          <img id="avatar" src={ isCurrentUserBlocked ?  "./avatar.png" : user?.avatar || "./avatar.png"} alt=""/>
        <h2>{isCurrentUserBlocked? "User" : user?.username}</h2>
        <p>{isCurrentUserBlocked? "" :  user?.description}</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src={settings ? "./arrowDown.png" : "./arrowUp.png"} alt="" onClick={() => setSettings((prev) => !prev)}/>
          </div>
          {settings && <div className="settings">
            <label htmlFor="bg_file">Change Chat Background</label>
              <input type="file" id='bg_file' style={{display : 'none'}} onChange={handleBackgroundImg} disabled={isCurrentUserBlocked}/>
            <p onClick={handleResetChat}>Reset Chat Fully</p>
            <p onClick={handleRemoveUser}>Remove User</p>                  
          </div>}
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src={shared ? "./arrowDown.png" : "./arrowUp.png"} alt="" onClick={() => setShared((prev) => !prev)}/>
          </div>
          {shared &&<div className="shared_photos">
            <div className="photos">
              {latestPhotos.map((photo, index) => (
                <img key={index} src={photo} alt="shared photo"/>
              ))}
            </div>
          </div>}
        </div>
          <button onClick={handleBlock} disabled={isCurrentUserBlocked}>{isCurrentUserBlocked ? "You are blocked" : isReceiverBlocked ? "Unblock" : "Block User"}</button> 
        </div>
    </div>
  )
}

export default Detail