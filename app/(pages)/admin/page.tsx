'use client'

import DashboardButton from "@/app/components/DashboardButton"
import Image from "next/image"
import vehicleImg from "@/assets/images/maintenance-icon.jpg";
import inventoryImg from "@/assets/images/inventory-icon.jpg";
import purchaseImg from "@/assets/images/purchase-icon.jpg";
import supplierImg from "@/assets/images/supplier-icon.jpg";
import staffImg from "@/assets/images/staff-image.jpg";
import Header from "@/app/components/Header";
import DashboardPanel from "@/app/components/DashboardPanel";
import { useState } from "react";

export default function Home() {
    const [hidePanel, setHidePanel] = useState<boolean>(false)

    const pathArray = [
        { path: '/admin/maintenance/driver', name: 'Drivers Report' },
        { path: '/admin/maintenance/mechanic', name: 'Mechanic Report' },
    ]

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    return (
        <div className="w-full">
            <div className="absolute top-28 left-0">
                <Header title="DASHBOARD" />
            </div>
            <DashboardPanel isHidden={hidePanel} navs={pathArray} toggle={togglePanel} />
            <div className="w-full flex flex-col justify-center items-center relative pb-10">
                <section className="w-full md:w-[500px] flex flex-wrap justify-center items-center gap-10 mt-12">
                    <button onClick={()=>setHidePanel(!hidePanel)} className="flex flex-col justify-center items-center">
                        <div className="max-w-32">
                            <div className="w-20 h-20 md:w-32 md:h-32 p-2 mb-1 rounded-lg relative overflow-hidden bg-white hover:ring ring-cyan-400 flex justify-center items-center">
                                <Image src={vehicleImg} alt="bus" width={100} height={100} className="scale-100 absolute" />
                            </div>
                            <p className="text-white text-center text-[8px] md:text-xs font-bold">Vehicle Maintenance</p>
                        </div>
                    </button>
                    {/* <DashboardButton path="/admin/maintenance" title="Vehicle Maintenance">
                        <Image src={vehicleImg} alt="bus" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton> */}
                    <DashboardButton path="/admin/purchase-order" title="Purchase Orders">
                        <Image src={inventoryImg} alt="order" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton>
                    <DashboardButton path="/admin/inventory" title="Inventory">
                        <Image src={purchaseImg} alt="inventory" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton>
                    <DashboardButton path="/admin/suppliers" title="Suppliers">
                        <Image src={supplierImg} alt="supplier" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton>
                    <DashboardButton path="/admin/staff" title="Staffs">
                        <Image src={staffImg} alt="staffs" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton>
                </section>
            </div>
        </div>
    )
}