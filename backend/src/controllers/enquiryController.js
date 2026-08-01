import Enquiry from "../models/Enquiry.js";
import Product from "../models/Product.js";
import sendMail from "../utils/sendMail.js";
import enquiryCustomerTemplate from "../templates/enquiryCustomerTemplate.js";
import enquiryAdminTemplate from "../templates/enquiryAdminTemplate.js";

/* ==========================================
   CREATE ENQUIRY
========================================== */

export const createEnquiry = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      mobile,
      companyName,
      country,
      businessTypes = [],
      productCategory,
      productSubCategory,
      message,
      slug,
    } = req.body;

    let enquiryType = "bulk";
    let product = null;
    let productSnapshot = null;

    // ==========================
    // PRODUCT ENQUIRY
    // ==========================

   if (slug) {
  product = await Product.findOne({ slug });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  enquiryType = "product";

  productSnapshot = {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    image: product.mainImage || product.image,
  };
}

    // ==========================
    // SAVE ENQUIRY
    // ==========================

    const enquiry = await Enquiry.create({
      type: enquiryType,

      fullName,
      email,
      mobile,
      companyName,
      country,
      businessTypes,
      productCategory,
      productSubCategory,
      message,

      product: product?._id || null,
      productSnapshot,
    });

    // ==========================
    // SEND EMAILS
    // ==========================

    try {
      // CUSTOMER EMAIL
 await sendMail({
  to: enquiry.email,
  subject: "Enquiry Received | Nikita Home Furnishings",
  html: enquiryCustomerTemplate({
    enquiry,
    productSnapshot,
  }),
});

await sendMail({
  to: process.env.ADMIN_EMAIL,
  subject:
    enquiry.type === "product"
      ? "New Product Enquiry"
      : "New Bulk Enquiry",
  html: enquiryAdminTemplate({
    enquiry,
    productSnapshot,
  }),
});
    } catch (mailError) {
      console.error("Enquiry mail error:", mailError);
    }

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiry,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================
   GET ALL ENQUIRIES
========================================== */

export const getAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find()
     .populate(
   "product",
   "name slug sku mainImage image"
)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      enquiries,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================
   GET SINGLE ENQUIRY
========================================== */

export const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate(
      "product",
      "name slug sku image mainImage"
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      enquiry,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================
   UPDATE STATUS
========================================== */

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    enquiry.status = req.body.status || enquiry.status;
    enquiry.adminNotes = req.body.adminNotes || enquiry.adminNotes;

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully.",
      enquiry,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================
   DELETE ENQUIRY
========================================== */

export const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    await enquiry.deleteOne();

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};