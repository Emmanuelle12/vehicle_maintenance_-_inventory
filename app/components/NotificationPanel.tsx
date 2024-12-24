'use client'

import { FC } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

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

interface PanelProps {
    isHidden: boolean;
    notifications?: Notification[];
    toggle: ()=>void;
    deleter: (id: string)=>Promise<void>;
}

const NotificationPanel: FC<PanelProps> = ({ isHidden, notifications, toggle, deleter }) => {

    return (
        <div className={`fixed bottom-0 right-0 w-full md:w-96 z-10 bg-img ${isHidden && 'hidden'}`}>
            <div className="w-full h-full bg-blue-950/80 p-5">
                <section className="w-full">
                    <header className="mb-5 font-semibold flex justify-between items-center border-b border-cyan-400">
                        <h1 className="text-xl">NOTIFICATIONS</h1>
                        <button type="button" className="active:border rounded p-1 border-cyan-400" onClick={()=>toggle()}>
                            <IoCloseSharp />
                        </button>
                    </header>
                    <div className="space-y-2 h-96 relative overflow-y-auto">
                        {
                            notifications?.map((item, index) => {
                                return (
                                    <div className="mb-5 flex justify-center items-center" key={index}>
                                        <div className="border-b border-cyan-400 w-full">
                                            <p className="text-center">{item?.message}</p>
                                            <p className="text-xs font-bold">
                                                <span>{new Date(item?.createdAt ?? 0).toLocaleTimeString('en-US')} </span>
                                                <span>{new Date(item?.createdAt ?? 0).toLocaleDateString('en-US')}</span>
                                            </p>
                                        </div>
                                        <button type="button" onClick={()=>deleter(item._id)} className="">
                                            <FaTrash className="text-white hover:text-red-400" />
                                        </button>
                                    </div>
                                )
                            })
                        }
                    </div>
                </section>
            </div>
        </div>
    )
}

export default NotificationPanel