import connect from "@/lib/db";
import InventoryReport from "@/lib/modals/inventory_reports";
import InventoryStock from "@/lib/modals/inventory_stocks";
import Notification from "@/lib/modals/notifications";
import MechanicReport from "@/lib/modals/mechanic_reports";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import User from "@/lib/modals/users";

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('user_id');
        await connect();

        if (!uid) {
            // const mechReps = await MechanicReport.find({ deletedAt: null }).populate('driver').populate('report');
            const reports = await InventoryReport.find({ deletedAt: null }).populate('item_type').populate('driver');
            return new NextResponse(JSON.stringify({message: 'OK', reports: reports}), {status: 200});
        }
        // const mechReps = await MechanicReport.find({ deletedAt: null }).populate('driver').populate('report');
        const reports = await InventoryReport.find({ inventory: new Types.ObjectId(uid), deletedAt: null }).populate('item_type').populate('driver');
        return new NextResponse(JSON.stringify({message: 'OK', reports: reports}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}

export const POST = async (request: Request) => {
    try {
        const { user_id, types, quantities, driver, bus_number } = await request.json();
        await connect();
        const admin = await User.findOne({ role: 'admin' });
        for (let x = 0; x < types.length; x++) {
            const stock = await InventoryStock.findOne({ item_type: types[x] }).populate('item_type');
            if ((stock.stocks - quantities[x]) < 0) {
                const errorMessage = 'Quantity of ' + stock.item_type.item_name + ' has exceeded the available stock';
                return new NextResponse(JSON.stringify({message: errorMessage}), {status: 400});
            }
        }
        for (let x = 0; x < types.length; x++) {
            const stock = await InventoryStock.findOne({ item_type: types[x] }).populate('item_type');
            await InventoryReport.create(
                {
                    inventory: user_id,
                    item_type: types[x],
                    quantity: quantities[x],
                    driver: driver,
                    bus_number: bus_number,
                }
            );
            stock.stocks -= quantities[x];
            await stock.save();
            if (stock.stocks <= stock.minimum_quantity) {
                const content = 'The quantity of ' + stock.item_type.item_name + ' has reached the minimum level. Current quantity: ' + stock.stocks + ' ' + stock.itemt_type.unit;
                await Notification.create({
                    user: admin._id,
                    message: content
                });
            }
        }
        // if (!result) {
        //     return new NextResponse(JSON.stringify({message: 'Failed to create report'}), {status: 400});
        // }
        const notification = {
            user: user_id,
            message: 'You have created an inventory personnel report'
        };
        await Notification.create(notification);
        await Notification.create({
            user: admin?._id,
            message: 'Inventory personnel has submitted new report',
        });
        const mechReps = await MechanicReport.find({ deletedAt: null }).populate('mechanic').populate('driver').populate('report');
        const reports = await InventoryReport.find({ inventory: user_id, deletedAt: null }).populate('item_type').populate('driver');
        return new NextResponse(JSON.stringify({message: 'OK', reports: reports, mechanic_reports: mechReps}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}

export const PATCH = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const { user_id } = await request.json();
        const reportId = searchParams.get('report_id');
        if (!reportId) {
            return new NextResponse(JSON.stringify({message: 'Missing report id'}), {status: 400});
        }

        if (!Types.ObjectId.isValid(reportId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid report id'}), {status: 400});
        }

        await connect();
        const result = await InventoryReport.findOneAndUpdate(
            { _id: reportId },
            { deletedAt: new Date() },
            { new: true },
        );

        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to archive report'}), {status: 400});
        }
        const notification = {
            user: user_id,
            message: 'You have archived a report'
        };
        await Notification.create(notification);
        const reports = await InventoryReport.find({ inventory: user_id, deletedAt: null }).populate('item_type').populate('driver');
        return new NextResponse(JSON.stringify({message: 'OK', reports: reports}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}