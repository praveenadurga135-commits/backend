const express = require("express");
const router = express.Router();
const c=require("../controllers/productController");

router.get("", c.getProducts);

router.get("/:id", c.getProduct);

router.post("", c.createProduct);

router.put("/:id", c.updateProduct);

router.delete("/:id", c.deleteProduct);

module.exports = router;