'use client'

import { FaRegBell } from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";
import NotificationPanel from "./NotificationPanel";
import ProfilePanel from "./ProfilePanel";

interface User {
    _id: string;
    first_name: string,
    middle_name: string,
    last_name: string;
    extension: string;
    email: string;
}

interface Notification {
    _id: string,
    user: User;
    message: string;
    status: string;
    createdAt: Date;
}

export default function Navigation() {
    const router = useRouter()
    const store = useAuthStore()
    const [profileModal, setProfileModal] = useState<boolean>(true)
    const [notificationModal, setNotificationModal] = useState<boolean>(true)
    const [unreadCount, setUnreadCount] = useState<number>(0)
    const [notifications, setNotifications] = useState<Notification[]>([])

    const logout = async () => {
        await axios.get('/api/auth')
        .then(() => {
            store.removeUser()
            router.push('/auth/sign-in')
        })
        .catch(error => {
            console.log(error)
        })
    }

    const getNotifications = async () => {
        const user = store.user
        await axios.get(`/api/notifications?userId=${user.id}`)
        .then(response => {
            const notification = response.data?.notifications
            setNotifications(notification)
            const count = notification.filter((notif: Notification) => notif.status === 'unread').length
            setUnreadCount(count)
        })
        .catch(error => {
            console.log(error)
        })
    }

    const readNotifications = async () => {
        const user = store.user
        await axios.put('/api/notifications', {id: user.id})
        .then(response => {
            const not = response.data?.notifications
            setNotifications(not)
            const count = not.filter((notification: Notification) => notification.status === 'unread').length
            setUnreadCount(count)
        })
        .catch(error => {
            console.log(error)
        })
    }

    const deleteNotification = async (id: string) => {
        await axios.delete(`/api/notifications?notificationId=${id}`)
        .then(()=>{
            setNotifications((prevData) => prevData.filter((notification) => notification._id !== id))
            const count = notifications.filter((notification: Notification) => notification.status === 'unread').length
            setUnreadCount(count)
        })
        .catch(error => {
            console.log(error)
        })
    }

    function capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }

    useEffect(()=>{
        getNotifications()
    }, [store.user])

    const toggleNotifications = () => {
        if (unreadCount > 0) {
            readNotifications()
        }
        setNotificationModal(!notificationModal)
    }

    const toggleProfile = () => {
        setProfileModal(!profileModal)
    }

    return (
        <div className="w-full fixed flex justify-between items-center top-0 border-b border-cyan-400 text-white p-2 pr-5 z-10 bg-img">
            <ProfilePanel isHidden={profileModal} handleLogout={logout} toggle={toggleProfile} />
            <NotificationPanel isHidden={notificationModal} notifications={notifications} toggle={toggleNotifications} deleter={deleteNotification} />
            <p className="text-sm md:text-2xl font-bold">GUBAT TRANSPORT COOPERATIVE</p>
            <div className="flex justify-center items-center gap-3 md:gap-10">
                <div className="relative">
                    <button onClick={toggleNotifications} className="flex flex-col justify-center items-center">
                        <div className="rounded-full ring ring-cyan-400 p-2 relative">
                            {
                                unreadCount > 0 &&
                                <div className="rounded-full w-5 h-5 absolute block top-[-5px] right-[-5px] flex justify-center items-center bg-red-600">
                                    <p className="text-xs text-white text-ellipsis overflow-hidden">{unreadCount}</p>
                                </div>
                            }
                            <FaRegBell className="text-cyan-400 w-5 h-5" />
                        </div>
                        <p className="text-center text-xs md:text-sm">Notifications</p>
                    </button>
                </div>
                <div className="relative">
                    <button onClick={()=>setProfileModal(!profileModal)} className="flex flex-col justify-center items-center">
                        <div className="rounded-full ring ring-cyan-400 p-2 relative">
                            <IoMdPerson className="text-cyan-400 w-5 h-5" />
                        </div>
                        <p className="text-center text-xs md:text-sm">{ capitalize(store?.user?.position) }</p>
                    </button>
                    {/* <div className={`absolute w-96 p-5 rounded bg-white right-0 ${profileModal ? '' : 'hidden'}`}>
                        <button onClick={logout} className="w-full p-2 rounded bg-blue-400 hover:bg-blue-600 text-xs text-white font-bold">logout</button>
                    </div> */}
                </div>
            </div>
        </div>
    )
}