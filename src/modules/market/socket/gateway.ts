import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { MarketPriceStore } from '../store/MarketPriceStore';
import { BroadcastHelper } from './utils/broadcastHelper';

/**
 * Market Gateway Configuration
 */
const GATEWAY_CONFIG = {
  BROADCAST_INTERVAL: 1000, // Broadcast prices every 1 second
  NAMESPACE: '/market', // Socket.IO namespace
  SOCKET_PATH: '/socket.io',
} as const;

/**
 * createMarketGateway
 * 
 * Creates a Socket.IO server that clients (React Native frontend) can connect to.
 * Broadcasts market prices to all connected clients.
 * 
 * @param server - HTTP server instance (Express server)
 * @param store - MarketPriceStore instance (single source of truth)
 * @returns SocketIOServer instance
 */
export function createMarketGateway(
  server: HTTPServer,
  store: MarketPriceStore
): SocketIOServer {
  const io = createSocketIOServer(server);
  const marketNamespace = io.of(GATEWAY_CONFIG.NAMESPACE);
  const broadcastHelper = new BroadcastHelper(marketNamespace, store);

  setupConnectionHandlers(marketNamespace, broadcastHelper);
  setupPeriodicBroadcast(marketNamespace, broadcastHelper);

  console.log(`🚀 Market gateway initialized on namespace: ${GATEWAY_CONFIG.NAMESPACE}`);

  return io;
}

/**
 * Create Socket.IO server instance
 */
function createSocketIOServer(server: HTTPServer): SocketIOServer {
  return new SocketIOServer(server, {
    path: GATEWAY_CONFIG.SOCKET_PATH,
    cors: {
      origin: '*', // In production, specify your frontend origin
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });
}

/**
 * Setup connection handlers for each client
 */
function setupConnectionHandlers(
  namespace: ReturnType<SocketIOServer['of']>,
  broadcastHelper: BroadcastHelper
): void {
  namespace.on('connection', (socket: Socket) => {
    console.log(`📱 Client connected to market gateway: ${socket.id}`);

    // Send initial data
    broadcastHelper.sendSnapshot(socket);
    broadcastHelper.sendSymbols(socket);

    // Setup client-specific handlers
    setupClientHandlers(socket, broadcastHelper);
  });
}

/**
 * Setup handlers for individual client socket
 */
function setupClientHandlers(
  socket: Socket,
  broadcastHelper: BroadcastHelper
): void {
  // Handle disconnect
  socket.on('disconnect', (reason: string) => {
    console.log(`📱 Client disconnected from market gateway: ${socket.id} (${reason})`);
  });

  // Handle errors
  socket.on('error', (error: Error) => {
    console.error(`📱 Client Socket.IO error (${socket.id}):`, error.message);
  });

  // Handle ping
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Handle subscribe request
  socket.on('subscribe', () => {
    console.log(`📱 Client ${socket.id} requested symbols`);
    broadcastHelper.sendSymbols(socket);
  });
}

/**
 * Setup periodic broadcast to all clients
 */
function setupPeriodicBroadcast(
  namespace: ReturnType<SocketIOServer['of']>,
  broadcastHelper: BroadcastHelper
): void {
  setInterval(() => {
    broadcastHelper.broadcastAll();
  }, GATEWAY_CONFIG.BROADCAST_INTERVAL);
}
