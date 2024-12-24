import { Schema, models, model } from "mongoose";

interface IStaff extends Document {
    full_name: string;
    position: string;
    deletedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
    {
        full_name: {
            type: String,
            required: true,
        },
        position: {
            type: String,
            required: true,
        },
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

const Staff = models.Staff || model('Staff', staffSchema);

export default Staff;