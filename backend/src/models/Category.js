import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    image: {
      type: String,
      default: '',
    },

    // null = main category
    // ObjectId = subcategory of another category
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    // Whether this category should appear on Home page
    showInHome: {
      type: Boolean,
      default: false,
    },

    // Whether this category should appear in Wardrobe
    showInWardrobe: {
      type: Boolean,
      default: false,
    },

    // Whether this category should appear in Footer
    showInFooter: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Serial number / display position
    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
      .trim();
  }

  next();
});

categorySchema.index({
  isActive: 1,
});

categorySchema.index({
  showInHome: 1,
});

categorySchema.index({
  showInWardrobe: 1,
});

categorySchema.index({
  parent: 1,
});

categorySchema.index({
  parent: 1,
  sortOrder: 1,
});

const Category = mongoose.model('Category', categorySchema);

export default Category;