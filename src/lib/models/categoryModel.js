import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Kategori adı zorunludur !"],
      validate: {
        validator: function (value) {
          return value.trim().length > 0;
        },
        message: "Kategori adı boş bırakılamaz mongodb !",
      },
    },
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CategoryModel =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
