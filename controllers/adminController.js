const { generateToken } = require("../middleware/auth");
const Admin = require("../model/adminModel");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ errMsg: "Admin not found" });
    }

    if (password !== admin.password) {
      return res.status(401).json({ errMsg: "Password didn't match" });
    }

    const token = generateToken(admin._id, "admin");
    res.status(200).json({
      message: "Login Successful",
      name: admin?.name,
      permissions: admin?.permissions,
      role: admin?.role,
      token,
      id: admin._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Something Went Wrong" });
  }
};

const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Admin.findOne({ email, role: "employee" });

    if (!employee) {
      return res.status(401).json({ errMsg: "Employee not found" });
    }

    if (password !== employee.password) {
      return res.status(401).json({ errMsg: "Password didn't match" });
    }

    const token = generateToken(employee._id, "employee");
    res.status(200).json({
      message: "Login Successful",
      name: employee?.name,
      token,
      role: "employee",
      id: employee._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Something Went Wrong" });
  }
};

const addEmployee = async (req, res) => {
  try {
    const { email, password, name, role, permissions } = req.body;
    const newEmployee = await Admin.create({
      email,
      password,
      name,
      role,
      permissions,
    });

    res.status(201).json({
      message: "Employee added successfully",
      id: newEmployee._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ errMsg: "Something Went Wrong" });
  }
};

module.exports = {
  adminLogin,
  employeeLogin,
  addEmployee,
};
