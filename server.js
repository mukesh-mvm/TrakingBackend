import express from 'express';
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cors from 'cors'


import userRoutes from './routes/userRoutes.js';
import advertiserRoutes from "./routes/advertiserRoutes.js";
import affiliateRoutes from './routes/affiliateRoutes.js';
import compaignRoutes from "./routes/compaignRoutes.js";
import clickRoutes from './routes/click.js';
import conversionRoutes from './routes/conversionRoutes.js';
import campaignReportRoutes from './routes/reportRoutes.js';

const app = express();
dotenv.config();
connectDB();

const PORT =process.env.PORT || 5000;





const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5173/",
  "https://tops-admin-panel.vercel.app",
  "http://localhost:3000",
  "https://top5shots-2kuz.vercel.app/",
  "https://top5shots-2kuz.vercel.app",
  "http://82.25.109.68:3000/",
  "http://82.25.109.68:3000",
  "http://top5shots.com",
  "http://top5shots.com/",
  "https://top5shots.com/",
  "https://top5shots.com",
  "https://www.top5shots.com/",
  "https://www.top5shots.com",
  "https://mvmtracking.com/",
  "https://mvmtracking.com"
]);

// CORS middleware setup

/*
app.use(
  cors({
    origin: (origin, callback) => {
      // If origin is undefined (like Postman or curl), allow it
      
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        // console.log("Origin:", origin);
      } else {
        console.warn("Blocked CORS request from:", origin);
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true, // Allows cookies and session headers
  })
);

*/

app.use(
  cors({
    origin: "*", // Allow all domains
    credentials: true, // If you don’t need cookies/auth headers, remove this
  })
);

app.use(express.json());
app.use('/api/users', userRoutes);
app.use("/api/advertisers", advertiserRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use("/api/compaigns", compaignRoutes);
app.use('/api/clicks', clickRoutes);
app.use('/api/conversion', conversionRoutes);
app.use('/api/reports', campaignReportRoutes);


app.get('/', (req, res) => {
  res.send('<h1>Welcome to the tracking panel</h1>');
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
