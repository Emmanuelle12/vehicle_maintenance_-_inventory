import connect from "@/lib/db";
import { NextResponse } from "next/server";
import PurchaseOrder from "@/lib/modals/purchase_orders";
import { Types } from "mongoose";
import Notification from "@/lib/modals/notifications";

export const PUT = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const { user_id } = await request.json();
        const orderId = searchParams.get('order_id');

        if (!orderId) {
            return new NextResponse(JSON.stringify({message: 'Missing purchase order id'}), {status: 400});
        }
        
        if (!Types.ObjectId.isValid(orderId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid purchase order id'}), {status: 400});
        }

        await connect();
        const order = await PurchaseOrder.findOne({ _id: orderId });
        const newOrder = await PurchaseOrder.create({
            inventory: order?.inventory,
            supplier: order?.supplier,
            brand: order?.brand,
            description: order?.description,
            date_ordered: new Date(),
            unit_cost: order?.unit_cost,
            quantity: order?.quantity,
            total_price: order?.total_price,
        });
        if (!newOrder) {
            return new NextResponse(JSON.stringify({message: 'Failed to reorder'}), {status: 400});
        }
        const notification = {
            user: user_id,
            message: 'You have reordered a purchase order',
        }
        await Notification.create(notification);
        // const orders = await PurchaseOrder.find({ deletedAt: null }).populate('inventory').populate('supplier');
        const orders = await PurchaseOrder.aggregate([
            {
                $match: { deletedAt: null },
            },
            {
                $lookup: {
                    from: 'inventories',
                    localField: 'inventory',
                    foreignField: '_id',
                    as: 'inventory',
                },
            },
            {
                $unwind: {
                    path: '$inventory',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: 'suppliers',
                    localField: 'supplier',
                    foreignField: '_id',
                    as: 'supplier',
                },
            },
            {
                $unwind: {
                    path: '$supplier',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    brand: 1,
                    description: 1,
                    date_ordered: 1,
                    date_received: 1,
                    unit_cost: 1,
                    quantity: 1,
                    total_price: 1,
                    status: 1,
                    createdAt: 1,
                    inventory: {
                        _id: '$inventory._id',
                        item_name: '$inventory.item_name',
                        unit: '$inventory.unit'
                    },
                    supplier: {
                        _id: '$supplier._id',
                        supplier_company: '$supplier.supplier_company',
                        supplier_address: '$supplier.supplier_address',
                        contact: '$supplier.contact'
                    },
                },
            }
        ]);
        return new NextResponse(JSON.stringify({message: 'OK', orders: orders}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}