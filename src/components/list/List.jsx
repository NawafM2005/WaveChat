import "./list.css"
import Userinfo from "./userInfo/UserInfo"
import ChatList from "./chatList/Chatlist"

function List(){
  return (
    <div className='list'>
        <Userinfo/>
        <ChatList/>
    </div>
  )
}

export default List