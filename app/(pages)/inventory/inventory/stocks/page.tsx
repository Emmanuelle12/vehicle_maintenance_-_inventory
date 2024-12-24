'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt"
import Header from "@/app/components/Header"
import axios from "axios";
import { useCallback, useEffect, useState } from "react"

interface Inventory {
    _id: string;
    item_name: string;
    unit: string;
}

interface Stocks {
    item_type: Inventory;
    stocks: number;
    minimum_quantity: number;
    maximum_quantity: number;
}

export default function Stocks() {
    const [stocks, setStocks] = useState<Stocks[]>([])
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

    const getStocks = useCallback(async () => {
        await axios.get('/api/stocks')
        .then(response => {
            const st = response.data?.stocks
            setStocks(st)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getStocks()
    }, [getStocks])
    
    return (
        <div className="w-full">
            <Header title="STOCKS" backTo={'/inventory/inventory'} />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <section className="w-full bg-white min-h-80 2xl:min-h-96 overflow-auto">
                <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border-x-2 border-black">Item</th>
                            <th className="p-2 border-x-2 border-black">Stock</th>
                            <th className="p-2 border-x-2 border-black">Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            stocks.map((st,ix) => {
                                return (
                                    <tr key={ix}>
                                        <td className="p-2 border-x-2 border-black">{st.item_type.item_name}</td>
                                        <td className="p-2 border-x-2 border-black">{st.stocks}</td>
                                        <td className="p-2 border-x-2 border-black">{st.item_type.unit}</td>
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