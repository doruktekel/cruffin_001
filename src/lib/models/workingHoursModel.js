import mongoose from "mongoose";

const WorkingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: [true, "Zorunlu alan"],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    openTime: {
      type: String,
      required: [true, "Zorunlu alan"],
    },
    closeTime: {
      type: String,
      required: [true, "Zorunlu alan"],
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const WorkingHoursModel =
  mongoose.models.WorkingHours ||
  mongoose.model("WorkingHours", WorkingHoursSchema);
