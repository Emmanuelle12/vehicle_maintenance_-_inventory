'use client'

import Header from "@/app/components/Header"
import axios, { AxiosError } from "axios"
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react"
import { IoIosBusiness } from "react-icons/io";
import { HiLocationMarker } from "react-icons/hi";
import { BsFillTelephoneFill } from "react-icons/bs";
import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Swal from "sweetalert2";

interface Supplier {
    supplier_company: string;
    supplier_address: string;
    contact: string;
}

export default function Edit({ params }: { params: { slug: string } }) {
    const [supplier, setSupplier] = useState<Supplier>({
        supplier_company: '',
        supplier_address: '',
        contact: '',
    })
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

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSupplier({
            ...supplier,
            [name]: value
        })
    }

    const getSupplier = useCallback(async () => {
        await axios.get(`/api/suppliers?supplier_id=${params.slug}`)
        .then(response => {
            const supp = response.data?.supplier
            setSupplier(supp)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getSupplier()
    }, [getSupplier])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        toast.promise(
            axios.patch(`/api/suppliers?supplier_id=${params.slug}`, supplier),
            {
                pending: 'Updating supplier...',
                success: 'Updated',
                error: {
                    render({ data }: { data: AxiosError<{message: string}> }) {
                        Swal.fire({
                            title: 'Update Error',
                            text: data.response?.data?.message ?? data.message,
                            icon: 'error'
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    return (
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="CREATE SUPPLIER" backTo={'/admin/suppliers'} />
            <form onSubmit={handleSubmit} className="w-full flex justify-center items-center">
                <section className="w-96 space-y-3 mt-10 p-5">
                    <div className="group w-full flex justify-center items-center bg-white p-2 rounded ring-2 focus-within:ring ring-black gap-2">
                        <label htmlFor="supplier_company" className="">
                            <IoIosBusiness className="text-black w-5 h-5" />
                        </label>
                        <input 
                            onChange={handleOnChange} 
                            type="text" 
                            name="supplier_company" 
                            id="supplier_company" 
                            className="w-full px-2 outline-none border-l border-black" 
                            placeholder="Supplier Company"
                            value={supplier.supplier_company}
                        />
                    </div>
                    <div className="group w-full flex justify-center items-center bg-white p-2 rounded ring-2 focus-within:ring ring-black gap-2">
                        <label htmlFor="supplier_address" className="">
                            <HiLocationMarker className="text-black w-5 h-5" />
                        </label>
                        <input 
                            onChange={handleOnChange} 
                            type="text" 
                            name="supplier_address" 
                            id="supplier_address" 
                            className="w-full px-2 outline-none border-l border-black" 
                            placeholder="Supplier Address"
                            value={supplier.supplier_address}
                        />
                    </div>
                    <div className="group w-full flex justify-center items-center bg-white p-2 rounded ring-2 focus-within:ring ring-black gap-2">
                        <label htmlFor="contact" className="">
                            <BsFillTelephoneFill className="text-black w-5 h-5" />
                        </label>
                        <input 
                            onChange={handleOnChange} 
                            type="text" 
                            name="contact" 
                            id="contact" 
                            className="w-full px-2 outline-none border-l border-black" 
                            placeholder="Contact"
                            value={supplier.contact}
                        />
                    </div>
                    <button type="submit" className="w-full rounded bg-yellow-600 hover:bg-yellow-500 p-2 font-bold">
                        SAVE
                    </button>
                </section>
            </form>
        </div>
    )
}