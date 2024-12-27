import connect from "@/lib/db";
import InventoryReport from "@/lib/modals/inventory_reports";
import InventoryStock from "@/lib/modals/inventory_stocks";
import Notification from "@/lib/modals/notifications";
import MechanicReport from "@/lib/modals/mechanic_reports";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import User from "@/lib/modals/users";
import MechanicReportItems from "@/lib/modals/mechanic_report_items";

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('user_id');
        await connect();

        if (!uid) {
            // const mechReps = await MechanicReport.find({ deletedAt: null }).populate('driver').populate('report');
            // const reports = await InventoryReport.find({ deletedAt: null }).populate('item_type').populate('driver');
            const reports = await InventoryReport.aggregate([
                {
                    $match: { deletedAt: null },
                },
                {
                    $lookup: {
                        from: 'inventories',
                        localField: 'item_type',
                        foreignField: '_id',
                        as: 'item_type',
                    },
                },
                {
                    $unwind: {
                        path: "$item_type",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'driver',
                        foreignField: '_id',
                        as: 'driver',
                    },
                },
                {
                    $unwind: {
                        path: "$driver",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        item_type: {
                            _id: '$item_type._id',
                            item_name: '$item_type.item_name',
                            unit: '$item_type.unit',
                        },
                        driver: {
                            _id: '$driver._id',
                            first_name: '$driver.first_name',
                            middle_name: '$driver.middle_name',
                            last_name: '$driver.last_name',
                            extension: '$driver.extension',
                        },
                        quantity: 1,
                        bus_number: 1,
                        recipient: 1,
                        createdAt: 1,
                    },
                }
            ]);
            return new NextResponse(JSON.stringify({message: 'OK', reports: reports}), {status: 200});
        }
        // const mechReps = await MechanicReport.find({ deletedAt: null }).populate('driver').populate('report');
        // const reports = await InventoryReport.find({ inventory: new Types.ObjectId(uid), deletedAt: null }).populate('item_type').populate('driver');
        const reports = await InventoryReport.aggregate([
            {
                $match: { deletedAt: null, inventory: new Types.ObjectId(uid) },
            },
            {
                $lookup: {
                    from: 'inventories',
                    localField: 'item_type',
                    foreignField: '_id',
                    as: 'item_type',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'driver',
                    foreignField: '_id',
                    as: 'driver',
                },
            },
            {
                $project: {
                    _id: 1,
                    item_type: {
                        _id: '$item_type._id',
                        item_name: '$item_type.item_name',
                        unit: '$item_type.unit',
                    },
                    driver: {
                        _id: '$driver._id',
                        first_name: '$driver.first_name',
                        middle_name: '$driver.middle_name',
                        last_name: '$driver.last_name',
                        extension: '$driver.extension',
                    },
                    quantity: 1,
                    bus_number: 1,
                    recipient: 1,
                    createdAt: 1,
                },
            }
        ]);
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
        const { user_id, types, quantities, driver, bus_number, mechanic, _id } = await request.json();
        await connect();
        const admin = await User.findOne({ role: 'admin' });
        for (let x = 0; x < types.length; x++) {
            const item = await MechanicReportItems.findOne({ _id: types[x] });
            const stock = await InventoryStock.findOne({ item_type: item?.inventory }).populate('item_type');
            if ((stock.stocks - quantities[x]) < 0) {
                const errorMessage = 'Quantity of ' + stock.item_type.item_name + ' has exceeded the available stock';
                return new NextResponse(JSON.stringify({message: errorMessage}), {status: 400});
            }
        }
        for (let x = 0; x < types.length; x++) {
            const item = await MechanicReportItems.findOne({ _id: types[x] });
            const stock = await InventoryStock.findOne({ item_type: item?.inventory }).populate('item_type');
            await InventoryReport.create(
                {
                    inventory: user_id,
                    item_type: item?.inventory,
                    quantity: quantities[x],
                    driver: driver,
                    bus_number: bus_number,
                }
            );
            stock.stocks -= quantities[x];
            await stock.save();
            if (stock.stocks <= stock.minimum_quantity) {
                const content = 'The quantity of ' + stock.item_type.item_name + ' has reached the minimum level. Current quantity: ' + stock.stocks + ' ' + stock.item_type.unit;
                await Notification.create({
                    user: admin._id,
                    message: content
                });
            }
        }
        // if (!result) {
        //     return new NextResponse(JSON.stringify({message: 'Failed to create report'}), {status: 400});
        // }
        await MechanicReport.findOneAndUpdate(
            { _id: _id },
            { status: 'submitted' },
            { new: true },
        );
        const notification = {
            user: user_id,
            message: 'You have created an inventory personnel report'
        };
        await Notification.create(notification);
        await Notification.create({
            user: admin?._id,
            message: 'Inventory personnel has submitted new report',
        });
        // const mechReps = await MechanicReport.find({ deletedAt: null }).populate('mechanic').populate('driver').populate('report');
        const mechReps = await MechanicReport.aggregate([
            {
                // Match only documents where deletedAt is null
                $match: { deletedAt: null },
            },
            {
                // Lookup mechanic report items
                $lookup: {
                    from: 'mechanicreportitems',
                    localField: 'report',
                    foreignField: '_id',
                    as: 'report',
                },
            },
            {
                // Lookup inventory details for report items
                $lookup: {
                    from: 'inventories',
                    localField: 'report.inventory',
                    foreignField: '_id',
                    as: 'inventoryDetails',
                },
            },
            {
                // Lookup mechanic details
                $lookup: {
                    from: 'users',
                    localField: 'mechanic',
                    foreignField: '_id',
                    as: 'mechanic',
                },
            },
            {
                // Convert mechanic array to a single object
                $unwind: {
                    path: '$mechanic',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                // Lookup driver details
                $lookup: {
                    from: 'users',
                    localField: 'driver',
                    foreignField: '_id',
                    as: 'driver',
                },
            },
            {
                // Convert driver array to a single object
                $unwind: {
                    path: '$driver',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                // Lookup conductor details
                $lookup: {
                    from: 'staffs',
                    localField: 'conductor',
                    foreignField: '_id',
                    as: 'conductor',
                },
            },
            {
                // Convert conductor array to a single object
                $unwind: {
                    path: '$conductor',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                // Project the desired fields
                $project: {
                    _id: 1,
                    bus_number: 1,
                    driver: {
                        first_name: '$driver.first_name',
                        middle_name: '$driver.middle_name',
                        last_name: '$driver.last_name',
                        extension: '$driver.extension',
                        _id: '$driver._id',
                    },
                    conductor: {
                        full_name: '$conductor.full_name',
                    },
                    mechanic: {
                        full_name: { $concat: ['$mechanic.first_name', ' ', '$mechanic.last_name'] },
                        _id: '$mechanic._id',
                    },
                    report: {
                        $map: {
                            input: '$report',
                            as: 'item',
                            in: {
                                _id: '$$item._id',
                                inventory: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$inventoryDetails',
                                                as: 'inventory',
                                                cond: { $eq: ['$$inventory._id', '$$item.inventory'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                                quantity: '$$item.quantity',
                            },
                        },
                    },
                    repair_status: 1,
                    report_date: 1,
                    narrative_report: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
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