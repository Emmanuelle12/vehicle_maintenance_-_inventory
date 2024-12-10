import connect from "@/lib/db";
import { NextResponse } from "next/server";
import Supplier from "@/lib/modals/suppliers";
import { Types } from "mongoose";
import User from "@/lib/modals/users";
import Notification from "@/lib/modals/notifications";

export const GET = async () => {
    try {
        const archive = await Supplier.find({ deletedAt: { $ne: null } });
        return new NextResponse(JSON.stringify({message: 'OK', archive: archive}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}

export const DELETE = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url);
        const supplierId = searchParams.get('supplierId');

        if (!supplierId) {
            return new NextResponse(JSON.stringify({message: 'Supplier id not found'}), {status: 400});
        }
        if (!Types.ObjectId.isValid(supplierId)) {
            return new NextResponse(JSON.stringify({message: 'Supplier id is invalid'}), {status: 400});
        }

        await connect();
        const deleteSupplier = await Supplier.findByIdAndDelete(new Types.ObjectId(supplierId));
        if (!deleteSupplier) {
            return new NextResponse(JSON.stringify({message: 'Failed to delete supplier'}), {status: 400});
        }

        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'You have deleted supplier',
        });
        const archive = await Supplier.find({ deletedAt: { $ne: null } });
        return new NextResponse(JSON.stringify({message: 'OK', archive: archive}), {status: 200});
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
        const {searchParams} = new URL(request.url);
        const supplierId = searchParams.get('supplier_id');

        if (!supplierId) {
            return new NextResponse(JSON.stringify({message: 'Supplier id not found'}), {status: 400});
        }
        if (!Types.ObjectId.isValid(supplierId)) {
            return new NextResponse(JSON.stringify({message: 'Supplier id is invalid'}), {status: 400});
        }

        await connect();
        const result = await Supplier.findOneAndUpdate(
            { _id: supplierId },
            { deletedAt: null },
            { new: true }
        );

        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to restore supplier'}), {status: 400});
        }
        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'You have restored supplier',
        });
        const archive = await Supplier.find({ deletedAt: { $ne: null } });
        return new NextResponse(JSON.stringify({message: 'OK', archive: archive}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}