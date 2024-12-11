'use client'

import Header from "@/app/components/Header"
import axios, { AxiosResponse } from "axios"
import { useCallback, useEffect, useState } from "react"
import Swal from "sweetalert2"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import { useAuthStore } from "@/app/stores/auth"
import DashboardPanelAlt from "@/app/components/DashboardPanelAlt"

interface Inventory {
    item_name: string;
    unit: string;
}

interface Supplier {
    supplier_company: string;
}

interface PurchaseOrder {
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

export default function PurchaseOrder() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([])
    const [orderArr, setOrderArr] = useState<PurchaseOrder[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(true)
    const store = useAuthStore()

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const searchFunction = (key: string) => {
        const temp = orders.filter(data => 
            data.inventory.item_name.toLowerCase().includes(key.toLowerCase()) ||
            data.brand.toLowerCase().includes(key.toLowerCase()) ||
            data.supplier.supplier_company.toLowerCase().includes(key.toLowerCase()) ||
            data?.status?.toLowerCase()?.includes(key.toLowerCase())
        )
        setOrderArr(temp)
    }

    const getPO = useCallback(async () => {
        await axios.get('/api/purchase-order')
        .then(response => {
            const po = response.data?.orders
            setOrders(po)
            setOrderArr(po)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getPO()
    }, [getPO])

    const confirmReceive = (item: PurchaseOrder) => {
        Swal.fire({
            title: 'Receive Confirmation',
            html: `
                <div class="text-left">
                    <p><strong>Item Name:</strong> ${item.inventory.item_name}</p>
                    <p><strong>Brand:</strong> ${item.brand}</p>
                    <p><strong>Supplier:</strong> ${item.supplier.supplier_company}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong><u>Unit Cost:</strong> $${item.unit_cost.toFixed(2)}</u></p>
                    <p><strong>Total Price:</strong> $${item.total_price.toFixed(2)}</p>
                    <br>
                    <p style="text-align: center;">Are you sure you want to continue?</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
        })
        .then(response => {
            if (response.isConfirmed) {
                receiveItem(item._id)
            }
        })
    }

    const receiveItem = async (id: string) => {
        const uid = store.user.id
        toast.promise(
            axios.put(`/api/purchase-order?order_id=${id}`, { user_id: uid }),
            {
                pending: 'Receiving...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        const po = data.data?.orders
                        setOrders(po)
                        setOrderArr(po)
                        return 'Received'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Error',
                            text: data.data?.message,
                            icon: 'error'
                        })
                        return 'Error'
                    }
                }
            }
        )
    }

    const confirmArchive = (id: string) => {
        Swal.fire({
            title: 'Archive Confirmation',
            text: 'Are you sure you want to continue?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
        })
        .then(response => {
            if (response.isConfirmed) {
                archivePO(id)
            }
        })
    }

    const archivePO = async (id: string) => {
        const uid = store.user.id
        toast.promise(
            axios.patch(`/api/purchase-order?order_id=${id}`, { user_id: uid }),
            {
                pending: 'Archiving...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        const po = data.data?.orders
                        setOrders(po)
                        setOrderArr(po)
                        return 'Archived'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Error',
                            text: data.data?.message,
                            icon: 'error'
                        })
                        return 'Error'
                    }
                }
            }
        )
    }

    const navigationArray = [
        {path: '/admin', name: 'Home'},
        {path: '/admin/purchase-order', name: 'Purchase Orders'},
        {path: '/admin/inventory', name: 'Inventory'},
        {path: '/admin/suppliers', name: 'Suppliers'},
    ]

    return (
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="PURCHASE ORDERS" searchFunction={searchFunction} goTo={'/admin/purchase-order/create'} goTo2={{path: '/admin/purchase-order/archive', title: 'Archive'}} />
            <section className="w-full bg-white min-h-80 2xl:min-h-96 overflow-auto">
                <table className="w-full table-auto md:table-fixed text-center text-xs">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black p-2">Status</th>
                            <th className="border-x-2 border-black p-2">Date</th>
                            <th className="border-x-2 border-black p-2">Item Name</th>
                            <th className="border-x-2 border-black p-2">Brand</th>
                            <th className="border-x-2 border-black p-2">Description</th>
                            <th className="border-x-2 border-black p-2">Unit</th>
                            <th className="border-x-2 border-black p-2">Supplier</th>
                            <th className="border-x-2 border-black p-2">Purchase Quantity</th>
                            <th className="border-x-2 border-black p-2">Cost Per Item</th>
                            <th className="border-x-2 border-black p-2">Total Purchase Value</th>
                            <th className="border-x-2 border-black p-2 md:w-1/6">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            orderArr.map((item,index) => {
                                return (
                                    <tr key={index}>
                                        <td className="border-x-2 border-black p-2">{item.status}</td>
                                        <td className="border-x-2 border-black p-2">{new Date(item.date_ordered).toLocaleDateString('en-PH')}</td>
                                        <td className="border-x-2 border-black p-2">{item.inventory?.item_name}</td>
                                        <td className="border-x-2 border-black p-2">{item?.brand}</td>
                                        <td className="border-x-2 border-black p-2">{item.description}</td>
                                        <td className="border-x-2 border-black p-2">{item.inventory?.unit}</td>
                                        <td className="border-x-2 border-black p-2">{item.supplier?.supplier_company}</td>
                                        <td className="border-x-2 border-black p-2">{item.quantity}</td>
                                        <td className="border-x-2 border-black p-2">{item.unit_cost.toFixed(2)}</td>
                                        <td className="border-x-2 border-black p-2">{item.total_price.toFixed(2)}</td>
                                        <td className="border-x-2 border-black p-2">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                {
                                                    item.status == 'pending' && (
                                                        <button onClick={()=>confirmReceive(item)} className="p-2 rounded text-xs text-white font-bold bg-indigo-400 hover:bg-indigo-600">
                                                            Receive
                                                        </button>
                                                    )
                                                }
                                                <button onClick={()=>confirmArchive(item._id)} className="p-2 rounded text-xs text-white font-bold bg-rose-400 hover:bg-rose-600">
                                                    Archive
                                                </button>
                                                <button className="p-2 rounded text-xs text-white font-bold bg-cyan-400 hover:bg-cyan-600">Reorder</button>
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