import connect from "@/lib/db";
import Notification from "@/lib/modals/notifications";
import PurchaseOrder from "@/lib/modals/purchase_orders";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connect();
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

export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        await connect();

        const result = await PurchaseOrder.create(body);
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to create purchase order'}), {status: 400});
        }

        return new NextResponse(JSON.stringify({message: 'OK'}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}

export const PATCH = async (request: Request) => {}

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
            { status: 'received' },
            { new: true },
        );
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to update purchase order'}), {status: 400});
        }
        const notification = {
            user: user_id,
            message: 'You have received a purchase order'
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