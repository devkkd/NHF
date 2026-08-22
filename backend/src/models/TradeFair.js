import mongoose from "mongoose";

const tradeFairImageSchema =
  new mongoose.Schema(
    {
      url: {
        type: String,
        required: true,
        trim: true,
      },

      alt: {
        type: String,
        trim: true,
        default:
          "Nikita Home Furnishings Trade Fair",
      },
    },
    {
      _id: true,
    }
  );

const tradeFairSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,
        enum: [
          "past",
          "upcoming",
        ],
        required: true,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        trim: true,
        default: "",
        maxlength: 1000,
      },

      images: {
        type: [
          tradeFairImageSchema,
        ],

        default: [],
      },

      date: {
        type: Date,
        default: null,
      },

      dateText: {
        type: String,
        trim: true,
        default: "",
      },

      venue: {
        type: String,
        trim: true,
        default: "",
      },

      timing: {
        type: String,
        trim: true,
        default: "",
      },

      location: {
        type: String,
        trim: true,
        default: "",
      },

      active: {
        type: Boolean,
        default: true,
        index: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );


tradeFairSchema.index({
  type: 1,
  active: 1,
  sortOrder: 1,
});


const TradeFair =
  mongoose.models.TradeFair ||
  mongoose.model(
    "TradeFair",
    tradeFairSchema
  );

export default TradeFair;