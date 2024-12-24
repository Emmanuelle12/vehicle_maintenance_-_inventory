'use client'

import DashboardPanel from "@/app/components/DashboardPanel";
import Header from "@/app/components/Header"
import axios from "axios";
import { useCallback, useEffect, useState } from "react"

interface User {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
    email: string;
}

interface Conductor {
    _id: string;
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

export default function DriverReport() {
    const [reports, setReports] = useState<Report[]>([])
    const [reportArr, setReportArr] = useState<Report[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(false)

    const pathArray = [
        { path: '/admin/maintenance/driver', name: 'Drivers Report' },
        { path: '/admin/maintenance/mechanic', name: 'Mechanic Report' },
    ]

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const getReports = useCallback(async () => {
        await axios.get('/api/drivers')
        .then(response => {
            const rep = response.data?.reports
            setReports(rep)
            setReportArr(rep)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    const handleSearch = (key: string) => {
        const temp = reportArr.filter(data => 
            data.driver.first_name.toLowerCase().includes(key.toLowerCase()) ||
            data.driver.middle_name.toLowerCase().includes(key.toLowerCase()) ||
            data.driver.last_name.toLowerCase().includes(key.toLowerCase()) ||
            data?.conductor?.full_name?.toLowerCase().includes(key.toLowerCase()) ||
            data.bus_number.toLowerCase().includes(key.toLowerCase()) 
        )
        setReports(temp)
    }

    useEffect(() => {
        getReports()
    }, [getReports])

    return (
        <div className="w-full">
            <DashboardPanel isHidden={hidePanel} navs={pathArray} toggle={togglePanel} slider={true} />
            <Header title="DRIVERS REPORT" backTo={'/admin'} searchFunction={handleSearch} />
            <section className="w-full bg-white min-h-80">
                <table className="w-full table-auto md:table-fixed text-center text-sm">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black p-2">Date</th>
                            <th className="border-x-2 border-black p-2">Bus Number</th>
                            <th className="border-x-2 border-black p-2">Driver</th>
                            <th className="border-x-2 border-black p-2">Conductor</th>
                            <th className="w-1/4 border-x-2 border-black p-2">Report</th>
                            <th className="w-1/4 border-x-2 border-black p-2">Others</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.map((item,index)=>{
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
                                        <td className="p-2 border-x-2 border-black">{item?.conductor?.full_name}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            {
                                                item.report.map((rep,idx) => {
                                                    return <p key={idx}>{ rep?.item_name }</p>
                                                })
                                            }
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{item.others}</td>
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