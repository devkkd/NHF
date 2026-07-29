import Product from '../models/Product.js';
const paginate = (page=1, limit=20) => { const pg=Math.max(Number(page),1); const lim=Math.min(Number(limit),100); return {skip:(pg-1)*lim,limit:lim,page:pg}; };
export const getProducts = async (req, res, next) => {
  try {
    const { category, featured, newArrivals, page, limit, search } = req.query;
    const { skip, limit:lim, page:pg } = paginate(page, limit);
    const filter = { isActive:true };
    if (category) filter.category=category;
    if (featured==='true') filter.isFeatured=true;
    if (newArrivals==='true') filter.showInNewArrivals=true;
    if (search) filter.$or=[{ name:{$regex:search,$options:'i'} },{ sku:{$regex:search,$options:'i'} }];
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category','name slug').sort({ sortOrder:1, createdAt:-1 }).skip(skip).limit(lim).lean(),
      Product.countDocuments(filter)
    ]);
    res.json({ ok:true, data:{ products, total, page:pg, limit:lim, pages:Math.ceil(total/lim) } });
  } catch(err) { next(err); }
};
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug:req.params.slug, isActive:true }).populate('category','name slug').lean();
    if (!product) return res.status(404).json({ ok:false, error:'Not found' });
    res.json({ ok:true, data:{ product } });
  } catch(err) { next(err); }
};
export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page, limit, search, category, active } = req.query;
    const { skip, limit:lim, page:pg } = paginate(page, limit);
    const filter = {};
    if (category) filter.category=category;
    if (active==='true') filter.isActive=true;
    if (active==='false') filter.isActive=false;
    if (search) filter.$or=[{ name:{$regex:search,$options:'i'} },{ sku:{$regex:search,$options:'i'} }];
    const [products, total] = await Promise.all([
      Product.find(filter).populate('category','name slug').sort({ sortOrder:1, createdAt:-1 }).skip(skip).limit(lim).lean(),
      Product.countDocuments(filter)
    ]);
    res.json({ ok:true, data:{ products, total, page:pg, limit:lim, pages:Math.ceil(total/lim) } });
  } catch(err) { next(err); }
};
export const createProduct = async (req, res, next) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ ok:false, error:'Name required' });
    const product = await Product.create(req.body);
    await product.populate('category','name slug');
    res.status(201).json({ ok:true, data:{ product } });
  } catch(err) { if (err.code===11000) return res.status(409).json({ ok:false, error:'Duplicate' }); next(err); }
};
export const updateProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.name) body.slug = body.name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-{2,}/g,'-').trim();
    const product = await Product.findByIdAndUpdate(req.params.id, { $set:body }, { new:true, runValidators:true }).populate('category','name slug');
    if (!product) return res.status(404).json({ ok:false, error:'Not found' });
    res.json({ ok:true, data:{ product } });
  } catch(err) { next(err); }
};
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive:false }, { new:true });
    if (!product) return res.status(404).json({ ok:false, error:'Not found' });
    res.json({ ok:true, data:{ message:'Deactivated' } });
  } catch(err) { next(err); }
};
