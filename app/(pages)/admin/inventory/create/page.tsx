'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt"
import Header from "@/app/components/Header"
import axios, { AxiosError } from "axios"
import { FormEvent, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Swal from "sweetalert2"

export default function Create() {
    const [itemName, setItemName] = useState<string>('')
    const [unit, setUnit] = useState<string>('')
    const [minNum, setMinNum] = useState<number>(0)
    const [maxNum, setMaxNum] = useState<number>(0)
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        toast.promise(
            axios.post('/api/inventory', { item_name: itemName, unit: unit, min_num: minNum, max_num: maxNum }),
            {
                pending: 'Creating item...',
                success: {
                    render() {
                        setItemName('')
                        return 'Item created'
                    }
                },
                error: {
                    render({ data }: { data: AxiosError }) {
                        console.log(data)
                        const message = data?.message
                        Swal.fire({
                            title: 'Error',
                            text: message,
                            icon: 'error'
                        })
                        return 'Error'
                    }
                }
            }
        )
    }

    return (
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="CREATE INVENTORY ITEM" backTo={'/admin/inventory'} />
            <section className="w-full flex justify-center items-center">
                <form onSubmit={handleSubmit}>
                    <div className="w-96 space-y-2">
                        <div className="w-full">
                            <label htmlFor="item_name" className="text-xs text-amber-400 font-bold">Item Name:</label>
                            <input 
                                type="text" 
                                name="item_name" 
                                id="item_name" 
                                className="w-full p-2 text-sm rounded" 
                                value={itemName}
                                onChange={(e)=>setItemName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="unit" className="text-xs text-amber-400 font-bold">Unit:</label>
                            <input 
                                type="text" 
                                name="unit" 
                                id="unit" 
                                className="w-full p-2 text-sm rounded" 
                                value={unit}
                                onChange={(e)=>setUnit(e.target.value)}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="minNum" className="text-xs text-amber-400 font-bold">Minimum Quantity for Notification:</label>
                            <input 
                                type="number" 
                                name="minNum" 
                                id="minNum" 
                                className="w-full p-2 text-sm rounded" 
                                value={minNum}
                                onChange={(e)=>setMinNum(Number(e.target.value))}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="maxNum" className="text-xs text-amber-400 font-bold">Maximum Quantity for Notification:</label>
                            <input 
                                type="number" 
                                name="maxNum" 
                                id="maxNum" 
                                className="w-full p-2 text-sm rounded" 
                                value={maxNum}
                                onChange={(e)=>setMaxNum(Number(e.target.value))}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full p-2 text-sm text-white font-bold rounded bg-amber-400 hover:bg-amber-600">SUBMIT</button>
                    </div>
                </form>
            </section>
        </div>
    )
}