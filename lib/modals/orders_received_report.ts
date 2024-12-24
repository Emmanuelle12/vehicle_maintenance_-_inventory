import { Schema, models, model } from "mongoose";

interface IOrdersReceivedReports extends Document {
    order: Schema.Types.ObjectId;
    narrative_report: string;
    createdAt: Date;
    updatedAt: Date;
}

const ordersReceivedReportsSchema = new Schema<IOrdersReceivedReports>(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'PurchaseOrder',
            required: true,
        },
        narrative_report: String,
    },
    {
        timestamps: true,
    }
);

const OrdersReceivedReports = models.OrdersReceivedReports || model('OrdersReceivedReports', ordersReceivedReportsSchema);

export default OrdersReceivedReports;