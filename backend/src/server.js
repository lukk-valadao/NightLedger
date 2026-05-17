import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 NightLedger Server running on port ${PORT}`);
  console.log(`📅 Date: ${new Date().toLocaleString()}`);
  console.log(`=================================`);
});
