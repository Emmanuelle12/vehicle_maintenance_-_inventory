import connect from "@/lib/db";
import Staff from "@/lib/modals/staff";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connect();
        const staff = await Staff.find({ deletedAt: { $ne: null } });
        return new NextResponse(JSON.stringify({message: 'OK', staffs: staff}), {status: 200});
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
        const staffId = searchParams.get('staff_id');

        if (!staffId) {
            return new NextResponse(JSON.stringify({message: 'Missing staff id'}), {status: 400});
        }
        
        if (!Types.ObjectId.isValid(staffId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid staff id'}), {status: 400});
        }
        await connect();

        const result = await Staff.findOneAndUpdate(
            { _id: staffId },
            { deletedAt: null },
            { new: true },
        );

        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to restore staff'}), {status: 500});
        }
        const staff = await Staff.find({ deletedAt: { $ne: null } });
        return new NextResponse(JSON.stringify({message: 'OK', staffs: staff}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}

export const DELETE = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const staffId = searchParams.get('staff_id');

        if (!staffId) {
            return new NextResponse(JSON.stringify({message: 'Missing staff id'}), {status: 400});
        }
        
        if (!Types.ObjectId.isValid(staffId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid staff id'}), {status: 400});
        }
        await connect();
        const result = await Staff.findOneAndDelete({ _id: staffId });
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to delete staff'}), {status: 500});
        }
        const staff = await Staff.find({ deletedAt: { $ne: null } });
        return new NextResponse(JSON.stringify({message: 'OK', staffs: staff}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}