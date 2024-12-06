'use client'

import DashboardPanelAlt from "@/app/components/DashboardPanelAlt";
import Header from "@/app/components/Header"
import axios, { AxiosResponse } from "axios";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Swal from "sweetalert2";

interface ProductOptions {
    _id: string;
    item_name: string;
}

interface SupplierOptions {
    _id: string;
    supplier_company: string;
    contact: string;
}

interface PurchaseOrder {
    inventory: string;
    supplier: string;
    brand: string;
    description: string;
    date_ordered: Date | null;
    date_received: Date | null;
    unit_cost: number;
    quantity: number;
    total_price: number;
}

export default function Create() {
    const [itemOptions, setItemOptions] = useState<ProductOptions[]>([])
    const [supplierOptions, setSupplierOptions] = useState<SupplierOptions[]>([])
    const [totalPrice, setTotalPrice] = useState<number>(0)
    const [order, setOrder] = useState<PurchaseOrder>({
        inventory: '',
        supplier: '',
        brand: '',
        description: '',
        date_ordered: null,
        date_received: null,
        unit_cost: 0,
        quantity: 0,
        total_price: 0,
    })
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

    const getOptions = useCallback(async () => {
        await axios.get('/api/product')
        .then(response => {
            const inventory = response.data?.inventory
            const suppliers = response.data?.suppliers
            setItemOptions(inventory ?? [])
            setSupplierOptions(suppliers ?? [])
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getOptions()
    }, [getOptions])

    const handleOnChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setOrder({
            ...order,
            [name]: value
        })
    }

    const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        const result = isNaN(Number(value)) ? 0 : Number(value)
        setOrder({
            ...order,
            [name]: result
        })
        handleTotalPrice(Number(value), name)
    }

    const handleTotalPrice = (value: number, name: string) => {
        if (name === 'unit_cost') {
            const total = Number(order.quantity) * Number(value)
            const result = isNaN(total) ? 0 : total
            setTotalPrice(result)
        } else if (name === 'quantity') {
            const total = Number(order.unit_cost) * Number(value)
            const result = isNaN(total) ? 0 : total
            setTotalPrice(result)
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const updatedOrder: PurchaseOrder = {
            ...order,
            total_price: totalPrice
        }
        toast.promise(
            axios.post('/api/purchase-order', updatedOrder),
            {
                pending: 'Creating purchase order...',
                success: {
                    render() {
                        setOrder({
                            inventory: '',
                            supplier: '',
                            brand: '',
                            description: '',
                            date_ordered: null,
                            date_received: null,
                            unit_cost: 0,
                            quantity: 0,
                            total_price: 0,
                        })
                        setTotalPrice(0)
                        return 'Purchase Order created'
                    }
                },
                error: {
                    render({ data }: { data: AxiosResponse }) {
                        console.log(data)
                        Swal.fire({
                            title: 'Purchase Order Error',
                            text: data.data?.message,
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
            <Header title="PURCHASE ORDER" backTo={'/admin/purchase-order'} />
            <section className="w-full flex justify-center items-center h-96 overflow-y-auto pt-80">
                <form onSubmit={handleSubmit}>
                    <div className="w-full md:w-96 space-y-2 pb-10">
                        <div className="w-full">
                            <label htmlFor="inventory" className="text-xs text-amber-400 font-bold">Item:</label>
                            <select 
                                name="inventory" 
                                id="inventory"
                                className="p-3 w-full rounded text-xs"
                                value={order.inventory}
                                onChange={handleOnChange}
                                required
                            >
                                <option value=""></option>
                                {
                                    itemOptions.map((item, index) => {
                                        return (
                                            <option value={item._id} key={index}>{item.item_name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div className="w-full">
                            <label htmlFor="supplier" className="text-xs text-amber-400 font-bold">Supplier:</label>
                            <select 
                                name="supplier" 
                                id="supplier"
                                className="p-3 w-full rounded text-xs"
                                value={order.supplier}
                                onChange={handleOnChange}
                                required
                            >
                                <option value=""></option>
                                {
                                    supplierOptions.map((item, index) => {
                                        return (
                                            <option value={item._id} key={index}>{item.supplier_company}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div className="w-full">
                            <label htmlFor="brand" className="text-xs text-amber-400 font-bold">Brand:</label>
                            <input 
                                type="text" 
                                name="brand" 
                                id="brand" 
                                className="w-full p-2 rounded text-sm" 
                                value={ order.brand }
                                onChange={handleOnChange}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="description" className="text-xs text-amber-400 font-bold">Description:</label>
                            <input 
                                type="text" 
                                name="description" 
                                id="description" 
                                className="w-full p-2 rounded text-sm" 
                                value={ order.description }
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="date_ordered" className="text-xs text-amber-400 font-bold">Date of Purchase:</label>
                            <input 
                                type="date" 
                                name="date_ordered" 
                                id="date_ordered" 
                                className="w-full p-2 rounded text-sm" 
                                value={ order.date_ordered ? new Date(order.date_ordered).toISOString().split('T')[0] : '' }
                                onChange={handleOnChange}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="date_received" className="text-xs text-amber-400 font-bold">Date Received:</label>
                            <input 
                                type="date" 
                                name="date_received" 
                                id="date_received" 
                                className="w-full p-2 rounded text-sm" 
                                value={order.date_received ? new Date(order.date_received).toISOString().split('T')[0] : ''}
                                onChange={handleOnChange}
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="unit_cost" className="text-xs text-amber-400 font-bold">Unit Cost:</label>
                            <input 
                                type="number" 
                                name="unit_cost" 
                                id="unit_cost" 
                                className="w-full p-2 rounded text-sm" 
                                value={order.unit_cost.toFixed(2)}
                                onChange={handleNumberChange}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="quantity" className="text-xs text-amber-400 font-bold">Quantity:</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                id="quantity" 
                                className="w-full p-2 rounded text-sm" 
                                value={order.quantity}
                                onChange={handleNumberChange}
                                required
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="total_price" className="text-xs text-amber-400 font-bold">Total Price:</label>
                            <input 
                                type="number" 
                                name="total_price" 
                                id="total_price" 
                                className="w-full p-2 rounded text-sm" 
                                value={totalPrice.toFixed(2)}
                                readOnly
                            />
                        </div>
                        <button type="submit" className="w-full p-2 text-sm text-white font-bold bg-amber-400 hover:bg-amber-600">SUBMIT</button>
                    </div>
                </form>
            </section>
        </div>
    )
}