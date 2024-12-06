'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import Header from "@/app/components/Header"
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface inventoryReport {
    item_type: Item;
    quantity: number;
    recipient?: string;
    driver: User;
    bus_number: string;
    createdAt: Date;
}

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

export default function Archive() {
    const [reports, setReports] = useState<inventoryReport[]>([])
    const [reportsArr, setReportsArr] = useState<inventoryReport[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(true)

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/inventory', name: 'Home'},
        {path: '/inventory/report', name: 'Mechanic Reports & Inventory Reports'},
        {path: '/inventory/purchase-order', name: 'Purchase Orders'},
        {path: '/inventory/inventory', name: 'Inventory'},
    ]
    
    const handleSearch = (key: string) => {
        const temp = reportsArr.filter(data => 
            data.bus_number.toLowerCase().includes(key.toLowerCase()) ||
            data.driver?.first_name.toLowerCase().includes(key.toLowerCase()) ||
            data.driver?.middle_name.toLowerCase().includes(key.toLowerCase()) ||
            data.driver?.last_name.toLowerCase().includes(key.toLowerCase()) 
        )
        setReports(temp)
    }

    const getArchive = useCallback(async () => {
        await axios.get('/api/inventory-report/archive')
        .then(response => {
            const rep = response.data?.archive ?? []
            setReports(rep)
            setReportsArr(rep)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getArchive()
    }, [getArchive])

    return (
        <div className="w-full">
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="INVENTORY PERSONNEL REPORT ARCHIVE" backTo={'/inventory/report'} searchFunction={handleSearch} />
            <section className="w-full min-h-80 2xl:min-h-96 bg-white overflow-auto">
                <table className="table-auto md:table-fixed w-full text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border-x-2 border-b border-black">Date</th>
                            <th className="p-2 border-x-2 border-b border-black">Type</th>
                            <th className="p-2 border-x-2 border-b border-black">Quantity</th>
                            <th className="p-2 border-x-2 border-b border-black">Bus Number</th>
                            <th className="p-2 border-x-2 border-b border-black">Driver</th>
                            <th className="p-2 border-x-2 border-b border-black">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.map((item,index) => {
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-b border-black">{new Date(item.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{item?.item_type?.item_name}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{item.quantity}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{item.bus_number}</td>
                                        <td className="p-2 border-x-2 border-b border-black">
                                            <span>{item.driver.first_name} </span>
                                            <span>{item.driver.middle_name} </span>
                                            <span>{item.driver.last_name} </span>
                                            <span>{item.driver.extension} </span>
                                        </td>
                                        <td className="p-2 border-x-2 border-b border-black">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button className="p-2 rounded text-white text-sm font-bold bg-teal-400 hover:bg-teal-600">
                                                    Restore
                                                </button>
                                                <button className="p-2 rounded text-white text-sm font-bold bg-rose-400 hover:bg-rose-600">
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