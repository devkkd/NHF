import ShowcaseBanner from '../models/ShowcaseBanner.js';

// ── Public — get the active showcase banner ──────────────────
export const getActiveShowcase = async (req, res, next) => {
  try {
    const banner = await ShowcaseBanner.findOne({ isActive: true }).sort({ updatedAt: -1 });
    res.json({ ok: true, data: banner || null });
  } catch (err) { next(err); }
};

// ── Admin ────────────────────────────────────────────────────
export const getAllShowcases = async (req, res, next) => {
  try {
    const banners = await ShowcaseBanner.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: banners });
  } catch (err) { next(err); }
};

export const createShowcase = async (req, res, next) => {
  try {
    const { title, productName, bgImage, cardImage, isActive } = req.body;
    if (!title || !productName || !bgImage || !cardImage)
      return res.status(400).json({ ok: false, error: 'title, productName, bgImage and cardImage are required' });
    const banner = await ShowcaseBanner.create({ title, productName, bgImage, cardImage, isActive });
    res.status(201).json({ ok: true, data: banner });
  } catch (err) { next(err); }
};

export const updateShowcase = async (req, res, next) => {
  try {
    const banner = await ShowcaseBanner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!banner) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, data: banner });
  } catch (err) { next(err); }
};

export const deleteShowcase = async (req, res, next) => {
  try {
    const banner = await ShowcaseBanner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

export const toggleShowcase = async (req, res, next) => {
  try {
    const banner = await ShowcaseBanner.findById(req.params.id);
    if (!banner) return res.status(404).json({ ok: false, error: 'Not found' });
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json({ ok: true, data: banner });
  } catch (err) { next(err); }
};
