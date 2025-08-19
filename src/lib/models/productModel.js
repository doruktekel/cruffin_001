import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Ürün adı zorunludur !"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return v.trim().length > 0;
        },
        message: "Ürün adı boş bırakılamaz !",
      },
    },

    price: {
      type: Number,
      required: [true, "Fiyat alanı zorunludur !"],
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: "Fiyat pozitif bir sayı olmalıdır !",
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
    description: {
      type: String,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    calories: { type: Number },
    isVegan: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },

    allergens: { type: [String], default: [] },

    isAvailable: { type: Boolean, default: true },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
