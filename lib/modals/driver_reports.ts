import { Schema, model, models } from "mongoose";

interface IDriverReport extends Document {
    report_date: Date;
    bus_number: string;
    driver: Schema.Types.ObjectId;
    conductor: string;
    report: string;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const driverReportSchema = new Schema<IDriverReport>(
    {
        report_date: {
            type: Date,
            required: true,
        },
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
            type: String,
            required: true,
        },
        report: {
            type: String,
            required: true,
        },
        deletedAt: Date,
    },
    {
        timestamps: true
    }
)

const DriverReport = models.DriverReport || model('DriverReport', driverReportSchema);

export default DriverReport;