'use client'

import Link from "next/link";
import { FC } from "react";
import { RiMenuFold2Fill, RiMenuUnfold2Fill } from "react-icons/ri";

interface NavProperties {
    path: string;
    name: string;
}

interface Props {
    isHidden: boolean;
    toggle: ()=>void;
    navs: NavProperties[];
}

const DashboardPanelAlt: FC<Props> = ({ isHidden, navs, toggle }) => {
    return(
        <section 
            className={`fixed bottom-0 left-[-245px] w-[285px] h-[390px] md:h-[500px] transition-transform transform 
                ${isHidden ? '-translate-x-0' : 'translate-x-[245px] z-10'}`}
        >
            <div className={`w-full h-full flex justify-between items-start gap-2 ${isHidden ? 'z-1': 'z-10 bg-blue-950/50 p-2'}`}>
                <div className="w-full h-full pt-10 flex flex-col justify-center items-center gap-2 p-5">
                    {
                        navs.map((lnk, idx) => {
                            return(
                                <Link key={idx} href={lnk.path} className="p-2 text-white text-sm font-bold rounded w-full bg-blue-400 hover:bg-blue-600">{lnk.name}</Link>
                            )
                        })
                    }
                </div>
                <button onClick={toggle} className="p-2 rounded-xl text-white text-xl bg-blue-400 hover:bg-blue-600">
                    {
                        isHidden ? 
                        <RiMenuFold2Fill />
                        :
                        <RiMenuUnfold2Fill />
                    }
                </button>
            </div>
        </section>
    )
}

export default DashboardPanelAlt