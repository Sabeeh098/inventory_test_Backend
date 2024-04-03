const Category = require("../model/categoryModel");
const Load = require("../model/loadModel");
const UsedLoads = require("../model/usedPallet");

const fs = require("fs");
const path = require("path");

const deleteLoadById = async (req, res) => {
  const loadId = req.params.loadId;
  try {
    // Find the load by ID and delete it
    await Load.findByIdAndDelete(loadId);
    res.status(200).json({ message: 'Load deleted successfully' });
  } catch (error) {
    console.error('Error deleting load:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteLoads = async (req, res) => {
  const { loadIds } = req.body;

  try {
    await Load.deleteMany({ _id: { $in: loadIds } });
    res.status(200).json({ message: 'Loads deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete loads', details: error });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ _id: -1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required for category' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const category = new Category({ name });
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCat = async (req,res) => {
  try {
    const categoryId = req.params.id;
    // Check if the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // If the category exists, delete it
    await Category.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


const deleteSelectedCategories = async (req, res) => {
  const { categoryIds } = req.body;
  console.log(req.body,"Categories Ids");
  try {
   
    await Category.deleteMany({ _id: { $in: categoryIds } });
    res.status(200).json({ message: 'Selected categories deleted successfully' });
  } catch (error) {
    console.error('Error deleting categories:', error);
    res.status(500).json({ error: 'An error occurred while deleting categories' });
  }
};


const editCategory = async(req,res) => { 
  try {
    const { id } = req.params;
    const { name } = req.body;
    console.log(req.params,req.body);

    // Check if category exists
    const category = await Category.findByIdAndUpdate(id, { name }, { new: true });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


const createLoad = async (req, res) => {
  try {
    const {
      load: {
        loadNumber,
        loadCost,
        palletsCount,
        perPalletCost,
        category,
        loadDate,
        skuCode,
        brands,
        barcodeImage,
      },
    } = req.body;

    const newLoad = new Load({
      loadNumber,
      skuNumber: skuCode,
      loadCost,
      palletsCount,
      perPalletCost,
      category,
      loadDate,
      brands,
      barcodeImage,
    });

    // Save the new Load instance to the database
    await newLoad.save();

    console.log(newLoad, "Load created");
    res.status(201).json(newLoad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getLoads = async (req, res) => {
  try {
    const { type } = req.query;
    let loads = null;
    if (type == "indicators") {
      loads = await Load.find().populate('category'); // Populate the category field
    } else if (type == "scans") {
      loads = await Load.find({
        $expr: { $ne: ["$palletsCount", "$remainingPalletsCount"] },
      }).populate('category'); // Populate the category field
    } else {
      loads = await Load.find().populate('category'); // Populate the category field
    }
    res.json(loads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


const getLoadDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve load details from the database based on the load ID
    const loadDetails = await Load.findById(id).populate('category');

    if (loadDetails) {
      res.json({
        loadNumber: loadDetails.loadNumber,
        skuNumber: loadDetails.skuNumber,
        loadCost: loadDetails.loadCost,
        palletsCount: loadDetails.palletsCount,
        perPalletCost: loadDetails.perPalletCost,
        category: loadDetails.category,
        loadDate: loadDetails.loadDate,
        barcodeImage: loadDetails.barcodeImage,
        brands: loadDetails.brands,
      });
    } else {
      res.status(404).json({ message: "Load not found" });
    }
  } catch (error) {
    console.error("Error fetching load details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getBarcodeImageById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const loadDetails = await Load.findById(id);

    if (!loadDetails) {
      return res.status(404).json({ message: "Load not found" });
    }

    const barcodeImagePath = path.join(
      __dirname,
      "..",
      "barcodes",
      `${loadDetails.loadNumber}_barcode.svg`
    );

    // Check if the file exists
    if (fs.existsSync(barcodeImagePath)) {
      // Read the file and send it as a response
      const barcodeImage = fs.readFileSync(barcodeImagePath);
      res.writeHead(200, { "Content-Type": "image/svg+xml" });
      res.end(barcodeImage, "binary");
    } else {
      res.status(404).json({ message: "Barcode image not found" });
    }
  } catch (error) {
    console.error("Error fetching barcode image:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getLoadDetailsBySkuCode = async (req, res) => {
  try {
    const { skuCode } = req.params;

    // Retrieve load details from the database based on the SKU code
    const loadDetails = await Load.findOne({ skuNumber: skuCode });

    if (loadDetails) {
      res.json(loadDetails);
    } else {
      res
        .status(404)
        .json({ message: "Load not found for SKU code: " + skuCode });
    }
  } catch (error) {
    console.error("Error fetching load details by SKU code:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getBrandDetailsBySkuCode = async (req, res) => {
  try {
    const { skuCode } = req.params;

    // Retrieve brand details from the database based on the SKU code
    const brandDetails = await Load.findOne({ "brands.skuCode": skuCode }).populate('category');

    if (brandDetails) {
      res.json(brandDetails.brands[0]); // Assuming there is only one brand per SKU for simplicity
    } else {
      res
        .status(404)
        .json({ message: "Brand not found for SKU code: " + skuCode });
    }
  } catch (error) {
    console.error("Error fetching brand details by SKU code:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateRemainingPalletsCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { remainingPalletsCount } = req.body;
    await Load.findByIdAndUpdate(id, {
      remainingPalletsCount: remainingPalletsCount,
    });
    res
      .status(200)
      .json({ message: "Remaining pallets count updated successfully" });
  } catch (error) {
    console.error("Error updating remaining pallets count:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const updateUsedLoads = async (req, res) => {
  try {
    const { load, usedPalletsCount, remainingPalletsCount } = req.body;
    // Retrieve the load information to get the per pallet cost
    const loadInfo = await Load.findById(load);
    if (!loadInfo) {
      return res.status(404).json({ message: "Load not found" });
    }

    // Calculate total cost
    const totalCost = loadInfo.perPalletCost * usedPalletsCount;

    // Update Loads remainingPalletsCount
    await Load.findByIdAndUpdate(load, {
      remainingPalletsCount: remainingPalletsCount + usedPalletsCount,
    });

    // Add new used Pallet
    const newUsedLoad = new UsedLoads({
      load,
      palletsOut: usedPalletsCount,
      total: totalCost, // Set the total cost
    });
    await newUsedLoad.save();
    res.status(201).json(newUsedLoad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const fetchUsedLoadsInfo = async (req, res) => {
  try {
    // Extract search term from the query parameter
    const searchTerm = req.query.searchTerm || "";

    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $lookup: {
          from: "categories", // Assuming your Category model is named 'Category'
          localField: "loadDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          category: {
            $arrayElemAt: ["$categoryDetails.categoryName", 0], // Assuming your category field is named 'categoryName'
          },
        },
      },
      {
        $match: {
          $or: [
            { loadNumber: { $regex: searchTerm, $options: "i" } },
            // Add more fields to search as needed
          ],
        },
      },
    ]);

    // Send the result as a JSON response
    res.json(result);
    console.log(result);
  } catch (error) {
    console.error("Error fetching used loads information:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



const fetchByCategory = async (req, res) => {
  const categoryId = req.body.categoryId;
console.log(req.body.categoryId,"id");
  try {
    // Find the category by its ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch used loads that have the specified category
    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $lookup: {
          from: "categories", 
          localField: "loadDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $match: {
          "categoryDetails._id": category._id
        }
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          category: "$categoryDetails.name",
          total: "$total" 
        },
      },
    ]);

    console.log(result, "result");
    res.json(result);

  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchByLoadNumber = async (req, res) => {
  const loadNumber = req.body.loadNumber; // Extracting load number from the request body
  console.log(loadNumber, "loadNumber"); // Logging the load number

  try {
    // Fetch used loads that have the specified load number
    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $match: {
          "loadDetails.loadNumber": loadNumber 
        }
      },
      {
        $lookup: {
          from: "categories", 
          localField: "loadDetails.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          category: "$categoryDetails.name",
          total: "$total" 
        },
      },
    ]);

    console.log(result, "result");
    res.json(result);

  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const fetchBySKU = async (req, res) => {
  const sku = req.body.sku; // Extracting SKU (skuCode or skuNumber) from the request body
  console.log(sku, "sku"); // Logging the SKU

  try {
    // Fetch used loads that have at least one load with the specified SKU
    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $match: {
          $or: [
            { "loadDetails.brands.skuCode": sku },
            { "loadDetails.skuNumber": sku }
          ]
        }
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          category: "$loadDetails.category",
          total: "$total" 
        },
      },
    ]);

    console.log(result, "result");
    res.json(result);

  } catch (error) {
    console.error('Error fetching report data by SKU:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const fetchByBrand = async (req, res) => {
  const brandName = req.body.brand; // Extracting brand name from the request body
  console.log(brandName, "brandName"); // Logging the brand name

  try {
    // Fetch used loads that have at least one load with the specified brand name
    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $match: {
          "loadDetails.brands.brandName": brandName 
        }
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          category: "$loadDetails.category",
          total: "$total" 
        },
      },
    ]);

    console.log(result, "result");
    res.json(result);

  } catch (error) {
    console.error('Error fetching report data by brand name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


/////////////Reportsss //////////////

const fetchWeeklyData = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    // Set the time to the beginning of the current day
    currentDate.setHours(0, 0, 0, 0);

    // Calculate the date of the beginning of the week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    // Calculate the date of the end of the week (Saturday)
    const endOfWeek = new Date(currentDate);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          total: "$total" 
        },
      },
      // Filter data for the current week
      {
        $match: {
          addedAt: {
            $gte: startOfWeek, 
            $lte: endOfWeek
          }
        }
      }
    ]);

    res.json(result);
    // console.log(result,"Weekly");
  } catch (error) {
    console.error("Error fetching weekly data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const fetchDailyData = async (req, res) => {
  try {
    // Get the current date
    const currentDate = new Date();
    // Set the time to the beginning of the current day
    currentDate.setHours(0, 0, 0, 0);

    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          total: "$total" ,
        },
      },
      // Filter data for the current day
      {
        $match: {
          addedAt: {
            $gte: currentDate, // Greater than or equal to the beginning of the current day
            $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000) // Less than the beginning of the next day
          }
        }
      }
    ]);

   
    res.json(result);
    // console.log(result,"Result daily");
  } catch (error) {
    console.error("Error fetching daily data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchMonthlyData = async (req, res) => {
  try {
    console.log("Is it coming?");
    // Get the current date
    const currentDate = new Date();
    // Get the first day of the current month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // Get the last day of the current month
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          total: "$total" 
        },
      },
      // Filter data for the current month
      {
        $match: {
          addedAt: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth
          }
        }
      }
    ]);

    // Send the result as a JSON response
    res.json(result);
    console.log(result,"Monthly Data");
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchYearlyData = async (req, res) => {
  try {
    console.log("object");
    // Get the current date
    const currentDate = new Date();

    // Set start date to January 1st of the current year and end date to December 31st of the current year
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const endDate = new Date(currentDate.getFullYear(), 11, 31);

    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          total: "$total" 
        },
      },
      // Filter data for the current year
      {
        $match: {
          addedAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      }
    ]);

    // Send the result as a JSON response
    console.log("result",result)
    res.json(result);
    

  } catch (error) {
    console.error("Error fetching yearly data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const fetchDataByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

  
    console.log("Request body:", req.body); // Log the request body

    // Fetch data from the database based on the provided date range
    const result = await UsedLoads.aggregate([
      {
        $lookup: {
          from: "loads",
          localField: "load",
          foreignField: "_id",
          as: "loadDetails",
        },
      },
      {
        $unwind: "$loadDetails",
      },
      {
        $project: {
          loadNumber: "$loadDetails.loadNumber",
          loadCost: "$loadDetails.loadCost",
          palletsOut: 1,
          addedAt: 1,
          palletsCount: "$loadDetails.palletsCount",
          perPalletCost: "$loadDetails.perPalletCost",
          total: "$total" 
        },
      },
      // Filter data for the provided date range
      {
        $match: {
          addedAt: {
            $gte: new Date(startDate), // Ensure startDate is treated as UTC
            $lte: new Date(endDate) // Ensure endDate is treated as UTC
          }
        }
      }
    ]);

    console.log("Data by date range:", result); // Log the data fetched from the database
    res.json(result);
  } catch (error) {
    console.error("Error fetching data by date range:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const recentLoadFetch = async(req, res) => {
  try {
   
    const recentLoads = await Load.find().sort({ loadDate: -1 }).limit(10).populate('category');

    res.status(200).json(recentLoads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred while fetching recent loads." });
  }
};

const getTotalLoadsCount = async (req, res) => {
  try {
    const totalLoadsCount = await Load.countDocuments();
  
    res.status(200).json({ totalLoadsCount });
  } catch (error) {
    console.error('Error getting total loads count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getTotalLoadsCost = async (req, res) => {
  try {
    const totalLoadsCost = await Load.aggregate([
      {
        $group: {
          _id: null,
          totalLoadCost: { $sum: '$loadCost' },
        },
      },
    ]);

  
    const result = totalLoadsCost.length > 0 ? totalLoadsCost[0].totalLoadCost : 0;

    res.status(200).json({ totalLoadCost: result });
  
  } catch (error) {
    console.error('Error getting total loads cost:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getTotalPallets = async (req, res) => {
  try {
    const loads = await Load.find();

    const totalPallets = loads.reduce((acc, load) => {
      const loadPallets = load.isBrand
        ? load.brands.reduce((brandAcc, brand) => brandAcc + brand.totalPallet, 0)
        : load.palletsCount;

      return acc + loadPallets;
    }, 0);

    res.json({ totalPallets });

  } catch (error) {
    console.error("Error fetching total pallets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getRemainingPallets = async (req, res) => {
  try {

    const result = await Load.aggregate([
      {
        $group: {
          _id: null,
          totalRemainingPallets: { $sum: '$remainingPalletsCount' },
        },
      },
    ]);


    const totalRemainingPallets = result.length > 0 ? result[0].totalRemainingPallets : 0;

    return res.json({ totalRemainingPallets });
  } catch (error) {
    console.error('Error fetching remaining pallets:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getLoadsLessThanOrEqualTo5 = async (req, res) => {
  try {
    const loads = await Load.find({
      $or: [
        { palletsCount: { $lte: 5 } },
        { remainingPalletsCount: { $lte: 5 } },
      ],
    }).populate('category');

   
    res.json(loads);
  } catch (error) {
    console.error('Error fetching loads less than or equal to 5:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports = {
  deleteLoadById,
  deleteLoads,
  getAllCategories,
  addCategory,
  deleteCat,
  editCategory,
  deleteSelectedCategories,
  createLoad,
  getLoads,
  getLoadDetailsById,
  getBarcodeImageById,
  getLoadDetailsBySkuCode,
  getBrandDetailsBySkuCode,
  updateRemainingPalletsCount,
  updateUsedLoads,
  fetchUsedLoadsInfo,
  fetchDailyData,
  fetchWeeklyData,
  fetchByCategory,
  fetchByLoadNumber,
  fetchBySKU,
  fetchByBrand,
  fetchMonthlyData,
  fetchYearlyData,
  fetchDataByDateRange,
  recentLoadFetch,
  getTotalLoadsCount,
  getTotalPallets,
  getRemainingPallets,
  getTotalLoadsCost,
  getLoadsLessThanOrEqualTo5,
};
