'use client'

import Header from "@/app/components/Header"
import { useAuthStore } from "@/app/stores/auth";
import axios, { AxiosResponse } from "axios"
import { useCallback, useEffect, useState } from "react"
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";

interface Inventory {
    item_name: string;
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
    const store = useAuthStore()
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
            console.log(response)
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

    const confirmReceive = (id: string) => {
        Swal.fire({
            title: 'Receive Confirmation',
            text: 'Are you sure you want to continue?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo',
        })
        .then(response => {
            if (response.isConfirmed) {
                receiveOrder(id)
            }
        })
    }

    // const confirmReorder = (id: string) => {
    //     Swal.fire({
    //         title: 'Reorder Confirmation',
    //         text: 'Are you sure you want to continue?',
    //         icon: 'question',
    //         showCancelButton: true,
    //         showConfirmButton: true,
    //         cancelButtonColor: 'red',
    //         confirmButtonColor: 'indigo',
    //     })
    //     .then(response => {
    //         if (response.isConfirmed) {
    //             reorder(id)
    //         }
    //     })
    // }

    const receiveOrder = async (id: string) => {
        const uid = store.user.id
        toast.promise(
            axios.put(`/api/purchase-order?order_id=${id}`, { user_id: uid }),
            {
                pending: 'Receiving order...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        const ord = data?.data?.orders
                        setOrders(ord)
                        setOrderArr(ord)
                        return 'Order received'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        Swal.fire({
                            title: 'Receive Error',
                            text: data.data?.message,
                            icon: 'error'
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    // const reorder = async (id: string) => {
    //     const uid = store.user.id
    //     toast.promise(
    //         axios.post(`/api/purchase-order/reorder?order_id=${id}`, {
    //             user_id: uid
    //         }),
    //         {
    //             pending: 'Reordering...',
    //             success: {
    //                 render({ data }: { data: AxiosResponse }) {
    //                     const ord = data.data?.orders
    //                     setOrders(ord)
    //                     setOrderArr(ord)
    //                     return 'Reordered successfully'
    //                 }
    //             },
    //             error: {
    //                 render({ data }: { data: AxiosResponse }) {
    //                     Swal.fire({
    //                         title: 'Reorder Error',
    //                         text: data?.data?.message
    //                     })
    //                     return 'ERROR'
    //                 }
    //             }
    //         }
    //     )
    // }

    return (
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="PURCHASE ORDERS" searchFunction={searchFunction}/>
            <section className="w-full bg-white min-h-80 2xl:min-h-96 overflow-auto">
                <table className="w-full table-auto md:table-fixed text-center text-xs">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black p-2">Status</th>
                            <th className="border-x-2 border-black p-2">Date</th>
                            <th className="border-x-2 border-black p-2">Item Name</th>
                            <th className="border-x-2 border-black p-2">Brand</th>
                            <th className="border-x-2 border-black p-2">Description</th>
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
                                        <td className="border-x-2 border-black p-2">{item.supplier?.supplier_company}</td>
                                        <td className="border-x-2 border-black p-2">{item.quantity}</td>
                                        <td className="border-x-2 border-black p-2">{item.unit_cost.toFixed(2)}</td>
                                        <td className="border-x-2 border-black p-2">{item.total_price.toFixed(2)}</td>
                                        <td className="border-x-2 border-black p-2">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                {
                                                    item.status == 'pending' && 
                                                    <button onClick={()=>confirmReceive(item._id)} className="p-2 rounded text-xs text-white font-bold bg-indigo-400 hover:bg-indigo-600">
                                                        Receive
                                                    </button>
                                                }
                                                {/* <button className="p-2 rounded text-xs text-white font-bold bg-rose-400 hover:bg-rose-600">Archive</button> */}
                                                {/* <button onClick={()=>confirmReorder(item._id)} className="p-2 rounded text-xs text-white font-bold bg-cyan-400 hover:bg-cyan-600">Reorder</button> */}
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