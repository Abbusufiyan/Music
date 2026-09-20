const app = require('./src/app');
const dotenv = require('dotenv');

dotenv.config({ path: require('path').join(__dirname, '.env') });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
