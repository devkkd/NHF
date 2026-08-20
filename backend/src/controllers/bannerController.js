import Banner from '../models/Banner.js';

// ── Public ──────────────────────────────────────────────────
// GET /api/banners  — only active banners, sorted by order
export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json({ ok: true, data: banners });
  } catch (err) { next(err); }
};

// ── Admin ───────────────────────────────────────────────────
// GET /api/admin/banners
export const getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json({ ok: true, data: banners });
  } catch (err) { next(err); }
};

// POST /api/admin/banners
export const createBanner = async (req, res, next) => {
  try {
    const { title, headline, subtext, image, buttons, isActive, order } = req.body;
    if (!title || !headline || !image)
      return res.status(400).json({ ok: false, error: 'title, headline and image are required' });

    const banner = await Banner.create({ title, headline, subtext, image, buttons, isActive, order });
    res.status(201).json({ ok: true, data: banner });
  } catch (err) { next(err); }
};

// PUT /api/admin/banners/:id
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ ok: false, error: 'Banner not found' });
    res.json({ ok: true, data: banner });
  } catch (err) { next(err); }
};

// DELETE /api/admin/banners/:id
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ ok: false, error: 'Banner not found' });
    res.json({ ok: true, message: 'Banner deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/admin/banners/:id/toggle
export const toggleBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ ok: false, error: 'Banner not found' });
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ ok: true, data: banner });
  } catch (err) { next(err); }
};

// PATCH /api/admin/banners/reorder  — body: [{ id, order }]
export const reorderBanners = async (req, res, next) => {
  try {
    const updates = req.body; // [{ id, order }]
    await Promise.all(updates.map(({ id, order }) =>
      Banner.findByIdAndUpdate(id, { order })
    ));
    res.json({ ok: true, message: 'Reordered' });
  } catch (err) { next(err); }
};
