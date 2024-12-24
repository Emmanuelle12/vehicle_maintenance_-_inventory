'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt"
import Header from "@/app/components/Header"
import axios, { AxiosError } from "axios"
import { ChangeEvent, FormEvent, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Swal from "sweetalert2"
import CreatableSelect from 'react-select/creatable';
import { OnChangeValue } from 'react-select';

interface Staff {
    full_name: string;
    position: string;
}

type OptionType = {
    label: string;
    value: string;
}

export default function Create() {
    const [hidePanel, setHidePanel] = useState<boolean>(true)
    const [selectedOption, setSelectedOption] = useState<OptionType | null>(null)
    const [staffForm, setStaffForm] = useState<Staff>({
        full_name: "",
        position: "",
    })

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
        setStaffForm({
            ...staffForm,
            [name]: value
        })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const updatedStaffForm: Staff = {
            ...staffForm,
            position: selectedOption?.value || "",
        } 
        toast.promise(
            axios.post('/api/staffs', updatedStaffForm),
            {
                pending: 'Creating staff...',
                success: 'Staff created successfully.',
                error: {
                    render({ data }: { data: AxiosError<{message: string}> }) {
                        Swal.fire({
                            title: 'Error',
                            text: data.response?.data?.message ?? data.message,
                            icon: 'error',
                        })
                        return 'Error'
                    }
                }
            }
        )
    }

    const handleChange = (
        newValue: OnChangeValue<OptionType, false>
      ) => {
        setSelectedOption(newValue);
    }

    const options: OptionType[] = [
        { value: 'conductor', label: 'Conductor' },
    ]

    return(
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="CREATE STAFFS" backTo={'/admin/staff'} />
            <section className="w-full flex justify-center items-center md:h-96 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col w-full gap-2">
                        <div className="w-full group">
                            <label htmlFor="full_name" className="text-xs font-bold">Full Name:</label>
                            <input 
                                type="text" 
                                name="full_name" 
                                id="full_name" 
                                className="w-full p-2 rounded"
                                onChange={handleOnChange} 
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="w-full group">
                            <label htmlFor="position" className="text-xs font-bold">Position:</label>
                            <CreatableSelect
                                isClearable
                                onChange={handleChange}
                                options={options}
                                placeholder="Enter or Select Position"
                            />
                        </div>
                        <button className="w-full p-2 font-bold rounded bg-amber-400 hover:bg-amber-600">CREATE</button>
                    </div>
                </form>
            </section>
        </div>
    )
}