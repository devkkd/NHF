import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  quote:    { type: String, required: true },
  name:     { type: String, required: true },
  location: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
