import mongoose from "mongoose";

const InfoSchema = new mongoose.Schema(
  {
    title: {
      required: [true, "Başlık gereklidir"],
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: (v) => v?.toString().trim().length > 0,
        message: "Başlık boş olamaz",
      },
    },
    description: {
      required: [true, "Açıklama gereklidir"],
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: (v) => v?.toString().trim().length > 0,
        message: "Açıklama boş olamaz",
      },
    },
    image: {
      type: String,
      required: [true, "Görsel alanı zorunludur !"],
      validate: {
        validator: function (v) {
          return v && v.trim().length > 0;
        },
        message: "Görsel bağlantısı boş olamaz !",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InfoModel =
  mongoose.models.Info || mongoose.model("Info", InfoSchema);
