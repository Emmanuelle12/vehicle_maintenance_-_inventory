import connect from "@/lib/db";
import MechanicReport from "@/lib/modals/mechanic_reports";
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
            const driver_reports = await DriverReport.find({ deletedAt: null }).populate('driver').populate('report');
            const reports = await MechanicReport.find({ deletedAt: null }).populate('mechanic').populate('driver').populate('report');
            return new NextResponse(JSON.stringify({message: 'OK', reports: reports, inventory: inventory, driver: driver_reports}), {status: 200});
        }
        const reports = await MechanicReport.find({ mechanic: new Types.ObjectId(mechId), deletedAt: null }).populate('mechanic').populate('driver').populate('report');
        const driver_reports = await DriverReport.find({ deletedAt: null }).populate('driver').populate('report');
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
        const result = await MechanicReport.create(body);
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