import { Schema, models, model } from "mongoose";

interface IMechanicReportItems extends Document {
    inventory: Schema.Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

const mechanicReportItemsSchema = new Schema<IMechanicReportItems>(
    {
        inventory: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
        quantity: { type: Number, required: true },
    },
    {
        timestamps: true
    }
)

const MechanicReportItems = models.MechanicReportItems || model('MechanicReportItems', mechanicReportItemsSchema);

export default MechanicReportItems;