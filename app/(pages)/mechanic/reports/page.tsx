'use client'

import Header from "@/app/components/Header"
import { useAuthStore } from "@/app/stores/auth";
import axios, { AxiosResponse } from "axios";
import { FormEvent, useCallback, useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css';
import Swal from "sweetalert2";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { FaTrash } from "react-icons/fa";
import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";

interface User {
    _id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    extension: string;
    email: string;
}

interface Conductor {
    full_name: string;
}

interface ReportItem {
    _id: string;
    inventory: Inventory;
    quantity: number;
}

interface DriverReport {
    _id: string;
    bus_number: string;
    driver: User;
    conductor: Conductor;
    report: Inventory[];
    others: string;
    createdAt: Date;
    status: string;
}

interface Report {
    _id: string;
    bus_number: string;
    driver: User;
    conductor: Conductor;
    report: ReportItem[];
    createdAt: Date;
    status: string;
}

interface Inventory {
    _id: string;
    item_name: string;
    unit: string;
}

interface SubmittedReport {
    _id: string;
    bus_number: string;
    driver: User;
    conductor: Conductor;
    report: ReportItem[];
    repair_status: string;
    narrative_report: string;
    createdAt: Date;
    date_report: Date;
}

export default function Report() {
    const [reports, setReports] = useState<DriverReport[]>([])
    const [reportsArr, setReportsArr] = useState<DriverReport[]>([])
    const [inventory, setInventory] = useState<Inventory[]>([])
    const [selectedReport, setSelectedReport] = useState<{
        _id: string;
        bus_number: string;
        driver: User | null;
        conductor: Conductor | null;
        report: string[];
        quantities: number[];
        repair_status: string;
        narrative_report: string;
        createdAt: Date;
    }>({
        _id: '',
        bus_number: '',
        driver: null,
        conductor: null,
        report: [''],
        quantities: [0],
        repair_status: '',
        narrative_report: '',
        createdAt: new Date(),
    })
    const [submittedReports, setSubmittedReports] = useState<SubmittedReport[]>([])
    const [subRepArr, setSubRepArr] = useState<SubmittedReport[]>([])
    const [openReport, setOpenReport] = useState<boolean>(false)
    // const [itemOptions, setItemOptions] = useState<Option[]>([])
    // const [selectedItem, setSelectedItem] = useState<string[]>([])
    const [panel, setPanel] = useState<string>('driver')
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const store = useAuthStore()
    const [hidePanel, setHidePanel] = useState<boolean>(true)

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/mechanic/reports', name: 'Reports'},
        {path: '/mechanic/inventory', name: 'Inventory'},
    ]

    // const setOptions = (items: Item[]) => {
    //     const newArr = items.map((inv)=>{
    //         return {
    //             value: inv._id,
    //             label: inv.item_name,
    //         }
    //     })
    //     setItemOptions(newArr)
    // }

    const getReports = useCallback(async () => {
        const id = store.user.id
        await axios.get(`/api/mechanic?mechanic_id=${id}`)
        .then(response => {
            console.log(response)
            const rep = response.data?.reports
            const inv = response.data?.inventory
            const drv = response.data?.driver
            setReports(drv)
            setReportsArr(drv)
            // setOptions(inv)
            setInventory(inv)
            setSubmittedReports(rep)
            setSubRepArr(rep)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        setIsMounted(true)
        getReports()
    }, [getReports])

    const toggleReport = (report: DriverReport) => {
        setOpenReport(!openReport)
        setSelectedReport({
            ...selectedReport,
            _id: report._id,
            bus_number: report.bus_number,
            driver: report.driver,
            conductor: report.conductor,
            createdAt: report.createdAt,
        })
    }
    
    // const handleSelectChange = (selectedOption: MultiValue<Option>) => {
    //     const temp = selectedOption.map(item=>item.value)
    //     setSelectedItem(temp)
    // }

    const submitReport = async (e: FormEvent) => {
        e.preventDefault()
        const id = store.user.id
        toast.promise(
            axios.post(`/api/mechanic`, {
                report_id: selectedReport._id,
                mechanic: id,
                bus_number: selectedReport.bus_number,
                driver: selectedReport.driver,
                conductor: selectedReport.conductor,
                report: selectedReport.report,
                quantities: selectedReport.quantities,
                repair_status: selectedReport.repair_status,
                narrative_report: selectedReport.narrative_report,
                report_date: selectedReport.createdAt,
            }),
            {
                pending: 'Submitting report...',
                success: {
                    render() {
                        // setSelectedItem([])
                        return 'Report submitted'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Submission Error',
                            text: data.data?.message,
                            icon: 'error'
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    const handleSearch = (key: string) => {
        if (panel == 'driver') {
            const temp = reportsArr.filter(item => 
                item.bus_number.toLowerCase().includes(key.toLowerCase()) ||
                item.driver.first_name.toLowerCase().includes(key.toLowerCase()) ||
                item.driver.middle_name.toLowerCase().includes(key.toLowerCase()) ||
                item.driver.last_name.toLowerCase().includes(key.toLowerCase()) || 
                item.driver.extension.toLowerCase().includes(key.toLowerCase()) ||
                item.conductor?.full_name?.toLowerCase().includes(key.toLowerCase()) 
            )
            setReports(temp)
        }
        else if (panel == 'submitted') {
            const temp = subRepArr.filter(item => 
                item.bus_number.toLowerCase().includes(key.toLowerCase()) ||
                item.driver.first_name.toLowerCase().includes(key.toLowerCase()) ||
                item.driver.middle_name.toLowerCase().includes(key.toLowerCase()) ||
                item.driver.last_name.toLowerCase().includes(key.toLowerCase()) || 
                item.driver.extension.toLowerCase().includes(key.toLowerCase()) ||
                item.conductor?.full_name?.toLowerCase().includes(key.toLowerCase()) 
            )
            setSubmittedReports(temp)
        }
    }

    const confirmDelete = (id: string) => {
        Swal.fire({
            title: 'Archive Report',
            text: 'Are you sure you want to move report to archive',
            icon: 'question',
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonColor: 'red',
            confirmButtonColor: 'indigo',
        })
        .then(response => {
            if (response.isConfirmed) {
                archiveReport(id)
            }
        })
    }

    const archiveReport = (id: string) => {
        toast.promise(
            axios.patch(`/api/mechanic?report_id=${id}`),
            {
                pending: 'Archiving report...',
                success: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        const rep = data.data?.reports
                        setSubmittedReports(rep)
                        setSubRepArr(rep)
                        return 'Report archived'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Archive Error',
                            text: data?.data?.message,
                            icon: 'error',
                        })
                        return 'ERROR'
                    }
                }
            }
        )
    }

    if (!isMounted) {
        return null
    }

    const addReportItem = () => {
        const reportTemp = [...selectedReport.report]
        const quantityTemp = [...selectedReport.quantities]
        reportTemp.push('')
        quantityTemp.push(0)
        setSelectedReport({
            ...selectedReport,
            report: reportTemp,
            quantities: quantityTemp
        })
    }

    const decReportItem = (index: number) => {
        const reportTemp = [...selectedReport.report]
        const quantityTemp = [...selectedReport.quantities]
        reportTemp.splice(index, 1)
        quantityTemp.splice(index, 1)
        setSelectedReport({
            ...selectedReport,
            report: reportTemp,
            quantities: quantityTemp
        })
    }

    return(
        <div className="w-full">
            <ToastContainer position="bottom-right" />
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="MECHANIC REPORTS" goTo2={{path: '/mechanic/reports/archive', title: 'Archive'}} searchFunction={handleSearch} />
            <div 
                className={`${openReport ? 
                    'fixed top-0 left-0 flex justify-center items-center bg-blue-950/50 backdrop-blur-md z-10 flex justify-center items-center w-full min-h-screen' 
                    : 'hidden'}`}
            >
                <section className="w-full md:w-1/3 rounded-lg bg-white p-5 space-y-2">
                    <header className="mb-5 flex justify-between items-center">
                        <h1 className="text-xl font-semibold">Create Report</h1>
                        <button onClick={()=>setOpenReport(!openReport)} className="p-2 rounded border border-white hover:border-rose-400 hover:text-rose-400">
                            <IoMdClose />
                        </button>
                    </header>
                    <form onSubmit={submitReport}>
                        <div className="w-full space-y-2">
                            <div className="w-full group">
                                <label htmlFor="repair_status" className="text-xs font-bold">Repair Status:</label>
                                <select 
                                    className="w-full p-2 rounded text-sm border border-black"
                                    name="repair_status" 
                                    id="repair_status"
                                    value={selectedReport.repair_status}
                                    onChange={(e)=>setSelectedReport({...selectedReport, repair_status: e.target.value})}
                                >
                                    <option value="">Select Status</option>
                                    <option value="fixed">Fixed</option>
                                    <option value="not-fixed">Not Fixed</option>
                                </select>
                            </div>
                            <div className="w-full group">
                                <label htmlFor="narrative_report" className="text-xs font-bold">Narrative Report:</label>
                                <textarea
                                    className="p-1 text-sm w-full rounded border border-black resize-none"
                                    name="narrative_report"
                                    id="narrative_report"
                                    value={selectedReport.narrative_report}
                                    onChange={(e)=>setSelectedReport({...selectedReport, narrative_report: e.target.value})}
                                ></textarea>
                            </div>
                            {
                                selectedReport.report.map((rep,idx) => {
                                    return (
                                        <div key={idx} className="flex justify-between items-center space-x-2">
                                            <div className="group w-full">
                                                <label className="text-xs font-bold">Item:</label>
                                                {/* <Select 
                                                    options={itemOptions}
                                                    onChange={handleSelectChange}   
                                                    isMulti
                                                    required
                                                /> */}
                                                <select 
                                                    value={selectedReport.report[idx]}
                                                    onChange={(e)=>{
                                                        const item = e.target.value
                                                        const temp = [...selectedReport.report]
                                                        temp[idx] = item
                                                        setSelectedReport({
                                                            ...selectedReport,
                                                            report: temp
                                                        })
                                                    }} 
                                                    className="w-full p-2 rounded border border-black"
                                                >
                                                    <option value="">Select Item</option>
                                                    {
                                                        inventory.map((inv,ind) => {
                                                            return(
                                                                <option key={ind} value={inv._id}>{inv.item_name} unit: {inv.unit}</option>
                                                            )
                                                        })
                                                    }
                                                </select>
                                            </div>
                                            <div className="group w-1/4">
                                                <label className="text-xs font-bold">Quantity:</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 rounded border border-black" 
                                                    value={selectedReport.quantities[idx]}
                                                    onChange={(e)=>{
                                                        const temp = [...selectedReport.quantities]
                                                        temp[idx] = Number(e.target.value)
                                                        setSelectedReport({...selectedReport,quantities: temp})
                                                    }}
                                                />
                                            </div>
                                            {
                                                idx === 0 ? (
                                                    <div className="group">
                                                        <p className="h-6 block"></p>
                                                        <button type="button" onClick={addReportItem} className="p-2 rounded text-white bg-green-400 hover:bg-green-600">
                                                            <IoMdAdd />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="group">
                                                        <p className="h-6 block"></p>
                                                        <button type="button" onClick={()=>decReportItem(idx)} className="p-2 rounded text-white bg-red-400 hover:bg-red-600">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )
                                })
                            }
                            <button className="p-2 text-white text-sm font-bold bg-blue-400 hover:bg-blue-600 rounded">submit</button>
                        </div>
                    </form>
                </section>
            </div>
            <section className="w-full bg-gray-400 flex justify-start items-center border-x-2 border-b-2 border-black">
                <button onClick={()=>setPanel('driver')} className={`p-2 border-r-2 border-black text-white text-sm font-bold hover:bg-gray-600 ${panel=='driver' && 'bg-gray-500'}`}>DRIVER REPORT</button>
                <button onClick={()=>setPanel('submitted')} className={`p-2 text-white text-sm font-bold hover:bg-gray-600 ${panel=='submitted' && 'bg-gray-500'}`}>SUBMITTED REPORT</button>
            </section>
            <section className={`${panel=='driver' ? 'w-full bg-white min-h-80 overflow-auto' : 'hidden'}`}>
                <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black">Date</th>
                            <th className="border-x-2 border-black">Bus Number</th>
                            <th className="border-x-2 border-black">Driver</th>
                            <th className="border-x-2 border-black">Conductor</th>
                            <th className="w-1/5 border-x-2 border-black">Report</th>
                            <th className="w-1/5 border-x-2 border-black">Others</th>
                            <th className="w-1/5 border-x-2 border-black">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            reports.map((item,index)=>{
                                return(
                                    <tr key={index}>
                                        <td className="p-2 border-x-2 border-black">{new Date(item.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-black">{item.bus_number}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <span>{item.driver.first_name} </span>
                                            <span>{item.driver.middle_name} </span>
                                            <span>{item.driver.last_name} </span>
                                            <span>{item.driver?.extension}</span>
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{item?.conductor?.full_name}</td>
                                        <td className="p-2 border-x-2 border-black">{item.report.map((prod,idx) => {
                                            return(
                                                <p key={idx}>{prod.item_name}</p>
                                            )
                                        })}</td>
                                        <td className="p-2 border-x-2 border-black">{item?.others}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            {
                                                item.status == 'pending' ? (
                                                    
                                            <button onClick={()=>toggleReport(item)} className="p-2 rounded text-xs text-white font-bold bg-indigo-400 hover:bg-indigo-600">report</button>
                                                ) : (
                                                    <p className="text-sm text-green-400">submitted</p>
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
            
            <section className={`${panel=='submitted' ? 'w-full bg-white min-h-80 overflow-auto' : 'hidden'}`}>
                <table className="w-full table-auto md:table-fixed text-center">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border-x-2 border-black">Date</th>
                            <th className="border-x-2 border-black">Bus Number</th>
                            <th className="border-x-2 border-black">Driver</th>
                            <th className="border-x-2 border-black">Conductor</th>
                            <th className="border-x-2 border-black">Repair Status</th>
                            <th className="w-1/4 border-x-2 border-black">Report</th>
                            <th className="w-1/4 border-x-2 border-black">Narrative Report</th>
                            <th className="border-x-2 border-black">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            submittedReports.map((rep,inx)=>{
                                return(
                                    <tr key={inx}>
                                        <td className="p-2 border-x-2 border-black">{new Date(rep.createdAt).toLocaleDateString('en-PH')}</td>
                                        <td className="p-2 border-x-2 border-black">{rep.bus_number}</td>
                                        <td className="p-2 border-x-2 border-black">
                                            <span>{rep.driver.first_name} </span>
                                            <span>{rep.driver.middle_name} </span>
                                            <span>{rep.driver.last_name} </span>
                                            <span>{rep.driver?.extension}</span>
                                        </td>
                                        <td className="p-2 border-x-2 border-black">{rep?.conductor?.full_name}</td>
                                        <td className="p-2 border-x-2 border-black">{rep?.repair_status}</td>
                                        <td className="p-2 border-x-2 border-black">{rep.report.map((prod,idx) => {
                                            return(
                                                <p key={idx}>{prod?.inventory.item_name}</p>
                                            )
                                        })}</td>
                                        <td className="p-2 border-x-2 border-black">{rep?.narrative_report}</td>
                                        <td>
                                            <div className="w-full flex flex-wrap justify-center items-center gap-2">
                                                <button onClick={()=>confirmDelete(rep._id)} className="p-2 rounded text-white text-xs font-bold bg-rose-400 hover:bg-rose-600">archive</button>
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