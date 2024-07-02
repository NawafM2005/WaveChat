import { useEffect, useRef, useState } from "react"
import "./chat.css"
import EmojiPicker  from "emoji-picker-react"
import { arrayUnion, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { updateDoc } from "firebase/firestore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import CameraPopup from './cameraPopup/cameraPopup'; // Import the CameraPopup component

function Chat(){
const [open,setOpen] = useState(false);
const [text,setText] = useState("");
const [chat,setChat] = useState();
const [img,setImg] = useState({
    file:null,
    url: ""
});
const [bg, setBg] = useState("")
const [sending, setSending] = useState(false);


const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
const { currentUser } = useUserStore();

const toggleDetailState = useChatStore((state) => state.toggleDetailState);
const toggleDetail = useChatStore((state) => state.toggleDetail);

const endRef = useRef(null)

const [cameraOpen, setCameraOpen] = useState(false);

const recognitionRef = useRef(null);



useEffect(() =>{
        endRef.current?.scrollIntoView({behavior: 'auto'});
    }
)

useEffect(() =>{
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) =>{
        setChat(res.data())
    })

    return () =>{
        unSub()
    }
},[chatId]);

const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
}

const handleImg = (e) => {
    if (e.target.files[0]) {
        const file = e.target.files[0];
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        
        if (validImageTypes.includes(file.type)) {
            setImg({
                file: file,
                url: URL.createObjectURL(file),
            });
        } else {
            alert('Please upload a valid image file (jpg, jpeg, png).');
        }
    }
};

const handleSend = async () =>{

    setSending(true);

    let imgUrl = null;

    try{

        if (img.file){
            imgUrl = await upload(img.file)
        }
        else if (text == ""){
            setSending(false);
            return;
        }

        if (imgUrl){
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                  senderId: currentUser.id,
                  text,
                  createdAt: new Date(),
                  ...(imgUrl && {img: imgUrl}),
                }),
                photos: arrayUnion(imgUrl)
              });
        }else{
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                  senderId: currentUser.id,
                  text,
                  createdAt: new Date(),
                  ...(imgUrl && {img: imgUrl})
                }),
              });
        }

        const userIDs = [currentUser.id, user.id]


        userIDs.forEach(async (id) => {
            const userChatsRef = doc(db, "userchats", id);
            const userSnapShot = await getDoc(userChatsRef);
            
            if (userSnapShot.exists()){
                const userChatsData = userSnapShot.data();
    
                const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId)
    
                userChatsData.chats[chatIndex].lastMessage = text;
                userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                userChatsData.chats[chatIndex].updatedAt = Date.now();
    
                await updateDoc(userChatsRef, {
                    chats: userChatsData.chats,
                });
            }
        });

    }catch(err){
        alert(err.message)
    }

    setImg({
        file: null,
        url: ""
    })

    setText("")

    setSending(false);
}

const formatTimestamp = (timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

useEffect(() =>{
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) =>{
        setBg(res.data().background)
    })

    return () =>{
        unSub()
    }
},[chatId]);


const handleCapture = () => {
    setCameraOpen(true);
}

const handleImageCapture = (image) => {
    try {
        // Create a File object from the captured image URL
        fetch(image)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "captured_image.jpg", { type: blob.type });
                setImg({
                    file: file,
                    url: URL.createObjectURL(file),
                });
            });
        setCameraOpen(false);
    } catch (err) {
        alert(err.message);
    }
}

const handleSpeech = () => {
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.onstart = () => {
        console.log("Voice recognition started. Try speaking into the microphone.");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((prevText) => prevText + " " + transcript);
    };

    recognition.onerror = (event) => {
        alert("Error occurred in recognition: " + event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
};

const handleTextChange = (e) => {
    if (e.target.value.length <= 100) {
      setText(e.target.value);
    } else {
    }
  };


  return (
    <div className='chat'>
        <div className="top">
            <div className="user">
                <img id="avatar" src={ isCurrentUserBlocked ?  "./avatar.png" : user?.avatar || "./avatar.png"} alt=""/>
                <div className="texts">
                    <span>{isCurrentUserBlocked? "User" : user?.username}</span>
                    <p>{isCurrentUserBlocked? "" :  user?.description}</p> 
                </div>
            </div>
            <div className="icons">
                <img src="./phone.png" alt=""/>
                <img src="./video.png" alt=""/>
                <img src="./info.png" alt="" onClick={toggleDetailState}/>
            </div>
        </div>
        <div className="center" style={{backgroundImage: bg ? `url(${bg})` : "none"}}>
            {chat?.messages?.map(message =>(
                <div className={message.senderId === currentUser?.id ? "message_own" : "message"} key={message?.createdAt}>
                    <div className="texts">
                        {message.img && <img src={message.img} style={{border: "2px solid black"}}/>}
                        {message.text && <p>{message.text}</p>}
                        <span>{formatTimestamp(message.createdAt)}</span>
                    </div>
                </div>
            ))}

            {img.url && <div className="message_own">
                <div className="texts">
                    <img src={img.url}/>
                    <p style={{backgroundColor : "red", padding: "5px"}}>Press Send to Send Image</p>
                </div>
            </div>}

            <div ref={endRef}></div>
        </div>
        <div className="bottom">
            <div className="icons">
                <label htmlFor="file">
                    <img src="./img.png" alt=""/>
                </label>
                <input type="file" id="file" style={{display: "none"}} onChange={handleImg}/>
                <img src="./camera.png" alt="" onClick={handleCapture}/>
                <img src="./mic.png" alt="" onClick={handleSpeech}/>
            </div>
            <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "Cannot Send Message" : "Type a message..."} value={text} onChange={handleTextChange} disabled={isCurrentUserBlocked || isReceiverBlocked}/>
            <div className="emoji">
                <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)}/>
                <div className="picker">
                    <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
                </div>
            </div>
            <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked || sending}>{sending ? "Sending..." : "Send"}</button>
        </div>
        {cameraOpen && <CameraPopup onCapture={handleImageCapture} onClose={() => setCameraOpen(false)} />}
    </div>
  )
}

export default Chat