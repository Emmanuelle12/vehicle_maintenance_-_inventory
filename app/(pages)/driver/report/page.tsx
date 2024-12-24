'use client'

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/stores/auth";
import axios, { AxiosResponse } from "axios";
import Header from "@/app/components/Header";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface User {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
    email: string;
}

interface Conductor {
    full_name: string;
}

interface Report {
    _id: string;
    report_date: Date;
    bus_number: string;
    driver: User;
    conductor: Conductor;
    report: [{item_name: ''}];
    others: string;
    createdAt: Date;
}

interface ReportState {
    reports: Report[];
    loading: boolean;
}

export default function Report() {
    const store = useAuthStore()
    const [reports, setReports] = useState<ReportState>({
        reports: [],
        loading: true
    })
    const [reportArr, setReportArr] = useState<Report[]>([])

    const handleSearch = (key: string) => {
        const temp = reportArr.filter(data => 
            data.bus_number.toLowerCase().includes(key.toLowerCase()) ||
            data.conductor?.full_name?.toLowerCase().includes(key.toLowerCase())
        )
        setReports({
            ...reports,
            reports: temp
        })
    }

    const getReports = async (id: string) => {
        await axios.get(`/api/drivers?driverId=${id}`)
        .then(response => {
            console.log(response)
            const rep = response.data?.reports
            setReportArr(rep)
            setReports({
                reports: rep,
                loading: false
            })
        })
        .catch(error => {
            console.log(error)
        })
    }

    useEffect(()=>{
        getUser()
    }, [store.user])

    const getUser = () => {
        const user = store.user
        getReports(user.id)
    }

    const confirmDelete = (id: string) => {
        Swal.fire({
            title: 'Archive Confirmation',
            text: 'Are you sure you want to archive report?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo',
        })
        .then(response => {
            if (response.isConfirmed) {
                deleteReport(id)
            }
        })
    }

    const deleteReport = async (id: string) => {
        setReports({
            ...reports,
            loading: true,
        })
        toast.promise(
            axios.patch(`/api/drivers?report_id=${id}`),
            {
                pending: 'Archiving report...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        const rep = data?.data?.reports
                        setReportArr(rep)
                        setReports({
                            reports: rep,
                            loading: false
                        })
                        return 'Report archived'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Archive Error',
                            text: data?.data?.message,
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
            <Header 
                title="DRIVERS REPORTS" 
                goTo={'/driver/report/create'} 
                goTo2={{ path: '/driver/report/archive', title: 'Archive' }} 
                searchFunction={handleSearch} 
            />
            <section className="w-full bg-white min-h-80 overflow-auto">
                <table className="w-full table-auto md:table-fixed text-center text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black p-2">Date</th>
                            <th className="border-x-2 border-black p-2">Bus Number</th>
                            <th className="border-x-2 border-black p-2">Driver</th>
                            <th className="border-x-2 border-black p-2">Conductor</th>
                            <th className="w-1/5 border-x-2 border-black p-2">Report</th>
                            <th className="w-1/5 border-x-2 border-black p-2">Others</th>
                            <th className="w-1/5 border-x-2 border-black p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.reports.map((item,index)=>{
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-black">{new Date(item.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-black">{item.bus_number}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <span>{item.driver?.first_name} </span> 
                                            <span>{item.driver?.middle_name} </span> 
                                            <span>{item.driver?.last_name} </span>
                                            <span>{item.driver?.extension}</span>
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{item.conductor?.full_name}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            {
                                                item.report.map((rep,idx) => {
                                                    return <p key={idx}>{ rep?.item_name }</p>
                                                })
                                            }
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{item?.others}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button
                                                    onClick={()=>confirmDelete(item._id)}
                                                    className="p-2 rounded text-white font-bold bg-rose-400 hover:bg-rose-600"
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