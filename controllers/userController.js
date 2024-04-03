const AdminModel = require("../model/adminModel");

const fetchEmployeeAdmins = async (req, res) => {
  try {
    const employeeAdmins = await AdminModel.find({ role: "employee" });

    res.status(200).json({
      message: "Employee admins fetched successfully",
      employeeAdmins,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errMsg: "Something Went Wrong" });
  }
};

const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, req.params, "params");
    const { name, email, role, permissions } = req.body;
    console.log(req.body, "Body");
    // Validate inputs if needed

    const updatedEmployee = await AdminModel.findByIdAndUpdate(
      id,
      { name, email, role, permissions },
      { new: true } // Returns the updated document
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error editing employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the employee exists before attempting to delete
    const existingEmployee = await AdminModel.findById(id);
    if (!existingEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await AdminModel.findByIdAndDelete(id);

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const fetchAdminAndEmployeeCounts = async (req, res) => {
  try {
    const adminCount = await AdminModel.countDocuments({ role: "admin" });
    const employeeCount = await AdminModel.countDocuments({ role: "employee" });

    res.status(200).json({
      message: "Admin and employee counts fetched successfully",
      adminCount,
      employeeCount,
    });
    console.log(adminCount,employeeCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errMsg: "Something Went Wrong" });
  }
};

module.exports = {
  fetchEmployeeAdmins,
  editEmployee,
  deleteEmployee,
  fetchAdminAndEmployeeCounts,
};
