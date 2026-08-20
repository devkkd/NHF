import mongoose from 'mongoose';

const buttonSchema = new mongoose.Schema({
  label: { type: String, required: true },
  href:  { type: String, required: true },
  style: { type: String, enum: ['primary', 'secondary'], default: 'primary' },
}, { _id: false });

const bannerSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  headline:  { type: String, required: true },
  subtext:   { type: String, default: '' },
  image:     { type: String, required: true }, // R2 public URL
  buttons:   { type: [buttonSchema], default: [] },
  isActive:  { type: Boolean, default: true },
  order:     { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Banner', bannerSchema);
