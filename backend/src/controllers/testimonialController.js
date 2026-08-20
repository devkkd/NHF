import Testimonial from '../models/Testimonial.js';

// ── Public ───────────────────────────────────────────────────
export const getActiveTestimonials = async (req, res, next) => {
  try {
    const items = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ ok: true, data: items });
  } catch (err) { next(err); }
};

// ── Admin ────────────────────────────────────────────────────
export const getAllTestimonials = async (req, res, next) => {
  try {
    const items = await Testimonial.find().sort({ order: 1, createdAt: 1 });
    res.json({ ok: true, data: items });
  } catch (err) { next(err); }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const { quote, name, location, isActive, order } = req.body;
    if (!quote || !name) return res.status(400).json({ ok: false, error: 'quote and name are required' });
    const item = await Testimonial.create({ quote, name, location, isActive, order });
    res.status(201).json({ ok: true, data: item });
  } catch (err) { next(err); }
};

export const updateTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, data: item });
  } catch (err) { next(err); }
};

export const deleteTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

export const toggleTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ ok: false, error: 'Not found' });
    item.isActive = !item.isActive;
    await item.save();
    res.json({ ok: true, data: item });
  } catch (err) { next(err); }
};
