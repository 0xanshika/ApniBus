const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["info", "warning", "success", "error", "report"],
      default: "info",
    },

    busNumber: {
      type: String,
      default: null,
      trim: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent OverwriteModelError
module.exports =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);