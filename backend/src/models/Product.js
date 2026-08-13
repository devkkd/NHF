import mongoose from 'mongoose';
const specSchema = new mongoose.Schema({ label: { type: String, required: true }, value: { type: String, required: true } }, { _id: false });
const productSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true, maxlength: 200 },
  slug:             { type: String, unique: true, lowercase: true, trim: true },
sku: {
  type: String,
  trim: true,
  default: '',
  unique: true,
  sparse: true,
},
  price: {
  type: Number,
  default: 0,
  min: 0,
},
  category:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  mainImage:        { type: String, default: '' },
  galleryImages:    { type: [String], default: [] },
  colors:           { type: [String], default: [] },
  item:             { type: String, trim: true, default: '' },
  threadCount:      { type: String, trim: true, default: '' },
  fabric:           { type: String, trim: true, default: '' },
  material:         { type: String, trim: true, default: '' },
  size:             { type: String, trim: true, default: '' },
  gsm:              { type: String, trim: true, default: '' },
  usageApplication: { type: String, trim: true, default: '' },
  bedSize:          { type: String, trim: true, default: '' },
  washType:         { type: String, trim: true, default: '' },
  packagingType:    { type: String, trim: true, default: '' },
  type:             { type: String, trim: true, default: '' },
  countryOfOrigin:  { type: String, trim: true, default: 'Made In India' },
  cotton:           { type: String, trim: true, default: '' },
  handmade:         { type: String, trim: true, default: '' },
  design:           { type: String, trim: true, default: '' },
  description:      { type: String, trim: true, default: '' },
  moreInformation:  { type: String, trim: true, default: '' },
  features:         { type: [String], default: [] },
  materials:        { type: [String], default: [] },
  careInstructions: { type: [String], default: [] },
  specs:            { type: [specSchema], default: [] },
  isActive:         { type: Boolean, default: true },
  isFeatured:       { type: Boolean, default: false },
  showInNewArrivals:{ type: Boolean, default: false },
  sortOrder:        { type: Number, default: 0 },
}, { timestamps: true });
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-{2,}/g,'-').trim();
  }
  next();
});
productSchema.index({ isActive:1 }); productSchema.index({ category:1 }); productSchema.index({ isFeatured:1 }); productSchema.index({ showInNewArrivals:1 });
const Product = mongoose.model('Product', productSchema);
export default Product;
