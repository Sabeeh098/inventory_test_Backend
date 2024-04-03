const express = require("express");

const cors = require("cors");

const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");

const dbConnect = require("./database/database");
const mainRoutes = require("./routes/mainRoutes");
require("dotenv").config();

const app = express();

app.use('/barcodes', express.static('barcodes'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

dbConnect();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use("/",mainRoutes);

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);

});