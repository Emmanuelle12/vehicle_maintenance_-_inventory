'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import Header from "@/app/components/Header"
import axios from "axios";
import { useCallback, useEffect, useState } from "react"

interface Item {
    _id: string;
    item_name: string;
}

interface Order {
    inventory: Item;
    date_received: Date;
    quantity: number;
}

interface User {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
}

interface InventoryReport {
    _id: string;
    inventory: User;
    item_type: Item;
    quantity: number;
    recipient?: string;
    driver: User;
    bus_number: string;
    deletedAt?: Date;
    createdAt: Date;
}

export default function Inventory({ params }: { params: { slug: string } }) {
    const [item, setItem] = useState<Item>({
        _id: '',
        item_name: ''
    })
    const [itemIn, setItemIn] = useState<Order[]>([])
    const [panel, setPanel] = useState<string>('in')
    const [itemOut, setItemOut] = useState<InventoryReport[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(true)

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/admin', name: 'Home'},
        {path: '/admin/purchase-order', name: 'Purchase Orders'},
        {path: '/admin/inventory', name: 'Inventory'},
        {path: '/admin/suppliers', name: 'Suppliers'},
    ]

    const getData = useCallback(async () => {
        await axios.get(`/api/inventory?inventory_id=${params.slug}`)
        .then(response => {
            const inv = response.data?.inventory
            const po = response.data?.orders
            setItem(inv)
            setItemIn(po)
        })
    }, [])

    const getReports = useCallback(async () => {
        await axios.get(`/api/inventory-report/report?type_id=${params.slug}`)
        .then(response => {
            console.log(response)
            const rep = response.data?.reports
            setItemOut(rep)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getData()
        getReports()
    }, [getData, getReports])

    return (
        <div className="w-full">
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title={item.item_name} backTo={'/admin/inventory'} />
            <section className="w-full bg-gray-400">
                <header className="flex justify-start items-center">
                    <button 
                        onClick={()=>setPanel('in')} 
                        className={`p-2 text-sm text-white font-semibold hover:bg-gray-600 ${panel=='in' && 'bg-gray-500'}`}
                    >
                        STOCK IN
                    </button>
                    <button 
                        onClick={()=>setPanel('out')} 
                        className={`p-2 text-sm text-white font-semibold hover:bg-gray-600 ${panel=='out' && 'bg-gray-500'}`}
                    >
                        STOCK OUT
                    </button>
                </header>
            </section>
            <section className={`${panel=='in' ? 'w-full bg-white min-h-80 2xl:min-h-96 text-center overflow-auto' : 'hidden'}`}>
                <table className="w-full table-fixed">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-b border-black p-2">Date</th>
                            <th className="border-x-2 border-b border-black p-2">Type</th>
                            <th className="border-x-2 border-b border-black p-2">Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                            {
                                itemIn.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="border-x-2 border-b border-black p-2">{new Date(item.date_received).toLocaleDateString('en-PH')}</td>
                                            <td className="border-x-2 border-b border-black p-2">{item.inventory.item_name}</td>
                                            <td className="border-x-2 border-b border-black p-2">{item.quantity}</td>
                                        </tr>
                                    )
                                })
                            }
                    </tbody>
                </table>
            </section>
            
            <section className={`${panel=='out' ? 'w-full bg-white min-h-80 2xl:min-h-96 text-center overflow-auto' : 'hidden'}`}>
                <table className="w-full table-auto md:table-fixed">
                    <thead className="bg-gray-200">
                        <tr>
                            {/* <th className="border-r-2 border-b border-black p-2">Body No.</th> */}
                            <th className="border-x-2 border-b border-black p-2">Date</th>
                            <th className="border-x-2 border-b border-black p-2">Type</th>
                            <th className="border-x-2 border-b border-black p-2">Quantity Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            itemOut.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        {/* <td className="border-r-2 border-b border-black p-2">{}</td> */}
                                        <td className="border-r-2 border-b border-black p-2">{new Date(item.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="border-r-2 border-b border-black p-2">{item.item_type.item_name}</td>
                                        <td className="border-r-2 border-b border-black p-2">{item.quantity}</td>
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