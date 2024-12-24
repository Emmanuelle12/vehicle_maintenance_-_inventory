import connect from "@/lib/db";
import OrdersReceivedReports from "@/lib/modals/orders_received_report";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connect();
        const reports = await OrdersReceivedReports.aggregate([
            {
                $lookup: {
                    from: "purchaseorders",
                    localField: "order",
                    foreignField: "_id",
                    as: "order"
                },
            },
            {
                $unwind: {
                    path: "$order",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "order.inventory",
                    foreignField: "_id",
                    as: "inventory",
                },
            },
            {
                $unwind: {
                    path: "$inventory",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "suppliers",
                    localField: "order.supplier",
                    foreignField: "_id",
                    as: "supplier",
                },
            },
            {
                $unwind: {
                    path: "$supplier",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    order: {
                        _id: 1,
                        inventory: {
                            _id: '$inventory._id',
                            item_name: '$inventory.item_name',
                            unit: '$inventory.unit',
                        },
                        supplier: {
                            _id: '$supplier._id',
                            supplier_company: '$supplier.supplier_company',
                            supplier_address: '$supplier.supplier_address',
                            contact: '$supplier.contact',
                        },
                        brand: '$order.brand',
                        description: '$order.description',
                        date_ordered: '$order.date_ordered',
                        unit_cost: '$order.unit_cost',
                        quantity: '$order.quantity',
                        total_price: '$order.total_price',
                    },
                    narrative_report: 1,
                    createdAt: 1,
                },
            },
        ]).sort({ createdAt: -1 });
        return new NextResponse(JSON.stringify({message: 'OK', reports: reports}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}