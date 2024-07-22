import express from "express";
import cors from "cors";
import internalOps from "./routes/internalOps.js";
import signUp from "./routes/signUp.js";
import login from "./routes/login.js";
import messaging from "./routes/messaging.js";
import updateInfo from "./routes/updateInfo.js";
import getInfo from "./routes/getInfo.js";
import nextUser from "./routes/nextUser.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(internalOps);
app.use(login);
app.use(signUp);
app.use(messaging);
app.use(updateInfo);
app.use(getInfo);
app.use(nextUser);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
