import { Schema, models, model } from "mongoose";

interface IInventory extends Document {
    item_name: string;
    unit: string;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
    {
        item_name: {
            type: String,
            unique: true,
            required: true,
        },
        unit: String,
        deletedAt: String,
    },
    {
        timestamps: true,
    }
)

const Inventory = models.Inventory || model('Inventory', inventorySchema);

export default Inventory;