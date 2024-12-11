import connect from "@/lib/db";
import Notification from "@/lib/modals/notifications";
import PurchaseOrder from "@/lib/modals/purchase_orders";
import User from "@/lib/modals/users";
import InventoryStock from "@/lib/modals/inventory_stocks";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connect();
        // const orders = await PurchaseOrder.find({ deletedAt: null }).populate('inventory').populate('supplier');
        const orders = await PurchaseOrder.aggregate([
            // Match documents where "deletedAt" is null
            { $match: { deletedAt: null } },
            
            // Populate the "inventory" field
            {
              $lookup: {
                from: 'inventories', // Collection to join (ensure the name is correct)
                localField: 'inventory', // Field in PurchaseOrder referencing Inventory
                foreignField: '_id', // Field in Inventory to match
                as: 'inventory' // Output array field
              }
            },
            
            // Populate the "supplier" field
            {
              $lookup: {
                from: 'suppliers', // Collection to join (ensure the name is correct)
                localField: 'supplier', // Field in PurchaseOrder referencing Supplier
                foreignField: '_id', // Field in Supplier to match
                as: 'supplier' // Output array field
              }
            },
          
            // Unwind the "inventory" field (optional if you expect a single object)
            { $unwind: { path: '$inventory', preserveNullAndEmptyArrays: true } },
          
            // Unwind the "supplier" field (optional if you expect a single object)
            { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } }
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

export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        await connect();

        const result = await PurchaseOrder.create(body);
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to create purchase order'}), {status: 400});
        }

        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'You have created new purchase order',
        });
        return new NextResponse(JSON.stringify({message: 'OK'}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}

export const PATCH = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('order_id');
        const { user_id } = await request.json();

        if (!orderId) {
            return new NextResponse(JSON.stringify({message: 'Missing purchase order id'}), {status: 400});
        }

        if (!Types.ObjectId.isValid(orderId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid purchase order id'}), {status: 400});
        }
        await connect();
        const result = await PurchaseOrder.findOneAndUpdate(
            { _id: orderId },
            { deletedAt: new Date() },
            { new: true }
        );
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to archive purchase order'}), {status: 400});
        }
        const notification = {
            user: user_id,
            message: 'You have archived a purchase order'
        }
        await Notification.create(notification);
        const orders = await PurchaseOrder.find({ deletedAt: null }).populate('inventory').populate('supplier');
        return new NextResponse(JSON.stringify({message: 'OK', orders: orders}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}

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
        const result = await PurchaseOrder.findOneAndUpdate(
            { _id: new Types.ObjectId(orderId) },
            { status: 'received', date_received: new Date() },
            { new: true },
        );
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to update purchase order'}), {status: 400});
        }
        const order = await PurchaseOrder.findOne({ _id: orderId });
        const notification = {
            user: user_id,
            message: 'You have received a purchase order total cost: '+order?.total_price
        }
        await Notification.create(notification);
        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'Purchase order has been received with a total cost: '+order?.total_price,
        });
        const stock = await InventoryStock.findOneAndUpdate(
            { item_type: order.inventory },
            { $inc: { stocks: order.quantity } },
            { new: true }
        ).populate('item_type');
        if (stock.stocks >= stock.maximum_quantity) {
            await Notification.create({
                user: admin?._id,
                message: 'The quantity of ' + stock.item_type.item_name + ' has reached the maximum level. Current quantity: ' + stock.stocks + ' ' + stock.item_type.unit
            });
        }
        const orders = await PurchaseOrder.find({ deletedAt: null }).populate('inventory').populate('supplier');
        return new NextResponse(JSON.stringify({message: 'OK', orders: orders}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}