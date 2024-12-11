'use client'

import Header from "@/app/components/Header"
import ItemCard from "@/app/components/ItemCard"
import { useCallback, useEffect, useState } from "react"
import axios from "axios"
import DashboardPanelAlt from "@/app/components/DashboardPanelAlt"

interface Inventory {
    _id: string;
    item_name: string;
}

export default function Inventory() {
    const [inventory, setInventory] = useState<Inventory[]>([])
    const [hidePanel, setHidePanel] = useState<boolean>(true)

    const togglePanel = () => {
        setHidePanel(!hidePanel)
    }

    const navigationArray = [
        {path: '/mechanic/reports', name: 'Reports'},
        {path: '/mechanic/inventory', name: 'Inventory'},
    ]

    const getInventory = useCallback(async () => {
        await axios.get('/api/inventory')
        .then(response => {
            const inv = response.data?.inventory
            setInventory(inv)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        getInventory()
    }, [getInventory])
    return (
        <div className="w-full">
            <DashboardPanelAlt isHidden={hidePanel} toggle={togglePanel} navs={navigationArray} />
            <Header title="INVENTORY" />
            <section className="w-full md:px-10">
                <div className="w-full flex flex-wrap justify-center gap-2 md:gap-4">
                    {
                        inventory.map((invntry, index) => {
                            return(
                                <ItemCard title={invntry.item_name} path={`/inventory/inventory/${invntry._id}`} key={index} />
                            )
                        })
                    }
                </div>
            </section>
        </div>
    )
}