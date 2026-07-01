import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Category name is required"],
      trim:     true,
      maxlength:[80, "Name cannot exceed 80 characters"],
    },
    slug: {
      type:      String,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    description: {
      type:    String,
      trim:    true,
      default: "",
    },
    image: {
      type:    String,   // URL / path
      default: "",
    },
    /**
     * showInWardrobe — when true this category appears in the
     * "THE WARDROBE" section on the homepage.
     * Default: false (shows only in "ALL CATEGORY").
     */
    showInWardrobe: {
      type:    Boolean,
      default: false,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    sortOrder: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name before save
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-{2,}/g, "-")
      .trim();
  }
  next();
});

categorySchema.index({ isActive: 1 });
categorySchema.index({ showInWardrobe: 1 });
categorySchema.index({ sortOrder: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
