import connect from "@/lib/db"
import User from "@/lib/modals/users";
import Notification from "@/lib/modals/notifications";
import { NextResponse } from "next/server"
import { Types } from "mongoose";
import bcryptjs from "bcryptjs";
import { createSigner } from "fast-jwt";
// import jwt from 'jsonwebtoken';

const ObjectId = Types.ObjectId;

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('user_id');
        await connect();
        if (userId) {
            if (!Types.ObjectId.isValid(userId)) {
                return new NextResponse(JSON.stringify({message: 'Invalid user id'}), {status: 400});
            }
            const user = await User.findOne({ _id: userId });
            return new NextResponse(JSON.stringify({message: 'OK', user: user}), {status: 200});
        }
        const users = await User.find().select('-password');
        return new NextResponse(JSON.stringify(users), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message
        }
        return new NextResponse('ERROR: ' + message, {status: 500});
    }
}

export const POST = async (request: Request) => {
    try {
        const body = await request.json();
        await connect();
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(body?.password, salt);
        const newUser = new User({
            ...body,
            password: hashedPassword
        });
        await newUser.save();
        const tokenData = {
            id: newUser._id,
            email: newUser.email,
            position: newUser.position,
        }
        const signer = createSigner({ key: process.env.SECRET_KEY });
        const token = signer(tokenData);
        // const token = jwt.sign(tokenData, 'secret', {expiresIn: '5h'});
        const response = NextResponse.json({
            message: 'OK',
            user: newUser
        });
        const now = new Date();
        const notificationData = {
            user: new ObjectId(newUser._id),
            message: `You have successfully registered your account.`,
        }
        const notification = new Notification(notificationData);
        await notification.save();
        now.setMinutes(now.getMinutes() + 60);
        response.cookies.set('token', token, { httpOnly: true, expires: now });
        return response;
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message
        }
        return new NextResponse('ERROR: ' + message, {status: 500});
    }
}

export const PATCH = async (request: Request) => {
    try {
        const body = await request.json();
        const {userId, newEmail} = body;

        await connect();
        if (!userId || !newEmail) {
            return new NextResponse(JSON.stringify({message: 'User not found'}), {status: 400});
        }
        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid user id'}), {status: 400});
        }
        const updateUser = await User.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            { email: newEmail },
            { new: true }
        );
        if (!updateUser) {
            return new NextResponse(JSON.stringify({message: 'User update failed', user: updateUser.select('-password')}), {status: 400});
        }
        await Notification.create({
            user: userId,
            message: 'You have updated your account'
        });
        return new NextResponse(JSON.stringify({message: 'User is updated'}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message
        }
        return new NextResponse('ERROR: ' + message, {status: 500});
    }
}

export const DELETE = async (request: Request) => {
    try {
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return new NextResponse(JSON.stringify({message: 'User not found'}), {status: 400});
        }
        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({message: 'Invalid user id'}), {status: 400});
        }
        
        await connect();
        const deleteUser = await User.findByIdAndDelete(
            new Types.ObjectId(userId)
        );

        if (!deleteUser) {
            return new NextResponse(JSON.stringify({message: 'Failed to delete user'}), {status: 400});
        }

        return new NextResponse(JSON.stringify({message: 'User deleted successfully'}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message
        }
        return new NextResponse('ERROR: ' + message, {status: 500});
    }
}