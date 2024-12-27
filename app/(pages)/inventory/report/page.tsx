'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import Header from "@/app/components/Header"
import { useAuthStore } from "@/app/stores/auth";
import axios, { AxiosError, AxiosResponse } from "axios";
import { FormEvent, useCallback, useEffect, useState } from "react"
import { IoMdClose } from "react-icons/io";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'

interface User {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
    email: string;
}

interface Item {
    _id: string;
    item_name: string;
    unit: string;
}

interface ReportItem {
    _id: string;
    inventory: Item;
    quantity: number;
}

interface SubmittedReport {
    _id: string;
    bus_number: string;
    driver: User | null;
    conductor: Conductor | null;
    report: ReportItem[] | null;
    createdAt: Date;
    date_report: Date;
    status: string;
    mechanic: Mechanic | null;
}

interface Mechanic {
    _id: string;
}

interface inventoryReport {
    _id: string;
    item_type: Item;
    quantity: number;
    recipient?: string;
    driver: User;
    bus_number: string;
    createdAt: Date;
}

interface Conductor {
    _id: string;
    full_name: string;
}

export default function Report() {
    const [panel, setPanel] = useState<string>('mechanic')
    const [reportModal, setReportModal] = useState<boolean>(false)
    const [mechReports, setMechReports] = useState<SubmittedReport[]>([])
    const [mechRepArr, setMechRepArr] = useState<SubmittedReport[]>([])
    const [selectedReport, setSelectedReport] = useState<SubmittedReport>({
        _id: '',
        bus_number: '',
        driver: null,
        conductor: null,
        report: null,
        createdAt: new Date(),
        date_report: new Date(),
        status: '',
        mechanic: null,
    })
    const [quantity, setQuentity] = useState<number[]>([])
    const [reports, setReports] = useState<inventoryReport[]>([])
    const [reportsArr, setReportsArr] = useState<inventoryReport[]>([])
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

    const handleSearch = (key: string) => {
        if (panel == 'mechanic') {
            const temp = mechRepArr.filter(data => 
                data.bus_number.toLowerCase().includes(key.toLowerCase()) ||
                data.driver?.first_name.toLowerCase().includes(key.toLowerCase()) ||
                data.driver?.middle_name.toLowerCase().includes(key.toLowerCase()) ||
                data.driver?.last_name.toLowerCase().includes(key.toLowerCase()) ||
                data.report?.some(item => item?.inventory?.item_name.toLowerCase().includes(key.toLowerCase()))
            )
            setMechReports(temp)
        }
        else if (panel == 'inventory') {
            const temp = reportsArr.filter(data => 
                data.bus_number.toLowerCase().includes(key.toLowerCase()) ||
                data.driver?.first_name.toLowerCase().includes(key.toLowerCase()) ||
                data.driver?.middle_name.toLowerCase().includes(key.toLowerCase()) ||
                data.driver?.last_name.toLowerCase().includes(key.toLowerCase()) 
            )
            setReports(temp)
        }
    }

    const getData = useCallback(async () => {
        const id = store.user.id
        await axios.get(`/api/inventory-report?user_id=${id}`)
        .then(response => {
            console.log(response)
            const rep = response.data?.reports
            setReports(rep)
            setReportsArr(rep)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    const getMech = useCallback(async () => {
        await axios.get('/api/mechanic')
        .then(response => {
            console.log(response)
            const mec = response.data?.reports
            setMechReports(mec)
            setMechRepArr(mec)
        })
    }, [])

    const toggleModal = (rep: SubmittedReport) => {
        setReportModal(!reportModal)
        setSelectedReport(rep)
    }

    useEffect(() => {
        getData()
        getMech()
    }, [getData, getMech])

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const updatedTypes = selectedReport.report ? [...selectedReport.report.map(item => item._id)] : []
        const id = store.user.id
        console.log(updatedTypes)
        toast.promise(
            axios.post('/api/inventory-report', {
                _id: selectedReport._id,
                user_id: id,
                types: updatedTypes,
                quantities: quantity,
                driver: selectedReport.driver,
                bus_number: selectedReport.bus_number,
                mechanic: selectedReport.mechanic?._id,
            }),
            {
                pending: 'Submitting report...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        const rep = data.data?.reports
                        const mec = data.data?.mechanic_reports
                        setReports(rep)
                        setReportsArr(rep)
                        setMechReports(mec)
                        setMechRepArr(mec)
                        setReportModal(false)
                        return 'Success'
                    }
                },
                error: {
                    render({ data }: { data: AxiosError<{message: string}> }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Create Report Error',
                            text: data.response?.data?.message ?? data.message
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    const confirmArchive = (id: string) => {
        Swal.fire({
            title: 'Archive Confirmation',
            text: 'Are you sure you want to archive',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
        })
        .then(response => {
            if (response.isConfirmed) {
                archiveReport(id)
            }
        })
    }

    const archiveReport = async (id: string) => {
        const uid = store.user.id
        await axios.patch(`/api/inventory-report?report_id=${id}`, { user_id: uid })
        .then(response => {
            const arc = response.data?.archive ?? []
            setReports(arc)
            setReportsArr(arc)
        })
        .catch(error => {
            console.log(error)
        })
    }

    return(
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="INVENTORY PERSONNEL'S REPORT" goTo2={{path: '/inventory/report/archive', title: 'Archive'}} searchFunction={handleSearch} />
            <div className={`${reportModal ? 'fixed top-0 left-0 w-full h-full bg-blue-950/50 backdrop-blur-md z-10 flex justify-center items-center' : 'hidden'}`}>
                <section className="w-full md:w-2/5 bg-white rounded-lg p-5">
                    <header className="mb-5 flex justify-between items-center">
                        <h1 className="text-xl font-semibold">CREATE INVENTORY PERSONNEL&apos;S REPORT</h1>
                        <button 
                            onClick={()=>setReportModal(false)} 
                            className="p-2 rounded border border-white hover:border-rose-400 hover:text-rose-400 active:ring-2 ring-rose-400"
                        >
                            <IoMdClose />
                        </button>
                    </header>
                    <form onSubmit={handleSubmit}>
                        <div className="w-full space-y-2">
                            {
                                selectedReport.report?.map((item,index) => {
                                    return(
                                        <div key={index} className="group w-full">
                                            <label htmlFor={item?.inventory?.item_name} className="text-xs font-bold">{item?.inventory?.item_name}:</label>
                                            <input 
                                                type="number" 
                                                className="w-full p-2 rounded text-sm border border-black rounded" 
                                                value={quantity[index] ?? 0}
                                                onChange={e=>{
                                                    const temp = [...quantity]
                                                    temp[index] = Number(e.target.value)
                                                    setQuentity(temp)
                                                }}
                                                required
                                            />
                                        </div>
                                    )
                                })
                            }
                            <button className="p-2 rounded text-sm text-white font-bold bg-indigo-400 hover:bg-indigo-600">submit</button>
                        </div>
                    </form>
                </section>
            </div>
            <section className="w-full">
                <header className="w-full flex justify-start items-center text-white text-sm font-semibold">
                    <button 
                        onClick={()=>setPanel('mechanic')}
                        className={`p-2 hover:bg-blue-600 border-r-2 border-black ${panel=='mechanic'&& 'bg-blue-400'}`}
                    >
                        MECHANIC REPORTS
                    </button>
                    <button 
                        onClick={()=>setPanel('inventory')}
                        className={`p-2 hover:bg-blue-600 ${panel=='inventory'&& 'bg-blue-400'}`}
                    >
                        INVENTORY PERSONNEL&apos;S REPORTS
                    </button>
                </header>
            </section>
            <section className={`${panel=='mechanic' ? 'w-full min-h-80 2xl:min-h-96 bg-white overflow-auto' : 'hidden'}`}>
                <table className="table-auto md:table-fixed w-full text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-b border-black p-2">Date</th>
                            <th className="border-x-2 border-b border-black p-2">Bus Number</th>
                            <th className="border-x-2 border-b border-black p-2">Driver</th>
                            <th className="border-x-2 border-b border-black p-2">Conductor</th>
                            <th className="w-1/3 border-x-2 border-b border-black p-2">Report</th>
                            <th className="w-1/5 border-x-2 border-b border-black p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            mechReports.map((rep,index) => {
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-b border-black">{new Date(rep.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{rep.bus_number}</td>
                                        <td className="p-2 border-x-2 border-b border-black">
                                            <span>{rep?.driver?.first_name} </span>
                                            <span>{rep?.driver?.middle_name} </span>
                                            <span>{rep?.driver?.last_name} </span>
                                            <span>{rep?.driver?.extension}</span>
                                        </td>
                                        <td className="p-2 border-x-2 border-b border-black">{rep?.conductor?.full_name}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{rep?.report?.map((prod,idx) => {
                                            return(
                                                <p key={idx}>{prod?.inventory?.item_name}</p>
                                            )
                                        })}</td>
                                        <td className="p-2 border-x-2 border-b border-black">
                                            {
                                                rep?.status === 'pending' ? (
                                                    <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                        <button onClick={()=>toggleModal(rep)} className="p-2 text-sm text-white font-bold bg-indigo-400 hover:bg-indigo-600 rounded">report</button>
                                                    </div>
                                                ) : (
                                                    <span className="text-green-400">{ rep?.status }</span>
                                                )
                                            }
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </section>
            <section className={`${panel=='inventory' ? 'w-full min-h-80 2xl:min-h-96 bg-white overflow-auto' : 'hidden'}`}>
                <table className="table-auto md:table-fixed w-full text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border-x-2 border-b border-black">Date</th>
                            <th className="p-2 border-x-2 border-b border-black">Type</th>
                            <th className="p-2 border-x-2 border-b border-black">Quantity</th>
                            <th className="p-2 border-x-2 border-b border-black">Unit</th>
                            <th className="p-2 border-x-2 border-b border-black">Bus Number</th>
                            <th className="p-2 border-x-2 border-b border-black">Driver</th>
                            <th className="p-2 border-x-2 border-b border-black">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.map((item,index) => {
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-b border-black">{new Date(item.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{item?.item_type?.item_name}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{item.quantity}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{item.item_type?.unit}</td>
                                        <td className="p-2 border-x-2 border-b border-black">{item.bus_number}</td>
                                        <td className="p-2 border-x-2 border-b border-black">
                                            <span>{item.driver.first_name} </span>
                                            <span>{item.driver.middle_name} </span>
                                            <span>{item.driver.last_name} </span>
                                            <span>{item.driver.extension} </span>
                                        </td>
                                        <td className="p-2 border-x-2 border-b border-black">
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button onClick={()=>confirmArchive(item._id)} className="p-2 rounded text-white text-sm font-bold bg-rose-400 hover:bg-rose-600">
                                                    Archive
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