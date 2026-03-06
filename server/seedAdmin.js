const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Admin.create({
      email: "admin@animeforge.com",
      password: "123456",
    });

    console.log("Admin created successfully");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
