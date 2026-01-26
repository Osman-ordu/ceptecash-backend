#!/usr/bin/env node

/**
 * Socket.IO Market Socket Test Script
 * 
 * Bu script Socket.IO market socket'ine bağlanır ve
 * gelen verileri konsola yazdırır.
 * 
 * Kullanım:
 *   node test-socket.js
 * 
 * veya
 * 
 *   npm install socket.io-client
 *   node test-socket.js
 */

const io = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';
const NAMESPACE = '/market';
const FULL_URL = `${SOCKET_URL}${NAMESPACE}`;

console.log('🔌 Connecting to:', FULL_URL);
console.log('⏳ Waiting for connection...\n');

const socket = io(FULL_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000,
});

let connected = false;
let pricesReceived = 0;
let symbolsReceived = false;

// Connection events
socket.on('connect', () => {
  connected = true;
  console.log('✅ Connected to market socket');
  console.log('   Socket ID:', socket.id);
  console.log('   Transport:', socket.io.engine.transport.name);
  console.log('');
});

socket.on('disconnect', (reason) => {
  connected = false;
  console.log('\n❌ Disconnected:', reason);
  if (reason === 'io server disconnect') {
    console.log('   Server disconnected the client');
  } else if (reason === 'io client disconnect') {
    console.log('   Client disconnected');
  } else {
    console.log('   Will attempt to reconnect...');
  }
});

socket.on('connect_error', (error) => {
  console.error('\n❌ Connection error:', error.message);
  console.error('   Make sure the server is running on', SOCKET_URL);
});

// Market data events
socket.on('prices', (prices) => {
  pricesReceived++;
  console.log(`📊 Prices received (${pricesReceived}):`, prices.length, 'items');
  
  if (prices.length > 0) {
    console.log('   Sample price:', {
      symbol: prices[0].symbol,
      buyPrice: prices[0].buyPrice,
      sellPrice: prices[0].sellPrice,
      changePercent: prices[0].changePercent,
    });
    
    // İlk 3 sembolü göster
    if (prices.length > 1) {
      const symbols = prices.slice(0, 3).map(p => p.symbol).join(', ');
      console.log(`   First 3 symbols: ${symbols}${prices.length > 3 ? '...' : ''}`);
    }
  } else {
    console.log('   ⚠️  No prices available yet');
  }
  console.log('');
});

socket.on('symbols', (symbols) => {
  symbolsReceived = true;
  console.log('🔤 Symbols received:', symbols.length, 'symbols');
  console.log('   Symbols:', symbols.join(', '));
  console.log('');
});

// Error handling
socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Closing connection...');
  socket.disconnect();
  
  console.log('\n📊 Test Summary:');
  console.log('   Connected:', connected ? '✅' : '❌');
  console.log('   Prices received:', pricesReceived);
  console.log('   Symbols received:', symbolsReceived ? '✅' : '❌');
  
  process.exit(0);
});

// Auto exit after 30 seconds (optional)
if (process.env.AUTO_EXIT !== 'false') {
  setTimeout(() => {
    if (connected) {
      console.log('\n⏰ 30 seconds elapsed, closing connection...');
      socket.disconnect();
      
      console.log('\n📊 Test Summary:');
      console.log('   Connected:', connected ? '✅' : '❌');
      console.log('   Prices received:', pricesReceived);
      console.log('   Symbols received:', symbolsReceived ? '✅' : '❌');
      
      process.exit(0);
    }
  }, 30000);
}

console.log('💡 Press Ctrl+C to exit\n');
