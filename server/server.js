const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 7987;
const cors = require('cors');
const ConnectDB = require('./Config/DataBase');
const cookieParser = require('cookie-parser');
const Router = require('./Router/Routes');
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { saveVendorLastLocation, fetchVendorFromDB } = require('./Utils/Location');

// DB connection
ConnectDB();

// Create HTTP server (required for socket.io)
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust if needed for security
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow mobile apps / curl
      return callback(null, true);
    },
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many Request',
  statusCode: 429,
  handler: async (req, res, next) => {
    try {
      next();
    } catch (error) {
      res.status(options.statusCode).send(options.message);
    }
  },
});

app.use('/public', express.static('public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/successfull-payment-app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(limiter);
app.use('/api/v1', Router);

app.get('/', (req, res) => {
  res.send('Welcome To Blueace Server');
});

// Simple in-memory cache with TTL
const vendorCache = new Map(); // vendorId -> { vendorData, expiresAt }
const vendorSocketMap = new Map(); // socketId -> vendorId
const vendorLastLocation = new Map(); // vendorId -> lastLocation

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function getVendorCached(vendorId) {
  const rec = vendorCache.get(vendorId);
  const now = Date.now();
  if (rec && rec.expiresAt > now) return rec.vendorData;
  // fetch from DB once, then cache
  const vendorData = await fetchVendorFromDB(vendorId);
  if (vendorData) {
    vendorCache.set(vendorId, { vendorData, expiresAt: now + CACHE_TTL_MS });
  }
  return vendorData;
}

// Admin clients will join 'admins' room and receive updates
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  // Admin registers as admin
  socket.on('admin:join', () => {
    socket.join('admins');
    // Optionally send current last locations to admin
    const snapshot = [];
    for (const [vendorId, loc] of vendorLastLocation.entries()) {
      snapshot.push({ vendorId, ...loc });
    }
    socket.emit('admin:initial:vendors', snapshot);
  });

  // Vendor sends an initial "identify" with vendorId (auth token can be added)
  socket.on('vendor:identify', async ({ vendorId }) => {
    if (!vendorId) return;
    vendorSocketMap.set(socket.id, vendorId);
    console.log(`Socket ${socket.id} identified as vendor ${vendorId}`);

    // fetch vendor once and cache
    const vendor = await getVendorCached(vendorId);
    // send vendor meta back if needed
    socket.emit('vendor:identified', { vendor });
  });

  // Vendor sends live location
  socket.on('vendor:location:update', async (payload) => {
    // payload should include { vendorId, lat, lng, updatedAt }
    try {
      const vendorId = payload.vendorId || vendorSocketMap.get(socket.id);
      if (!vendorId) return;

      // update in-memory last location
      vendorLastLocation.set(vendorId, {
        lat: payload.lat,
        lng: payload.lng,
        updatedAt: payload.updatedAt || new Date().toISOString(),
      });

      // Broadcast to admins only
      io.to('admins').emit('vendor:location', {
        vendorId,
        lat: payload.lat,
        lng: payload.lng,
        updatedAt: payload.updatedAt,
      });

      // Optionally: do periodic DB saves (e.g., every Nth update) - for simplicity not saving each update.
      // For example, you can set a timer to persist every minute per vendor.
    } catch (err) {
      console.error('Error processing location update', err);
    }
  });

  // Vendor going offline intentionally (e.g., app closing / logout) - we persist last loc
  socket.on('vendor:go:offline', async ({ vendorId, lastLocation }) => {
    try {
      const id = vendorId || vendorSocketMap.get(socket.id);
      if (!id) return;
      // Save to DB
      await saveVendorLastLocation(id, lastLocation);
      // cleanup
      vendorLastLocation.set(id, lastLocation);
      vendorSocketMap.delete(socket.id);
      console.log(`Vendor ${id} offline saved`);
    } catch (err) {
      console.error('Error saving offline location', err);
    }
  });

  socket.on('disconnect', async (reason) => {
    console.log('Socket disconnected', socket.id, reason);
    const vendorId = vendorSocketMap.get(socket.id);
    if (vendorId) {
      // if we have a last location in memory, persist it on disconnect
      const lastLocation = vendorLastLocation.get(vendorId);
      if (lastLocation) {
        try {
          await saveVendorLastLocation(vendorId, lastLocation);
          console.log('Saved last location for vendor', vendorId);
        } catch (err) {
          console.error('Failed to save on disconnect', err);
        }
      }
      vendorSocketMap.delete(socket.id);
    }
  });
});

// Start both Express + Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
