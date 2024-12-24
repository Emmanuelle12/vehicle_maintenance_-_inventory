import connect from "@/lib/db";
import Staff from "@/lib/modals/staff";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connect();
        const conductors = await Staff.find({ deletedAt: null, position: 'conductor' });
        return new NextResponse(JSON.stringify({message: 'OK', conductors: conductors}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('Error: ' + message, {status: 500});
    }
}