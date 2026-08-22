const express = require("express");
const {
  getServiceCities,
  getServiceCityOverride,
  upsertServiceCityOverride,
  deleteServiceCityOverride,
  getAllServiceCityOverrides
} = require("../controllers/serviceCityController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public - used by Next.js frontend, routing, and sitemap generation
router.get("/all-overrides", getAllServiceCityOverrides);
router.get("/:serviceKey/cities", getServiceCities);
router.get("/:serviceKey/cities/:cityKey", getServiceCityOverride);

// Protected - admin dashboard save & delete operations
router.put("/:serviceKey/cities/:cityKey", protect, upsertServiceCityOverride);
router.delete("/:serviceKey/cities/:cityKey", protect, deleteServiceCityOverride);

module.exports = router;
