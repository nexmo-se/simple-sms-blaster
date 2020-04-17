require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const helmet = require('helmet');
const multer = require('multer');
const axios = require('axios');

const csvService = require('./services/csv');
const smsService = require('./services/sms');
const rateLimiterService = require('./services/rateLimiter');

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage }).single('file');

const port = process.env.PORT || 8080;
const apiKey = process.env.API_KEY;
const apiSecret = process.env.API_SECRET;
const senderId = process.env.SENDER_ID;
const tps = parseInt(process.env.TPS || '40', 10);
const csvFromLine = parseInt(process.env.CSV_SKIP_LINES || '0', 10) + 1;

const rateLimitAxios = rateLimiterService.newInstance(tps);


// Always use UTC Timezone
process.env.TZ = 'Etc/UTC';
const requestMaxSize = '150mb';

const app = express();

app.set('trust proxy', true);
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: requestMaxSize }));
app.use(bodyParser.json({ limit: requestMaxSize }));

app.get('/', (_, res) => res.send('Hello world'));
app.get('/success', (_, res) => res.send('You have successfully deployed the Simple SMS Blaster'));

app.post('/blast', (req, res) => {
  const { records, offset = 0, limit = tps } = req.body;

  res.send('ok');

  if (offset > records.length) {
    // Done
    console.log('Done');
    return;
  }

  const end = Math.min(offset + limit, records.length);
  for (let i = offset; i < end; i += 1) {
    // Add to queue
    const record = records[i];
    const to = record[0];
    const text = record[1];
    smsService.sendSms(senderId, to, text, apiKey, apiSecret, rateLimitAxios);
  }

  console.log(`Blast Limit: ${limit}, Offset ${offset}`);
  setTimeout(() => axios.post(`http://localhost:${port}/blast`, {
    records,
    offset: offset + limit,
    limit,
  }, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  }), 1000);
});

app.post('/upload', upload, (req, res) => {
  // Data will be in req.file.buffer
  const dataBuffer = req.file.buffer;
  const dataString = dataBuffer.toString('utf8');

  res.send('ok');

  const options = { from_line: csvFromLine };
  const recordList = csvService.fromCsvSync(dataString, options);
  setImmediate(() => axios.post(`http://localhost:${port}/blast`, {
    records: recordList,
    offset: 0,
    limit: tps,
  }, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  }));
});

app.use((err, req, res) => {
  console.error(err);
  res.status(500).send();
});

const httpServer = http.createServer(app);

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
