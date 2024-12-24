'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt"
import Header from "@/app/components/Header"
import axios from "axios"
import { useCallback, useEffect, useState } from "react"

interface Inventory {
    item_name: string;
}

interface Supplier {
    supplier_company: string;
}

interface Order {
    _id: string;
    inventory: Inventory;
    supplier: Supplier;
    brand: string;
    description: string;
    date_ordered: Date;
    date_received: Date | null;
    unit_cost: number;
    quantity: number;
    total_price: number;
    status: string;
}

interface OrdersReceivedReports {
    _id: string;
    order: Order;
    narrative_report: string;
    createdAt: Date;
}

export default function Received() {
    const [reports, setReports] = useState<OrdersReceivedReports[]>([])
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

    const getReports = useCallback(async () => {
        await axios.get('/api/orders_received_reports')
        .then(response => {
            const rep = response.data?.reports
            setReports(rep)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getReports()
    }, [getReports])

    return(
        <div className="w-full">
            <Header title="ORDERS RECEIVED REPORTS" backTo={'/inventory/purchase-order'} goTo={'/inventory/report'}  />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <section className="w-full min-h-80 2xl:min-h-96 bg-white overflow-auto">
                <table className="w-full table-auto md:table-fixed text-center text-xs">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border-x-2 border-black p-2">Date</th>
                            <th className="border-x-2 border-black p-2">Item Name</th>
                            <th className="border-x-2 border-black p-2">Brand</th>
                            <th className="border-x-2 border-black p-2">Description</th>
                            <th className="border-x-2 border-black p-2">Supplier</th>
                            <th className="border-x-2 border-black p-2">Purchase Quantity</th>
                            <th className="border-x-2 border-black p-2">Cost Per Item</th>
                            <th className="border-x-2 border-black p-2">Total Purchase Value</th>
                            <th className="border-x-2 border-black p-2">Narrative Report</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.map((rep,index) => {
                                return(
                                    <tr key={index}>
                                        <td className="border-x-2 border-black p-2">{new Date(rep.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="border-x-2 border-black p-2">{rep.order.inventory.item_name}</td>
                                        <td className="border-x-2 border-black p-2">{rep.order.brand}</td>
                                        <td className="border-x-2 border-black p-2">{rep.order.description}</td>
                                        <td className="border-x-2 border-black p-2">{rep.order.supplier.supplier_company}</td>
                                        <td className="border-x-2 border-black p-2">{rep.order.quantity}</td>
                                        <td className="border-x-2 border-black p-2">{rep.order.unit_cost}</td>
                                        <td className="border-x-2 border-black p-2">{rep.order.total_price}</td>
                                        <td className="border-x-2 border-black p-2">{rep.narrative_report}</td>
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