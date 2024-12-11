import { Schema, models, model } from "mongoose";

interface IInventoryStock extends Document {
    item_type: Schema.Types.ObjectId;
    stocks: number;
    minimum_quantity: number;
    maximum_quantity: number;
}

const inventoryStockSchema = new Schema<IInventoryStock>(
    {
        item_type: {
            type: Schema.Types.ObjectId,
            ref: 'Inventory',
            required: true,
        },
        stocks: {
            type: Number,
            default: 0,
            min: 0,
        },
        minimum_quantity: {
            type: Number,
            required: true,
        },
        maximum_quantity: {
            type: Number,
            required: true,
        },
    }
);

const InventoryStock = models.InventoryStock || model('InventoryStock', inventoryStockSchema);

export default InventoryStock;