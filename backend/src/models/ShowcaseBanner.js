import mongoose from 'mongoose';

const showcaseBannerSchema = new mongoose.Schema({
  title:       { type: String, required: true },       // internal label
  productName: { type: String, required: true },       // shown on card
  bgImage:     { type: String, required: true },       // full-width bg
  cardImage:   { type: String, required: true },       // floating card image
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('ShowcaseBanner', showcaseBannerSchema);
