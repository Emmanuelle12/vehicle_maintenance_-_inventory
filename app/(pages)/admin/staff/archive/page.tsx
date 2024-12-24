'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import Header from "@/app/components/Header";
import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import Swal from "sweetalert2";

interface Staff {
    _id: string;
    full_name: string;
    position: string;
}

export default function Archive() {
    const [archive, setArchive] = useState<Staff[]>([])
    const [archiveArr, setArchiveArr] = useState<Staff[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(true)
    
    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/admin', name: 'Home'},
        {path: '/admin/purchase-order', name: 'Purchase Orders'},
        {path: '/admin/inventory', name: 'Inventory'},
        {path: '/admin/suppliers', name: 'Suppliers'},
        {path: '/admin/staff', name: 'Staffs'},
    ]

    const getArchive = useCallback(async () => {
        await axios.get('/api/staffs/archive')
        .then(response => {
            const arc = response.data?.staffs
            setArchive(arc)
            setArchiveArr(arc)
        })
    }, [])

    useEffect(() => {
        getArchive()
    }, [getArchive])

    const searchFunction = (key: string) => {
        const temp = archiveArr.filter(data => 
            data.full_name.toLowerCase().includes(key.toLowerCase()) ||
            data.position.toLowerCase().includes(key.toLowerCase())
        )
        setArchive(temp)
    }

    const confirmRestore = (id: string) => {
        Swal.fire({
            title: 'Restore Confirmation',
            text: 'Are you sure you want to restore this staff?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo'
        })
        .then(response => {
            if (response.isConfirmed) {
                restoreStaff(id)
            }
        })
    }
    
    const confirmDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Confirmation',
            text: 'Are you sure you want to delete this staff?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo'
        })
        .then(response => {
            if (response.isConfirmed) {
                deleteStaff(id)
            }
        })
    }

    const restoreStaff = async (id: string) => {
        await axios.patch(`/api/staffs/archive?staff_id=${id}`)
        .then(response => {
            const arc = response.data?.staffs
            setArchive(arc)
            setArchiveArr(arc)
        })
        .catch(error => {
            console.error(error)
        })
    }

    const deleteStaff = async (id: string) => {
        await axios.delete(`/api/staffs/archive?staff_id=${id}`)
        .then(response => {
            const arc = response.data?.staffs
            setArchive(arc)
            setArchiveArr(arc)
        })
        .catch(error => {
            console.error(error)
        })
    }

    return (
        <div className="w-full">
            <Header title="STAFFS ARCHIVE" backTo={'/admin/staff'} searchFunction={searchFunction} />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
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
                            archive.map((staff, index) => {
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-black">{staff?.full_name}</td>
                                        <td className="p-2 border-x-2 border-black">{staff?.position}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button 
                                                    onClick={()=>confirmRestore(staff._id)}
                                                    className="p-2 rounded text-xs text-white font-bold bg-green-400 hover:bg-green-600"
                                                >
                                                    Restore
                                                </button>
                                                <button 
                                                    onClick={()=>confirmDelete(staff._id)}
                                                    className="p-2 rounded text-xs text-white font-bold bg-rose-400 hover:bg-rose-600"
                                                >
                                                    Delete
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