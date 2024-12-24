import { Schema, model, models } from "mongoose";

interface IMechanicReport extends Document {
    mechanic: Schema.Types.ObjectId;
    bus_number: string;
    driver: Schema.Types.ObjectId;
    conductor: Schema.Types.ObjectId;
    report: Schema.Types.ObjectId[];
    report_date: Date;
    repair_status: string;
    narrative_report: string;
    status: string;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const mechanicReportSchema = new Schema<IMechanicReport>(
    {
        mechanic: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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
            type: Schema.Types.ObjectId,
            ref: 'Staff',
            required: true,
        },
        report: {
            type: [Schema.Types.ObjectId],
            ref: 'MechanicReportItems',
            required: true,
        },
        repair_status: {
            type: String,
            required: true,
        },
        narrative_report: String,
        status: {
            type: String,
            default: 'pending',
        },
        report_date: Date,
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
)

const MechanicReport = models.MechanicReport || model('MechanicReport', mechanicReportSchema);

export default MechanicReport;