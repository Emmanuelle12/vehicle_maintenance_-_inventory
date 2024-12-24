import connect from "@/lib/db";
import InventoryStock from "@/lib/modals/inventory_stocks";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connect();
        const stocks = await InventoryStock.find().populate('item_type');
        return new NextResponse(JSON.stringify({message: 'OK', stocks: stocks}), {status: 200});
    } catch (error: unknown) {
        let message = '';
        if (error instanceof Error) {
            message = error.message;
        }
        return new NextResponse('ERROR: ' + message, {status:500});
    }
}