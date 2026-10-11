const Product = require("../models/product");

exports.getProducts=async (req, res,next) => {
    try{
        const { search , inStock,minPrice,maxPrice,sort }=req.query;
        const page=Math.max(Number(req.query.page) || 1,1);
        const limit=Math.min(Math.max(Number(req.query.limit) || 5,1),5);
        const filter={};
        if(search){
            const safe=search.replace(/[.*+?^${}|[\]\\]/g,"\\$&");
            filter.name = {
                $regex: safe, $options: "i"
            };
        }
        if(inStock){
            filter.inStock= inStock === "true";
        }
        if(minPrice || maxPrice){
            filter.price={};
            if(minPrice) filter.price.$gte=Number(minPrice);
            if(maxPrice) filter.price.$lte=Number(maxPrice);
        }
        console.log(filter);
        const total= await Product.countDocuments(filter);
        const products=await Product.find(filter)
                                    .sort(sort || "-createdAt")
                                    .skip((page-1)*limit)
                                    .limit(limit);
        res.json({
            total,page,pages: Math.ceil(total/limit),products,
        });
    } catch(err) {
        next(err);
    }
}

exports.getProduct=async (req, res,next) => {
    try{
        const id = req.params.id;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            name: product.name,
            price: product.price
        });
    } catch(err){
        next(err);
    }
}
exports.getMyProducts = async (req,res,next) => {
    try {
        const products = await Product.find({ createdBy: req.user.id });
        res.status(200).json(products);
    } catch(err){
        next(err);
    }
}

exports.createProduct=async (req, res,next) => {
    try{
        const {name, price} = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name not found"
            })
        }

        if (!price) {
             return res.status(400).json({
            message: "price not found"
            })
    }

    const product = await Product.create({
        ...req.body,
        createdBy: req.user.id
    });
    return res.status(201).json(product);
    } catch(err) {
        next(err);
    }
}

exports.updateProduct=async (req, res,next) => {
    try{
        const id = req.params.id;
        const product = await Product.findByIdAndUpdate(id);
        if (!product) {
                return res.status(404).json({
                message: "Product not found"
            });
        }
        if(String(product.createdBy)!==req.user.id){
            return res.status(403).json({
                message: "You can only change your own products"
            });
        }
        delete req.body.createdBy;
        const updated = await Product.findByIdAndUpdate(id,req.body,{
            returnDocument: "after",runValidators: true
        });
        res.status(200).json(updated);
    } catch(err){
        next(err);
    }
}

exports.deleteProduct=async (req, res,next) => {
    try{ 
        const id = req.params.id;
        const product = await Product.findByIdAndDelete(id);
        if(!product){
            res.status(200).json({
                message: "Product deleted successfully"
            });
        }
        if (String(product.createdBy) !== req.user.id) {
            return res.status(401).json({
                message: "u cant' delete other products"
            });
        }
        
        await product.deleteOne();
        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch(err) {
        next(err);
    }
}