'use client'

interface Supplier {
    _id: string;
    supplier_company: string;
    supplier_address: string;
    contact: string;
}

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import Header from "@/app/components/Header";
import axios from "axios";
import { useCallback, useEffect, useState } from "react"
import Swal from "sweetalert2";

export default function Archive() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [suppliersArr, setSuppliersArr] = useState<Supplier[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(true)

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/admin', name: 'Home'},
        {path: '/admin/maintenance/driver', name: 'Driver Report'},
        {path: '/admin/maintenance/mechanic', name: 'Mechanic Report'},
        {path: '/admin/purchase-order', name: 'Purchase Orders'},
        {path: '/admin/inventory', name: 'Inventory'},
        {path: '/admin/suppliers', name: 'Suppliers'},
        {path: '/admin/staff', name: 'Staffs'},
    ]

    const getSuppliers = useCallback(async () => {
        await axios.get('/api/suppliers/archive')
        .then(response => {
            const supp = response.data?.archive
            setSuppliers(supp)
            setSuppliersArr(supp)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getSuppliers()
    }, [getSuppliers])

    const searchSupplier = (key: string) => {
        const temp = suppliersArr.filter(data => 
            data.supplier_company.toLowerCase().includes(key.toLowerCase()) ||
            data.supplier_address.toLowerCase().includes(key.toLowerCase()) 
        )   
        setSuppliers(temp)
    }

    const confirmDelete = (id: string) => {
        Swal.fire({
            title: 'Delete Confirmation',
            text: 'Are you sure you want to permanently delete supplier?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo'
        })
        .then(response => {
            if (response.isConfirmed) {
                deleteSupplier(id)
            }
        })
    }

    const confirmRestore = (id: string) => {
        Swal.fire({
            title: 'Delete Confirmation',
            text: 'Are you sure you want to restore supplier?',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo'
        })
        .then(response => {
            if (response.isConfirmed) {
                restoreSupplier(id)
            }
        })
    }

    const deleteSupplier = async (id: string) => {
        await axios.delete(`/api/suppliers/archive?supplier_id=${id}`)
        .then(response => {
            const arc = response.data?.archive
            setSuppliers(arc)
            setSuppliersArr(arc)
        })
        .catch(error => {
            console.log(error)
        })
    }
    
    const restoreSupplier = async (id: string) => {
        await axios.patch(`/api/suppliers/archive?supplier_id=${id}`)
        .then(response => {
            const arc = response.data?.archive
            setSuppliers(arc)
            setSuppliersArr(arc)
        })
        .catch(error => {
            console.log(error)
        })
    }

    return(
        <div className="w-full">
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="SUPPLIERS ARCHIVE" backTo={'/admin/suppliers'} searchFunction={searchSupplier}></Header>
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
                            suppliers.map((item,index)=>{
                                return(
                                    <tr key={index}>
                                        <td className="border-x-2 border-b border-black p-2">{ item.supplier_company }</td>
                                        <td className="border-x-2 border-b border-black p-2">{ item.supplier_address }</td>
                                        <td className="border-x-2 border-b border-black p-2">{ item.contact }</td>
                                        <td className="border-x-2 border-b border-black p-2 w-1/2">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button type="button" onClick={()=>confirmRestore(item._id)} className="p-2 text-xs rounded bg-blue-400 hover:bg-blue-600 font-bold text-white flex items-center gap-2">
                                                    
                                                    RESTORE
                                                </button>
                                                <button type="button" onClick={()=>confirmDelete(item._id)} className="p-2 text-xs rounded bg-red-400 hover:bg-red-600 font-bold text-white flex items-center gap-2">
                                                    
                                                    ARCHIVE
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