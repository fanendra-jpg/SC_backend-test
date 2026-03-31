const mongoose = require("mongoose");
const institutionPriceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    type: {
      type: String,
      enum: ["college", "school"],
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin1"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstitutionPrice", institutionPriceSchema);