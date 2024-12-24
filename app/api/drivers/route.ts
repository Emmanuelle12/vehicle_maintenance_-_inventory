import connect from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/lib/modals/users";
import DriverReport from "@/lib/modals/driver_reports";
import Notification from "@/lib/modals/notifications";
import Inventory from "@/lib/modals/inventory";

import { Types } from "mongoose";

const ObjectId = Types.ObjectId;

export const GET = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url);
        const driverId = searchParams.get('driverId');

        await connect();
        if (!driverId) {
            const inventory = await Inventory.find({ deletedAt: null });
            const reports = await DriverReport.find({ deletedAt: null }).populate('report').populate('driver').populate('conductor');
            return new NextResponse(JSON.stringify({message: 'OK', reports: reports, inventory: inventory}), {status: 200});
        }

        if (!Types.ObjectId.isValid(driverId)) {
            return new NextResponse(JSON.stringify({message: 'Driver id is invalid'}), {status: 400});
        }
        const driver = await User.findById(new ObjectId(driverId));
        console.log(driver, driverId)
        if (driver?.position != 'driver') {
            return new NextResponse(JSON.stringify({message: 'User is not a driver'}), {status: 400});
        }
        const reports = await DriverReport.find({ driver: new ObjectId(driverId), deletedAt: null }).populate('report').populate('driver');
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
        const {driver,bus_number,conductor,report, others} = await request.json();
        await connect();
        if (!Types.ObjectId.isValid(driver)) {
            return new NextResponse(JSON.stringify({message: 'Driver id is invalid'}), {status: 400});
        }
        const user = await User.findById(new ObjectId(driver));
        if (!user || user?.position != 'driver') {
            return new NextResponse(JSON.stringify({message: 'User is not a driver'}), {status: 400});
        }
        if (!Types.ObjectId.isValid(conductor)) {
            return new NextResponse(JSON.stringify({message: 'Conductor id is invalid'}), {status: 400});
        }
        const result = DriverReport.create({
            bus_number: bus_number,
            driver: driver,
            conductor: conductor,
            report: report,
            others: others,
        })
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to create report'}), {status: 400});
        }
        const notification = {
            user: new ObjectId(driver),
            message: 'You have submitted a new report',
        };
        await Notification.create(notification);
        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'Driver has submitted new report',
        });
        return new NextResponse(JSON.stringify({message: 'Driver Report successfully created'}), {status: 200});
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
        const result = await DriverReport.findOneAndUpdate(
            { _id: reportId },
            { deletedAt: new Date() },
            { new: true }
        );

        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to archive report'}), {status: 400});
        }
        const reports = await DriverReport.find({ deletedAt: null }).populate('report');
        return new NextResponse(JSON.stringify({message: 'OK', reports: reports}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}