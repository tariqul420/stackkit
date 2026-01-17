import mongoose, { Document, Schema } from "mongoose";

export interface IHealth extends Document {
  success: boolean;
  message: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

const healthSchema: Schema = new Schema(
  {
    success: {
      type: Boolean,
      default: true,
    },
    message: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes for better performance
healthSchema.index({ createdAt: -1 });

export default mongoose.models.Health || mongoose.model<IHealth>("Health", healthSchema);
