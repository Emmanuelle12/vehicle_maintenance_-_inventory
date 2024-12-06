'use client'

import Header from "@/app/components/Header"
import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { FaPencilAlt } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useAlert } from "@/app/contexts/AlertContext"
import { useConfirmation } from "@/app/contexts/ConfirmationContext"
import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";

interface Supplier {
    _id: string;
    supplier_company: string;
    supplier_address: string;
    contact: string;
}

interface SupplierState {
    suppliers: Supplier[];
    supplierArr: Supplier[];
    loading: boolean;
}

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState<SupplierState>({
        suppliers: [],
        supplierArr: [],
        loading: true
    })
    const { triggerAlert } = useAlert()
    const { confirm } = useConfirmation()
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

    const searchSupplier = (key: string) => {
        const temp = suppliers.supplierArr.filter(data => 
            data.supplier_company.toLowerCase().includes(key.toLowerCase()) ||
            data.supplier_address.toLowerCase().includes(key.toLowerCase()) 
        )   
        setSuppliers({
            ...suppliers,
            suppliers: temp
        })
    }

    const confirmDelete = (id: string) => {
        confirm({
            message: 'Are you sure you want to delete supplier?',
            onConfirm: () => {
                deleteSupplier(id)
            },
            onCancel: () => {

            }
        })
    }

    const deleteSupplier = async (id: string) => {
        await axios.delete(`/api/suppliers?supplierId=${id}`)
        .then(response => {
            triggerAlert(response.data?.message, 'success')
        })
        .catch(error => {
            console.log(error)
            triggerAlert(error?.response?.data?.message, 'error')
        })
    }

    const getSuppliers = useCallback(async () => {
        await axios.get('/api/suppliers')
        .then(response => {
            const temp = response.data?.suppliers
            setSuppliers({
                suppliers: temp,
                supplierArr: temp,
                loading: false
            })
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(()=>{
        getSuppliers()
    }, [])

    return (
        <div className="w-full">
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="SUPPLIERS" goTo={'/admin/suppliers/create'} searchFunction={searchSupplier}></Header>
            <section className="w-full bg-white min-h-80 2xl:min-h-96">
                <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black">Supplier Company</th>
                            <th className="border-x-2 border-black">Supplier Address</th>
                            <th className="border-x-2 border-black">Contact</th>
                            <th className="border-x-2 border-black w-1/2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            suppliers.suppliers.map((item,index)=>{
                                return(
                                    <tr key={index}>
                                        <td className="border-x-2 border-b border-black p-2">{ item.supplier_company }</td>
                                        <td className="border-x-2 border-b border-black p-2">{ item.supplier_address }</td>
                                        <td className="border-x-2 border-b border-black p-2">{ item.contact }</td>
                                        <td className="border-x-2 border-b border-black p-2 w-1/2">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button className="p-2 text-xs rounded bg-blue-400 hover:bg-blue-600 font-bold text-white flex items-center gap-2">
                                                    <FaPencilAlt />
                                                    EDIT
                                                </button>
                                                <button type="button" onClick={()=>confirmDelete(item._id)} className="p-2 text-xs rounded bg-red-400 hover:bg-red-600 font-bold text-white flex items-center gap-2">
                                                    <FaTrash />
                                                    DELETE
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