import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true, maxlength: 80 },
  slug:           { type: String, unique: true, lowercase: true, trim: true },
  description:    { type: String, trim: true, default: '' },
  image:          { type: String, default: '' },
  parent:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  showInWardrobe: { type: Boolean, default: false },
  showInFooter:   { type: Boolean, default: true },
  isActive:       { type: Boolean, default: true },
  sortOrder:      { type: Number, default: 0 },
}, { timestamps: true });
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-{2,}/g,'-').trim();
  }
  next();
});
categorySchema.index({ isActive: 1 });
categorySchema.index({ showInWardrobe: 1 });
categorySchema.index({ sortOrder: 1 });
const Category = mongoose.model('Category', categorySchema);
export default Category;
