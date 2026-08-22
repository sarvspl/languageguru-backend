const express = require("express");
const {
  getLanguageCities,
  getLanguageCityOverride,
  upsertLanguageCityOverride,
  deleteLanguageCityOverride,
  getAllLanguageCityOverrides
} = require("../controllers/languageCityController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public — used by Next.js frontend, routing, and sitemap generation
router.get("/all-overrides", getAllLanguageCityOverrides);
router.get("/:languageKey/cities", getLanguageCities);
router.get("/:languageKey/cities/:cityKey", getLanguageCityOverride);

// Protected — admin dashboard save & delete operations
router.put("/:languageKey/cities/:cityKey", protect, upsertLanguageCityOverride);
router.delete("/:languageKey/cities/:cityKey", protect, deleteLanguageCityOverride);

module.exports = router;
