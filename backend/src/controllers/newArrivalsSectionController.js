import NewArrivalsSection from '../models/NewArrivalsSection.js';

const DEFAULTS = {
  heading: 'A HOME IS A FEELING,\nWE HELP YOU BUILD IT.',
  paragraph: `The morning light through a window. The weight of a good quilt. The quiet ritual of a bed made beautifully. A scarf chosen not because it was convenient but because it felt exactly right. These are the small, significant details that separate a house from a home and a life from a lifestyle. At Nikita, we make the things that fill those moments.`,
  cardImage: '/images/product/new2.png',
  cardTitle: 'HAND BLOCK PERCALE PRINTED BEDSHEET',
  bigImage: '/images/product/new1.png',
  isActive: true,
};

// ── Public — get active section content ─────────────────────
export const getNewArrivalsSection = async (req, res, next) => {
  try {
    let doc = await NewArrivalsSection.findOne({ isActive: true });
    if (!doc) doc = DEFAULTS; // return defaults if nothing configured yet
    res.json({ ok: true, data: doc });
  } catch (err) { next(err); }
};

// ── Admin ────────────────────────────────────────────────────
export const getNewArrivalsSectionAdmin = async (req, res, next) => {
  try {
    let doc = await NewArrivalsSection.findOne();
    if (!doc) doc = await NewArrivalsSection.create(DEFAULTS);
    res.json({ ok: true, data: doc });
  } catch (err) { next(err); }
};

export const upsertNewArrivalsSection = async (req, res, next) => {
  try {
    const { heading, paragraph, cardImage, cardTitle, bigImage, isActive } = req.body;
    let doc = await NewArrivalsSection.findOne();
    if (doc) {
      Object.assign(doc, { heading, paragraph, cardImage, cardTitle, bigImage, isActive });
      await doc.save();
    } else {
      doc = await NewArrivalsSection.create({ heading, paragraph, cardImage, cardTitle, bigImage, isActive });
    }
    res.json({ ok: true, data: doc });
  } catch (err) { next(err); }
};
