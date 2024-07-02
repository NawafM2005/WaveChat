import { collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import './editProfile.css'
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore';
import { useState } from 'react';
import upload from '../../../../lib/upload';

function EditProfile(){

    const { currentUser } = useUserStore();

    const [loading,setLoading] = useState(false)


    const handleEdit = async (e) => {
        e.preventDefault();
        setLoading(true)
        const formData = new FormData(e.target);
        const description = formData.get("description");

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", currentUser.username));
            const querySnapShot = await getDocs(q);

            if (!querySnapShot.empty) {
                const userDoc = querySnapShot.docs[0];
                const userDocRef = doc(db, "users", userDoc.id);

                if (description) {
                    await updateDoc(userDocRef, {
                        description: description
                    });
                }

                const imgUrl = await upload(avatar.file);
            
                await updateDoc(doc(db, "users", currentUser.id),{
                    avatar: imgUrl,
                })

                window.location.reload();
                
            } else {
                alert("User not found");
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false)
        }
    };

    const [avatar, setAvatar] = useState(
        {
            file: null,
            url: ""
        }
    )

    const handleAvatar = async (e) =>{
        try{
            if (e.target.files[0]){
                setAvatar({
                    file:e.target.files[0],
                    url: URL.createObjectURL(e.target.files[0]),
                })
            }
        }catch(err){
            alert(err.message)
        }
    }

  return (
    <div className='editProfile'>
        <form onSubmit={handleEdit}>
            <p>Description</p>
            <textarea type='text' placeholder={currentUser?.description} name='description'/>
            <label htmlFor="file">
                <img src={avatar.url || currentUser.avatar} alt=''/>
                Change Avatar
            </label>
            <input type="file" id='file' style={{display : 'none'}} onChange={handleAvatar}/>
            <button disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </form>
    </div>
  )
}

export default EditProfile