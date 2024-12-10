'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import Header from "@/app/components/Header"
import { useAuthStore } from "@/app/stores/auth";
import axios, { AxiosResponse } from "axios";
import { useCallback, useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";

interface User {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
    email: string;
}

interface Item {
    _id: string;
    item_name: string;
}

interface SubmittedReport {
    _id: string;
    bus_number: string;
    driver: User;
    conductor: string;
    report: Item[];
    createdAt: Date;
    deletedAt: Date;
    date_report: Date;
}

export default function Archive() {
    const [archive, setArchive] = useState<SubmittedReport[]>([])
    const [archiveArr, setArchiveArr] = useState<SubmittedReport[]>([])
    const store = useAuthStore()
    const [hidePanel, setHidePanel] = useState<boolean>(true)

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/mechanic/reports', name: 'Reports'},
        {path: '/mechanic/inventory', name: 'Inventory'},
    ]

    const handleSearch = (key: string) => {
        const temp = archiveArr.filter(item => 
            item.bus_number.toLowerCase().includes(key.toLowerCase()) ||
            item.driver.first_name.toLowerCase().includes(key.toLowerCase()) ||
            item.driver.middle_name.toLowerCase().includes(key.toLowerCase()) ||
            item.driver.last_name.toLowerCase().includes(key.toLowerCase()) ||
            item.driver.extension.toLowerCase().includes(key.toLowerCase()) ||
            item.conductor.toLowerCase().includes(key.toLowerCase()) 
        )
        setArchive(temp)
    }

    const confirmRestore = (id: string, index: number) => {
        Swal.fire({
            title: 'Restore Report',
            text: 'Are you sure you want to restore report?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo',
        })
        .then(response => {
            if (response.isConfirmed) {
                restoreReport(id, index)
            }
        })
    }
    
    const confirmDelete = (id: string, index: number) => {
        Swal.fire({
            title: 'Delete Report',
            text: 'Are you sure you want to permanently delete report?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo',
        })
        .then(response => {
            if (response.isConfirmed) {
                deleteReport(id, index)
            }
        })
    }

    const getArchive = useCallback(async () => {
        const id = store.user.id
        await axios.get(`/api/mechanic/archive?mech_id=${id}`)
        .then(response => {
            const arc = response.data?.archive
            setArchive(arc)
            setArchiveArr(arc)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getArchive()
    }, [getArchive])

    const restoreReport = async (id: string, index: number) => {
        toast.promise(
            axios.patch(`/api/mechanic/archive?report_id=${id}`),
            {
                pending: 'Restoring report...',
                success: {
                    render() {
                        const temp = [...archive]
                        temp.splice(index, 1)
                        setArchive(temp)
                        setArchiveArr(temp)
                        return 'Report restored'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        Swal.fire({
                            title: 'Restore Error',
                            text: data.data?.message,
                            icon: 'error'
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    const deleteReport = async (id: string, index: number) => {
        toast.promise(
            axios.delete(`/api/mechanic/archive?report_id=${id}`),
            {
                pending: 'Deleting report...',
                success: {
                    render() {
                        const temp = [...archive]
                        temp.splice(index, 1)
                        setArchive(temp)
                        setArchiveArr(temp)
                        return 'Report deleted'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        Swal.fire({
                            title: 'Delete Error',
                            text: data.data?.message,
                            icon: 'error'
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    return(
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="MECHANIC REPORT ARCHIVE" backTo={'/mechanic/reports'} searchFunction={handleSearch}/>
            <section className="w-full min-h-80 bg-white overflow-auto">
            <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black">Date</th>
                            <th className="border-x-2 border-black">Bus Number</th>
                            <th className="border-x-2 border-black">Driver</th>
                            <th className="border-x-2 border-black">Conductor</th>
                            <th className="w-1/3 border-x-2 border-black">Report</th>
                            <th className="border-x-2 border-black">Date Deleted</th>
                            <th className="w-1/5 border-x-2 border-black">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            archive.map((item,index)=>{
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-black">{new Date(item.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-black">{item.bus_number}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <span>{item.driver.first_name} </span>
                                            <span>{item.driver.middle_name} </span>
                                            <span>{item.driver.last_name} </span>
                                            <span>{item.driver?.extension}</span>
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{item.conductor}</td>
                                        <td className="p-2 border-x-2 border-black">{item.report.map((prod,idx) => {
                                            return(
                                                <p key={idx}>{prod.item_name}</p>
                                            )
                                        })}</td>
                                        <td className="p-2 border-x-2 border-black">{new Date(item.deletedAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button onClick={()=>confirmRestore(item._id, index)} className="p-2 rounded text-white text-xs font-semibold bg-blue-400 hover:bg-blue-600">restore</button>
                                                <button onClick={()=>confirmDelete(item._id, index)} className="p-2 rounded text-white text-xs font-semibold bg-rose-400 hover:bg-rose-600">delete</button>
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