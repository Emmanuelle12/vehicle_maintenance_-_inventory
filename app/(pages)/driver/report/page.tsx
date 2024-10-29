'use client'

import { useEffect, useState } from "react";
import { useAuthStore } from "@/app/stores/auth";
import axios from "axios";
import Header from "@/app/components/Header";

interface User {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
    email: string;
}

interface Report {
    report_date: Date;
    bus_number: string;
    driver: User;
    conductor: string;
    report: string;
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

    const handleSearch = () => {

    }

    const getReports = async (id: string) => {
        await axios.get(`/api/drivers?driverId=${id}`)
        .then(response => {
            console.log(response)
            const rep = response.data?.reports
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

    return(
        <div className="w-full">
            <Header title="DRIVERS REPORTS" backTo="/" goTo={'/driver/report/create'} searchFunction={handleSearch} />
            <section className="w-full bg-white min-h-80">
                <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black">Date</th>
                            <th className="border-x-2 border-black">Bus Number</th>
                            <th className="border-x-2 border-black">Driver</th>
                            <th className="border-x-2 border-black">Conductor</th>
                            <th className="w-1/2 border-x-2 border-black">Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.reports.map((item,index)=>{
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-black">{new Date(item.report_date).toLocaleDateString('en-US')}</td>
                                        <td className="p-2 border-x-2 border-black">{item.bus_number}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            {item.driver.first_name} 
                                            {item.driver.middle_name} 
                                            {item.driver.last_name} 
                                            {item.driver?.extension}
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{item.conductor}</td>
                                        <td className="p-2 border-x-2 border-black">{item.report}</td>
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