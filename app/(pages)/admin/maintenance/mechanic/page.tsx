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

interface Inventory {
    _id: string;
    item_name: string;
    unit: string;
}

interface ReportItem {
    _id: string;
    inventory: Inventory;
    quantity: number;
}

interface Report {
    _id: string;
    report_date: Date;
    bus_number: string;
    driver: User;
    conductor: Conductor;
    report: ReportItem[];
    narrative_report: string;
    repair_status: string;
    createdAt: Date;
}

export default function MechanicReport() {
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
    
    const handleSearch = (key: string) => {
        const temp = reportArr.filter(data => 
            data.driver.first_name.toLowerCase().includes(key.toLowerCase()) ||
            data.driver.middle_name.toLowerCase().includes(key.toLowerCase()) ||
            data.driver.last_name.toLowerCase().includes(key.toLowerCase()) ||
            data.conductor?.full_name.toLowerCase().includes(key.toLowerCase()) ||
            data.bus_number.toLowerCase().includes(key.toLowerCase()) 
        )
        setReports(temp)
    }

    const getReports = useCallback(async () => {
        await axios.get('/api/mechanic')
        .then(response => {
            const rep = response.data?.reports
            setReports(rep)
            setReportArr(rep)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getReports()
    }, [getReports])

    return (
        <div className="w-full">
            <DashboardPanel isHidden={hidePanel} navs={pathArray} toggle={togglePanel} slider={true} />
            <Header title="MECHANIC REPORTS" backTo="/admin" searchFunction={handleSearch} />
            <section className="w-full bg-white min-h-80">
                <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black">Date</th>
                            <th className="border-x-2 border-black">Repair Status</th>
                            <th className="border-x-2 border-black">Bus Number</th>
                            <th className="border-x-2 border-black">Driver</th>
                            <th className="border-x-2 border-black">Conductor</th>
                            <th className="w-1/4 border-x-2 border-black">Report</th>
                            <th className="w-1/4 border-x-2 border-black">Narrative Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.map((item,index)=>{
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-black">{new Date(item.report_date).toLocaleDateString('en-US')}</td>
                                        <td className="p-2 border-x-2 border-black">{item?.repair_status}</td>
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
                                                    return(
                                                        <p key={idx} className="mb-2">
                                                            Item: <span className="font-bold">{rep?.inventory?.item_name} </span>
                                                            Quantity: <span className="font-bold">{rep.quantity} per {rep.inventory.unit}</span>
                                                        </p>
                                                    )
                                                })
                                            }
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{item?.narrative_report}</td>
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