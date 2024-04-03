const express = require("express");
const adminController = require("../controllers/adminController");
const loadController = require("../controllers/loadController");
const userController = require("../controllers/userController");
const mainRoutes = express.Router();



mainRoutes.post("/login", adminController.adminLogin);
mainRoutes.post("/admin/addEmployee", adminController.addEmployee);

mainRoutes.post("/addCategory",loadController.addCategory)
mainRoutes.get('/categories',loadController.getAllCategories)
mainRoutes.delete('/categories/:id',loadController.deleteCat)
mainRoutes.post("/categories/:id",loadController.editCategory)
mainRoutes.post('/fetchReportByCategory',loadController.fetchByCategory);
mainRoutes.post('/fetchReportByLoadNumber',loadController.fetchByLoadNumber);
mainRoutes.post('/fetchReportBySku',loadController.fetchBySKU);
mainRoutes.post('/fetchReportByBrand',loadController.fetchByBrand);

  mainRoutes.post("/deleteSelectedCategories",loadController.deleteSelectedCategories)
mainRoutes.post("/addloads", loadController.createLoad);
mainRoutes.get("/getloads", loadController.getLoads);
mainRoutes.delete('/loads/:loadId' ,loadController.deleteLoadById );
mainRoutes.delete('/loads', loadController.deleteLoads)
mainRoutes.get('/getLoadDetailsById/:id', loadController.getLoadDetailsById);
mainRoutes.get('/getBarcodeImage/:id', loadController.getBarcodeImageById);

mainRoutes.get('/getLoadDetailsBySkuCode/:skuCode', loadController.getLoadDetailsBySkuCode);
mainRoutes.get('/getBrandDetailsBySkuCode/:skuCode', loadController.getBrandDetailsBySkuCode);

mainRoutes.patch('/updateRemainingPalletsCount/:id', loadController.updateRemainingPalletsCount);
mainRoutes.post('/updateUsedLoad', loadController.updateUsedLoads);

mainRoutes.get("/fetchPurschaseOrder",loadController.fetchUsedLoadsInfo)
mainRoutes.get("/fetchWeekly",loadController.fetchWeeklyData)
mainRoutes.get("/dailyData",loadController.fetchDailyData)
mainRoutes.get("/monthlyData",loadController.fetchMonthlyData)  
mainRoutes.get("/yearlyData",loadController.fetchYearlyData)
mainRoutes.post("/fetchDataForDateRange",loadController.fetchDataByDateRange)
mainRoutes.get("/recentLoad",loadController.recentLoadFetch)

mainRoutes.get('/totalLoads', loadController.getTotalLoadsCount);
mainRoutes.get("/totalPallets",loadController.getTotalPallets)
mainRoutes.get("/totalRemainingPallets",loadController.getRemainingPallets);
mainRoutes.get("/totalLoadCost",loadController.getTotalLoadsCost);
mainRoutes.get("/getNotifications",loadController.getLoadsLessThanOrEqualTo5)

mainRoutes.get('/employeeAdmins', userController.fetchEmployeeAdmins);
mainRoutes.patch('/editEmployee/:id', userController.editEmployee);
mainRoutes.delete('/deleteEmployee/:id', userController.deleteEmployee);
mainRoutes.get("/fetchAdminAndEmployee",userController.fetchAdminAndEmployeeCounts)

module.exports = mainRoutes;
