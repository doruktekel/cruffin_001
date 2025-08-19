import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, "Adres alanı zorunludur."],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Telefon alanı zorunludur."],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9+\-\s]{7,20}$/.test(v); // Sadece rakam, +, - ve boşluk izinli
        },
        message: "Geçerli bir telefon numarası giriniz.",
      },
    },
    email: {
      type: String,
      required: [true, "Email alanı zorunludur."],
      trim: true,
      match: [/.+@.+\..+/, "Geçerli bir email adresi giriniz."],
    },
    mapLink: {
      type: String,
      required: [true, "Harita linki zorunludur."],
      trim: true,
      validate: {
        validator: function (v) {
          try {
            new URL(v); // Geçerli bir URL mi kontrol eder
            return true;
          } catch {
            return false;
          }
        },
        message: "Geçerli bir URL giriniz.",
      },
    },
  },
  {
    timestamps: true,
  }
);

export const ContactModel =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema);
