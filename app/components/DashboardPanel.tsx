'use client'

import Link from "next/link";
import { FC, useEffect, useState } from "react";
// import { AiOutlineMenuFold } from "react-icons/ai";
// import { AiOutlineMenuUnfold } from "react-icons/ai";

interface PropProperty {
    path: string;
    name: string;
}

interface PanelProps {
    isHidden: boolean;
    navs: PropProperty[];
}

 const DashboardPanel: FC<PanelProps> = ({ isHidden, navs }) => {
    // const [isHidden, setIsHidden] = useState<boolean>(true)
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const [hideFromPublic, setHideFromPublic] = useState<boolean>(false)

    useEffect(() => {
        setIsMounted(true)
        function checkIfHidden() {
            const url = window.location.href
            if (url.includes('auth')) {
                setHideFromPublic(true)
            } else {
                setHideFromPublic(false)
            }
        }
        checkIfHidden()
    }, [])

    if (!isMounted) {
        return null
    }

    return(
        <section className={`${hideFromPublic && 'hidden'} fixed bottom-0 w-[320px] h-96 left-0 z-10 transition-transform transform ${isHidden ? '-translate-x-0' : '-translate-x-[280px]'}`}>
            {/* <header className="w-full flex justify-end items-center">
                <button onClick={()=>setIsHidden(!isHidden)} className="p-2 rounded hover:text-white active:text-cyan-400 active:ring-2 ring-cyan-400 bg-gray-400">
                    {
                        isHidden ? (
                            <AiOutlineMenuFold className="text-xl" />
                        ) : (
                            <AiOutlineMenuUnfold className="text-xl" />
                        )
                    }
                </button>
            </header> */}
            <div className="w-[280px] px-2 py-5 bg-blue-950/80 h-full">
                <nav className="flex flex-col gap-2 text-center">
                    {/* <Link href={'/maintenance/driver'} className="p-2 rounded w-full bg-indigo-400 hover:bg-indigo-600 text-white">Drivers Reports</Link>
                    <Link href={'/maintenance/mechanic'}>Mechanic Reports</Link> */}
                    {
                        navs.map((navigation,index)=>{
                            return(
                                <Link 
                                    href={navigation.path} 
                                    key={index}
                                    className={`p-2 rounded w-full text-white font-bold active:ring-2 ring-cyan-400 bg-${index}`}
                                >
                                    {navigation.name}
                                </Link>
                            )
                        })
                    }
                </nav>
            </div>
        </section>
    )
}

export default DashboardPanel