'use client'

import DashboardButton from "@/app/components/DashboardButton";
// import DashboardPanel from "@/app/components/DashboardPanel"
import Header from "@/app/components/Header"
import vehicleImg from "@/assets/images/maintenance-icon.jpg";
import inventoryImg from "@/assets/images/inventory-icon.jpg";
import purchaseImg from "@/assets/images/purchase-icon.jpg";
import Image from "next/image";
// import { useState } from "react";

export default function Inventory() {
    // const [hidePanel, setHidePanel] = useState<boolean>(false)

    // const pathArray = [
    //     { path: '/inventory/maintenance/driver', name: 'Drivers Report' },
    //     { path: '/inventory/maintenance/mechanic', name: 'Mechanic Report' },
    // ]

    return(
        <div className="w-full">
            <Header title="INVENTORY DASHBOARD" />
            {/* <DashboardPanel isHidden={hidePanel} navs={pathArray} /> */}
            <div className="w-full flex flex-col justify-center items-center relative">
                <section className="w-full md:w-[400px] flex flex-wrap justify-center items-start gap-10 px-5">
                    {/* <button onClick={()=>setHidePanel(!hidePanel)} className="flex flex-col justify-center items-center">
                        <div className="max-w-32">
                            <div className="w-20 h-20 md:w-32 md:h-32 p-2 mb-1 rounded-lg relative overflow-hidden bg-white hover:ring ring-cyan-400 flex justify-center items-center">
                                <Image src={vehicleImg} alt="bus" width={100} height={100} className="scale-100 absolute" />
                            </div>
                            <p className="text-white text-center text-[8px] md:text-xs font-bold">Vehicle Maintenance</p>
                        </div>
                    </button> */}
                    <DashboardButton path="/inventory/report" title="Mechanic & Inventory Personnel Reports">
                        <Image src={vehicleImg} alt="inventory" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton>
                    <DashboardButton path="/inventory/purchase-order" title="Purchase Orders">
                        <Image src={purchaseImg} alt="inventory" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton>
                    <DashboardButton path="/inventory/inventory" title="Inventory">
                        <Image src={inventoryImg} alt="order" width={100} height={100} className="scale-100 absolute" />
                    </DashboardButton>
                </section>
            </div>
        </div>
    )
}