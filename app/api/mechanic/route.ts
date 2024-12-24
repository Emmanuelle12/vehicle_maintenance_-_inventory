import connect from "@/lib/db";
import MechanicReport from "@/lib/modals/mechanic_reports";
import MechanicReportItems from "@/lib/modals/mechanic_report_items";
import Notification from "@/lib/modals/notifications";
import Inventory from "@/lib/modals/inventory";
import DriverReport from "@/lib/modals/driver_reports";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import User from "@/lib/modals/users";

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const mechId = searchParams.get('mechanic_id');
        await connect();
        const inventory = await Inventory.find({ deletedAt: null });
        if (!mechId) {
            // const driver_reports = await DriverReport.find({ deletedAt: null }).populate('driver').populate('report').populate('conductor');
            const driver_reports = await DriverReport.aggregate([
                {
                    $match: { deletedAt: null },
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
                    $lookup: {
                        from: 'inventories',
                        localField: 'report',
                        foreignField: '_id',
                        as: 'report',
                    },
                },
                {
                    $lookup: {
                        from: 'staffs',
                        localField: 'conductor',
                        foreignField: '_id',
                        as: 'conductor',
                    },
                },
                {
                    $unwind: {
                        path: "$conductor",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        _id: 1,
                        bus_number: 1,
                        driver: {
                            _id: '$driver._id',
                            first_name: '$driver.first_name',
                            middle_name: '$driver.middle_name',
                            last_name: '$driver.last_name',
                            extension: '$driver.extension',
                        },
                        report: {
                            _id: '$report._id',
                            item_name: '$report.item_name',
                        },
                        conductor: {
                            _id: '$conductor._id',
                            full_name: '$conductor.full_name',
                        },
                        status: 1,
                    },
                }
            ]);
            // const reports = await MechanicReport.find({ deletedAt: null }).populate('mechanic').populate('driver').populate('report');
            const reports = await MechanicReport.aggregate([
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
            return new NextResponse(JSON.stringify({message: 'OK', reports: reports, inventory: inventory, driver: driver_reports}), {status: 200});
        }
        // const reports = await MechanicReport.find({ mechanic: new Types.ObjectId(mechId), deletedAt: null }).populate('mechanic').populate('driver').populate('report');
        // const driver_reports = await DriverReport.find({ deletedAt: null }).populate('driver').populate('report');
        const driver_reports = await DriverReport.aggregate([
            {
                $match: { deletedAt: null },
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
                $lookup: {
                    from: 'inventories',
                    localField: 'report',
                    foreignField: '_id',
                    as: 'report',
                },
            },
            {
                $lookup: {
                    from: 'staffs',
                    localField: 'conductor',
                    foreignField: '_id',
                    as: 'conductor',
                },
            },
            {
                $unwind: {
                    path: "$conductor",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    bus_number: 1,
                    driver: {
                        _id: '$driver._id',
                        first_name: '$driver.first_name',
                        middle_name: '$driver.middle_name',
                        last_name: '$driver.last_name',
                        extension: '$driver.extension',
                    },
                    report: {
                        _id: '$report._id',
                        item_name: '$report.item_name',
                    },
                    conductor: {
                        _id: '$conductor._id',
                        full_name: '$conductor.full_name',
                    },
                    status: 1,
                },
            }
        ]);
        const reports = await MechanicReport.aggregate([
            {
                // Match only documents where deletedAt is null
                $match: { deletedAt: null, mechanic: mechId },
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
        return new NextResponse(JSON.stringify({message: 'OK', reports: reports, driver: driver_reports, inventory: inventory}), {status: 200});
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
        const body = await request.json();
        await connect();
        const reportArray = [];
        for (let index = 0; index < body.report.length; index++) {
            const element = body.report[index];
            const temp = await MechanicReportItems.create({ inventory: element, quantity: body.quantities[index] });
            reportArray.push(temp._id)
        }
        const newReport = {
            ...body,
            report: reportArray
        };
        const result = await MechanicReport.create(newReport);
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to create mechanic report'}), {status: 400});
        }
        await DriverReport.findOneAndUpdate(
            { _id: body?.report_id },
            { status: 'confirmed' },
            { new: true }
        );
        await Notification.create(
            {
                user: new Types.ObjectId(body?.mechanic),
                message: 'You have submitted a report',
            }
        )
        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'Mechanic has submitted new report',
        });
        const driver_reports = await DriverReport.find({ deletedAt: null }).populate('driver');
        const reports = await MechanicReport.find({ mechanic: new Types.ObjectId(body?.id), deletedAt: null }).populate('mechanic').populate('driver');
        return new NextResponse(JSON.stringify({message: 'OK', driver: driver_reports, reports: reports}), {status: 200});
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
        const reportId = searchParams.get('report_id');
        if (!reportId) {
            return new NextResponse(JSON.stringify({message: 'Missing report id'}), {status: 400});
        }
        
        if (!Types.ObjectId.isValid(reportId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid report id'}), {status: 400});
        }

        await connect();
        const result = await MechanicReport.findOneAndUpdate(
            { _id: reportId },
            { deletedAt: new Date() },
            { new: true }
        );
        
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to archive report'}), {status: 400});
        }
        const notification = {
            user: result?.mechanic,
            message: 'You have restored a report from the archive'
        };
        await Notification.create(notification);
        const reports = await MechanicReport.find({ mechanic: new Types.ObjectId(reportId), deletedAt: null }).populate('mechanic').populate('driver');
        return new NextResponse(JSON.stringify({message: 'OK', reports: reports, result: result}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}