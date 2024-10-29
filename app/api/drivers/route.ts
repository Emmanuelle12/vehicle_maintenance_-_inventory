import connect from "@/lib/db";
import { NextResponse } from "next/server";
import User from "@/lib/modals/users";
import DriverReport from "@/lib/modals/driver_reports";
import { Types } from "mongoose";

const ObjectId = Types.ObjectId;

export const GET = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url);
        const driverId = searchParams.get('driverId');

        await connect();
        if (!driverId) {
            // return new NextResponse(JSON.stringify({message: 'Driver not found'}), {status: 400});
            const reports = await DriverReport.find({ deletedAt: null });
            return new NextResponse(JSON.stringify({message: 'OK', reports: reports}), {status: 200});
        }

        if (!Types.ObjectId.isValid(driverId)) {
            return new NextResponse(JSON.stringify({message: 'Driver id is invalid'}), {status: 400});
        }
        const driver = await User.findById(new ObjectId(driverId));
        if (driver?.position != 'driver') {
            return new NextResponse(JSON.stringify({message: 'User is not a driver'}), {status: 400});
        }
        const reports = await DriverReport.find({ driver: driver._id, deletedAt: null });
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
        const {driver,report_date,bus_number,conductor,report} = await request.json();
        await connect();
        if (!Types.ObjectId.isValid(driver)) {
            return new NextResponse(JSON.stringify({message: 'Driver id is invalid'}), {status: 400});
        }
        const user = await User.findById(new ObjectId(driver));
        if (!user || user?.position != 'driver') {
            return new NextResponse(JSON.stringify({message: 'User is not a driver'}), {status: 400});
        }
        // const driver_report = new DriverReport({
        //     report_date: report_date,
        //     bus_number: bus_number,
        //     driver: driver,
        //     conductor: conductor,
        //     report: report
        // });
        // driver_report.save();
        const result = DriverReport.create({
            report_date: report_date,
            bus_number: bus_number,
            driver: driver,
            conductor: conductor,
            report: report
        })
        return new NextResponse(JSON.stringify({message: 'Driver Report successfully created'}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}