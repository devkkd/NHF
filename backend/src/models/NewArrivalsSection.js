import mongoose from 'mongoose';

const newArrivalsSectionSchema = new mongoose.Schema({
  heading:     { type: String, default: 'A HOME IS A FEELING,\nWE HELP YOU BUILD IT.' },
  paragraph:   { type: String, default: '' },
  cardImage:   { type: String, default: '' },  // left product card image
  cardTitle:   { type: String, default: '' },  // product name on card
  bigImage:    { type: String, default: '' },  // right large image
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('NewArrivalsSection', newArrivalsSectionSchema);
