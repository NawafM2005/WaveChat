import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";  
import Login from "./components/login/Login";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";


const App = () => {

  const {currentUser, isLoading, fetchUserInfo} = useUserStore()

  const { chatId, toggleDetail } = useChatStore();

  useEffect(() =>{
    const unSub = onAuthStateChanged(auth, (user) =>{
      fetchUserInfo(user?.uid)
    })
    return () =>{
      unSub();
    }
  }, [fetchUserInfo])

  console.log(currentUser)

  if (isLoading){
    return <div className="loading">Loading...</div>
  }

  return (
    <div className='container'>
      {
        currentUser ? (
          <>
            <List/>
            {chatId && <Chat/>}
            {chatId && toggleDetail && <Detail />}
            </>
        ) : (
          <Login/>
        )
      }
    </div>
  )
}

export default App