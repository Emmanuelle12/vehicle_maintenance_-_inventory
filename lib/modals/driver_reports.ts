import { Schema, model, models } from "mongoose";

interface IDriverReport extends Document {
    bus_number: string;
    driver: Schema.Types.ObjectId;
    conductor: Schema.Types.ObjectId;
    report: Schema.Types.ObjectId[];
    status: string;
    others: string;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const driverReportSchema = new Schema<IDriverReport>(
    {
        bus_number: {
            type: String,
            required: true,
        },
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        conductor: {
            type: Schema.Types.ObjectId,
            ref: 'Staff',
            required: true,
        },
        report: {
            type: [Schema.Types.ObjectId],
            ref: 'Inventory',
            required: true,
        },
        status: {
            type: String,
            default: 'pending',
        },
        others: String,
        deletedAt: Date,
    },
    {
        timestamps: true
    }
)

const DriverReport = models.DriverReport || model('DriverReport', driverReportSchema);

export default DriverReport;