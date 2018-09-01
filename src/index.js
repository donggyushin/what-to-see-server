import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";
const app = express();

let port = 8080;
//static file, folder

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//router
app.use("/api", routes);

app.listen(port, () => {
  console.log("what-to-see-server listening at ", port);
});
