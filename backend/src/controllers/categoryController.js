import Category from '../models/Category.js';
const paginate = (page=1, limit=50) => { const pg=Math.max(Number(page),1); const lim=Math.min(Number(limit),100); return {skip:(pg-1)*lim,limit:lim,page:pg}; };
export const getCategories = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.wardrobe === 'true') filter.showInWardrobe = true;
    const categories = await Category.find(filter).sort({ sortOrder:1, createdAt:1 }).lean();
    res.json({ ok:true, data:{ categories } });
  } catch(err) { next(err); }
};
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive:true }).lean();
    if (!category) return res.status(404).json({ ok:false, error:'Not found' });
    res.json({ ok:true, data:{ category } });
  } catch(err) { next(err); }
};
export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const { skip, limit:lim, page:pg } = paginate(page, limit);
    const filter = {};
    if (search) filter.name = { $regex:search, $options:'i' };
    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ sortOrder:1, createdAt:-1 }).skip(skip).limit(lim).lean(),
      Category.countDocuments(filter)
    ]);
    res.json({ ok:true, data:{ categories, total, page:pg, limit:lim } });
  } catch(err) { next(err); }
};
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, showInWardrobe, sortOrder } = req.body;
    if (!name?.trim()) return res.status(400).json({ ok:false, error:'Name required' });
    const category = await Category.create({ name:name.trim(), description:description?.trim()||'', image:image?.trim()||'', showInWardrobe:showInWardrobe===true||showInWardrobe==='true', sortOrder:Number(sortOrder)||0 });
    res.status(201).json({ ok:true, data:{ category } });
  } catch(err) { if (err.code===11000) return res.status(409).json({ ok:false, error:'Name exists' }); next(err); }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, showInWardrobe, isActive, sortOrder } = req.body;
    const update = {};
    if (name!==undefined) { update.name=name.trim(); update.slug=name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-{2,}/g,'-'); }
    if (description!==undefined) update.description=description.trim();
    if (image!==undefined) update.image=image.trim();
    if (showInWardrobe!==undefined) update.showInWardrobe=showInWardrobe===true||showInWardrobe==='true';
    if (isActive!==undefined) update.isActive=isActive===true||isActive==='true';
    if (sortOrder!==undefined) update.sortOrder=Number(sortOrder);
    const category = await Category.findByIdAndUpdate(req.params.id, { $set:update }, { new:true, runValidators:true });
    if (!category) return res.status(404).json({ ok:false, error:'Not found' });
    res.json({ ok:true, data:{ category } });
  } catch(err) { next(err); }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive:false }, { new:true });
    if (!category) return res.status(404).json({ ok:false, error:'Not found' });
    res.json({ ok:true, data:{ message:'Deactivated' } });
  } catch(err) { next(err); }
};
