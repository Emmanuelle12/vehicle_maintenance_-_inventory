'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt"
import Header from "@/app/components/Header"
import axios from "axios"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

interface Staffs {
    _id: string;
    full_name: string;
    position: string;
}

export default function Staff() {
    const [staffs, setStaffs] = useState<Staffs[]>([])
    const [staffsArr, setStaffsArr] = useState<Staffs[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(true)
    
    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/admin', name: 'Home'},
        {path: '/admin/maintenance/driver', name: 'Driver Report'},
        {path: '/admin/maintenance/mechanic', name: 'Mechanic Report'},
        {path: '/admin/purchase-order', name: 'Purchase Orders'},
        {path: '/admin/inventory', name: 'Inventory'},
        {path: '/admin/suppliers', name: 'Suppliers'},
        {path: '/admin/staff', name: 'Staffs'},
    ]

    const searchFunction = (key: string) => {
        const temp = staffsArr.filter(data => 
            data.full_name.toLowerCase().includes(key.toLowerCase()) ||
            data.position.toLowerCase().includes(key.toLowerCase())
        )
        setStaffs(temp)
    }

    const getStaffs = useCallback(async () => {
        await axios.get('/api/staffs')
        .then(response => {
            const st = response.data?.staffs
            setStaffs(st)
            setStaffsArr(st)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getStaffs()
    }, [getStaffs])

    return(
        <div className="w-full">
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="STAFFS" goTo={'/admin/staff/create'} goTo2={{path:'/admin/staff/archive', title: 'Archive'}} searchFunction={searchFunction} />
            <section className="w-full bg-white min-h-80 2xl:min-h-96 overflow-auto">
                <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border-x-2 border-black">Name</th>
                            <th className="p-2 border-x-2 border-black">Position</th>
                            <th className="p-2 border-x-2 border-black">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            staffs.map((staff, index) => {
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-black">{staff?.full_name}</td>
                                        <td className="p-2 border-x-2 border-black">{staff?.position}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <Link
                                                    href={'/admin/staff/edit/'+staff._id}
                                                    className="p-2 rounded text-xs text-white font-bold bg-indigo-400 hover:bg-indigo-600"
                                                >Edit</Link>
                                                <button 
                                                    className="p-2 rounded text-xs text-white font-bold bg-rose-400 hover:bg-rose-600"
                                                >
                                                    Archive
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </section>
        </div>
    )
}