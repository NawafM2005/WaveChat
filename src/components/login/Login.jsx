import { useState } from 'react';
import './login.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth';
import { auth, db } from "../../lib/firebase";
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import upload from '../../lib/upload';

const Login = () => {
    const [avatar, setAvatar] = useState(
        {
            file: null,
            url: ""
        }
    )

    const [passwordVisible, setPasswordVisible] = useState(false);

    const [loading,setLoading] = useState(false)

    const handleAvatar = e =>{
        if (e.target.files[0]){
            setAvatar({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            })
        }
    }

    const togglePasswordVisibility = () => {
        setPasswordVisible(prev => !prev);
    };

    const handleLogin = async (e) =>{
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target);

        const {email,password} = Object.fromEntries(formData);

        try{
            await signInWithEmailAndPassword(auth, email, password)

        }catch(err){
            alert(err.message)
        } finally{
            setLoading(false)
        }
        
    }

    const handleRegister = async (e) =>{
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.target);

        const {username,email,password, c_password} = Object.fromEntries(formData);

        try{
            // Check if username is unique
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("Username is already taken. Please choose another one.");
                setLoading(false);
                return;
            }

            // Check if email is unique
            const p = query(usersRef, where("email", "==", email));
            const querySnapshotEmail = await getDocs(p);

            if (!querySnapshotEmail.empty) {
                alert("Email is already taken. Please choose another one.");
                setLoading(false);
                return;
            }

            if (password != c_password) {
                alert("Passwords do not match. Please try again.");
                setLoading(false);
                return;
            }

            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = avatar.file ? await upload(avatar.file) : "./avatar.png";
            
            await setDoc(doc(db, "users", res.user.uid),{
                username: username,
                email: email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
                description: "",
                added: [],
            })

            await setDoc(doc(db, "userchats", res.user.uid),{
                chats: [],
            })

            window.location.reload();

        }catch(err){
            console.log(err)
            alert(err.message)
        } finally{
            setLoading(false)
        }
    }


  return (
    <div className='login'>
        <div>
            <h3>Welcome to WaveChat</h3>
        </div>
        <div className='main'>
            <div className="item">
                <h2>Welcome back</h2>
                <form onSubmit={handleLogin}>
                    <input type="email" placeholder='Email' name='email'/>
                    <input type="password" placeholder='Password' name='password'/>
                    <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="seperator"></div>
            <div className="item">
                <h2>Create Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt=''/>
                        Upload Avatar
                    </label>
                    <input type="file" id='file' style={{display : 'none'}} onChange={handleAvatar}/>
                    <input type="text" placeholder='Username' name='username'/>
                    <input type="email" placeholder='Email' name='email'/>
                    <div className='password_field'>
                        <input type={passwordVisible ? 'text' : 'password'} placeholder='Password' name='password'/>
                        <img src={"./eye.png"} alt='' onClick={togglePasswordVisibility}/>
                    </div>
                    <div className='password_field'>
                        <input type={passwordVisible ? 'text' : 'password'} placeholder='Confirm Password' name='c_password'/>
                        <img src={"./eye.png"} alt='' onClick={togglePasswordVisibility}/>
                    </div>
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login