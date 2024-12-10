import connect from "@/lib/db";
import { NextResponse } from "next/server";
import Supplier from "@/lib/modals/suppliers";
import Notification from "@/lib/modals/notifications";
import { Types } from "mongoose";
import User from "@/lib/modals/users";

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const supplierId = searchParams.get('supplier_id');
        await connect();
        if (supplierId) {
            if (!Types.ObjectId.isValid(supplierId)) {
                return new NextResponse(JSON.stringify({message: 'Supplier id is invalid'}), {status: 400});
            }
            const supplier = await Supplier.findOne({ _id: supplierId });
            return new NextResponse(JSON.stringify({message: 'OK', supplier: supplier}), {status: 200});
        }
        const suppliers = await Supplier.find({ deletedAt: null });
        return new NextResponse(JSON.stringify({message: 'OK', suppliers: suppliers}), {status: 200});
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
        const supplier = new Supplier(body);
        supplier.save();
        if (!supplier) {
            return new NextResponse(JSON.stringify({message: 'Failed to create supplier'}), {status: 400});
        }
        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'You have created new supplier',
        });
        return new NextResponse(JSON.stringify({message: 'New supplier created'}), {status: 200});
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
        const body = await request.json();

        if (!supplierId) {
            return new NextResponse(JSON.stringify({message: 'Supplier id not found'}), {status: 400});
        }
        if (!Types.ObjectId.isValid(supplierId)) {
            return new NextResponse(JSON.stringify({message: 'Supplier id is invalid'}), {status: 400});
        }

        await connect();
        const updateSupplier = await Supplier.findOneAndUpdate(
            { _id: new Types.ObjectId(supplierId) },
            body,
            { new: true }
        );

        if (!updateSupplier) {
            return new NextResponse(JSON.stringify({message: 'Failed to update supplier'}), {status: 400});
        }
        
        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'You have updated supplier',
        });
        return new NextResponse(JSON.stringify({message: 'Supplier updated'}), {status: 200});
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
            { deletedAt: new Date() },
            { new: true }
        );
        await Notification.create();
        if (!result) {
            return new NextResponse(JSON.stringify({message: 'Failed to archive supplier'}), {status: 400});
        }
        
        const admin = await User.findOne({ role: 'admin' });
        await Notification.create({
            user: admin?._id,
            message: 'You have archived supplier',
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