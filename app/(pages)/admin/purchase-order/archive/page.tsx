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

export default function Archive() {
    const [archive, setArchive] = useState<PurchaseOrder[]>([])
    const [archiveArr, setArchiveArr] = useState<PurchaseOrder[]>([])
    const store = useAuthStore()
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

    const handleSearch = (key: string) => {
        const temp = archiveArr.filter(data => 
            data.inventory.item_name.toLowerCase().includes(key.toLowerCase()) ||
            data.brand.toLowerCase().includes(key.toLowerCase()) ||
            data.supplier.supplier_company.toLowerCase().includes(key.toLowerCase()) ||
            data?.status?.toLowerCase()?.includes(key.toLowerCase())
        )
        setArchive(temp)
    }

    const getArchive = useCallback(async () => {
        await axios.get('/api/purchase-order/archive')
        .then(response => {
            const arc = response.data?.archive
            setArchive(arc)
            setArchiveArr(arc)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getArchive()
    }, [getArchive])

    const confirmRestore = (id: string) => {
        Swal.fire({
            title: 'Restore Confirmation',
            text: 'Are you sure you want to restore?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
        })
        .then(response => {
            if (response.isConfirmed) {
                restorePO(id)
            }
        })
    }

    const restorePO = async (id: string) => {
        const uid = store.user.id
        toast.promise(
            axios.patch(`/api/purchase-order/archive?order_id=${id}`, { user_id: uid }),
            {
                pending: 'Restoring...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        const arc = data.data?.archive
                        setArchive(arc)
                        setArchiveArr(arc)
                        return 'Restored'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data, 'asd')
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

    const confirmDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Confirmation',
            text: 'Are you sure you want to permanently delete?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
        })
        .then(response => {
            if (response.isConfirmed) {
                deletePO(id)
            }
        })
    }

    const deletePO = async (id: string) => {
        const uid = store.user.id
        toast.promise(
            axios.delete(`/api/purchase-order/archive`, { params: { order_id: id, user_id: uid } }),
            {
                pending: 'Deleting...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        const arc = data.data?.archive
                        setArchive(arc)
                        setArchiveArr(arc)
                        return 'Deleted'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Error',
                            text: data.statusText,
                            icon: 'error',
                        })
                        return 'Error'
                    }
                }
            }
        )
    }

    return(
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="PURCHASE ORDERS ARCHIVE" backTo={'/admin/purchase-order'} searchFunction={handleSearch} />
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
                            archive.map((item,index) => {
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
                                                <button onClick={()=>confirmRestore(item._id)} className="p-2 rounded text-white text-sm font-bold bg-teal-400 hover:bg-teal-600">
                                                    Restore
                                                </button>
                                                <button onClick={()=>confirmDelete(item._id)} className="p-2 rounded text-white text-sm font-bold bg-rose-400 hover:bg-rose-600">
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