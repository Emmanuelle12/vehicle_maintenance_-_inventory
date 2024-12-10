import { Schema, model, models } from "mongoose";

const supplierSchema = new Schema(
    {
        supplier_company: {
            type: String,
            required: true
        },
        supplier_address: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true
        },
        deletedAt: Date,
    },
    {
        timestamps: true
    }
)

const Supplier = models.Supplier || model('Supplier', supplierSchema);

export default Supplier;