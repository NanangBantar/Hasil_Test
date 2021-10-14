const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// testing variable
// const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();
connectDB();

app.use(express.json({
    extended: false
}));
// testing variable
// app.use(cookieParser('curent_folder'));

// user and auth management 
app.use("/", require("./routes/api/user"));
app.use("/users/create", require("./routes/api/user"));
app.get("/logout", require("./routes/api/user"));

// folder management
app.use("/document-service/folder", require("./routes/api/folder"));
app.use("/document-service/folder/:id", require("./routes/api/folder"));
app.use("/document-service/folder/:folder_id", require("./routes/api/folder"));

// document management
app.use("/document-service/document", require("./routes/api/document"));
app.use("/document-service/document/:document_id", require("./routes/api/document"));

// all data management
app.use("/document-service/", require("./routes/api/getalldata"));

//testing route
// app.get("/test", (req, res) => {
//     // console.log(req.signedCookies);
//     res.send("Testing");
// });

app.listen(process.env.PORT, () => {
    console.log(`Server Running At PORT ${process.env.PORT}`);
});