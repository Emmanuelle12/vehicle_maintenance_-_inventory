'use client'

import Header from "@/app/components/Header"
import axios, { AxiosResponse } from "axios";
import { ChangeEvent, FormEvent, useState } from "react";
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from "@/app/stores/auth";
import Swal from "sweetalert2";

interface Report {
    mechanic: string
    bus_number: string;
    driver: string;
    conductor: string;
    report: string;
    report_date: Date | null;
}

export default function Create() {
    const [reportForm, setReportForm] = useState<Report>({
        mechanic: '',
        bus_number: '',
        driver: '',
        conductor: '',
        report: '',
        report_date: null,
    })
    const store = useAuthStore()

    const handleReport = async (e: FormEvent) => {
        e.preventDefault()
        const updatedForm: Report = {
            ...reportForm,
            mechanic: store.user?.id
        }
        toast.promise(
            axios.post('/api/mechanic', updatedForm),
            {
                pending: 'Creating report...',
                success: {
                    render() {
                        setReportForm({
                            mechanic: store.user.id,
                            bus_number: '',
                            driver: '',
                            conductor: '',
                            report: '',
                            report_date: null,
                        })
                        return 'Report created'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Report Error',
                            text: data.data?.message,
                            icon: 'error'
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    const handleOnChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setReportForm({
            ...reportForm,
            [name]: value
        })
    }

    return(
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <Header title="CREATE MAINTENANCE REPORT" backTo={'/mechanic/maintenance'} />
            <section className="w-full flex justify-center items-center h-96 overflow-y-auto">
                <form onSubmit={handleReport} className="w-96 pt-20 pb-10">
                    <div className="w-full space-y-2">
                        <div className="group w-full">
                            <label htmlFor="report_date" className="text-xs text-amber-400 font-bold">Date:</label>
                            <input 
                                onChange={handleOnChange} 
                                value={reportForm.report_date ? new Date(reportForm.report_date).toISOString().slice(0, 16) : ''}
                                type="datetime-local" 
                                name="report_date" 
                                id="report_date" 
                                className="p-2 rounded border border-black w-full" 
                            />
                        </div>
                        <div className="group w-full">
                            <label htmlFor="bus_number" className="text-xs text-amber-400 font-bold">Bus Number:</label>
                            <input 
                                type="text" 
                                name="bus_number" 
                                id="bus_number" 
                                className="p-2 rounded border border-black w-full" 
                                value={reportForm.bus_number}
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="group w-full">
                            <label htmlFor="driver" className="text-xs text-amber-400 font-bold">Driver:</label>
                            <input 
                                type="text" 
                                name="driver" 
                                id="driver" 
                                className="p-2 rounded border border-black w-full" 
                                value={reportForm.driver}
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="group w-full">
                            <label htmlFor="conductor" className="text-xs text-amber-400 font-bold">Conductor:</label>
                            <input 
                                type="text" 
                                name="conductor" 
                                id="conductor" 
                                className="p-2 rounded border border-black w-full" 
                                value={reportForm.conductor}
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="group w-full">
                            <label htmlFor="report" className="text-xs text-amber-400 font-bold">Report:</label>
                            <textarea 
                                name="report" 
                                id="report" 
                                className="p-2 rounded border border-black resize-none w-full"
                                value={reportForm.report}
                                onChange={handleOnChange}
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full p-2 rounded bg-indigo-400 hover:bg-indigo-600 text-white font-bold">Create</button>
                    </div>
                </form>
            </section>
        </div>
    )
}