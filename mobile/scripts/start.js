import { networkInterfaces } from 'node:os';
import { spawn } from 'node:child_process';

function isPrivateIPv4(address) {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => part < 0 || part > 255)) return false;
  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168);
}

function getLanIPv4() {
  const interfaces = networkInterfaces();
  const names = Object.keys(interfaces);
  const orderedNames = ['en0', ...names.filter((name) => name !== 'en0')];

  for (const name of orderedNames) {
    const address = interfaces[name]?.find((item) =>
      item.family === 'IPv4' && !item.internal && isPrivateIPv4(item.address),
    )?.address;
    if (address) return address;
  }
  return undefined;
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!apiBaseUrl) {
  const address = getLanIPv4();
  if (!address) {
    console.error('Could not find a private IPv4 address for this Mac. Set EXPO_PUBLIC_API_BASE_URL manually and retry.');
    process.exit(1);
  }
  process.env.EXPO_PUBLIC_API_BASE_URL = `http://${address}:3000/api`;
  console.log(`Using backend at ${process.env.EXPO_PUBLIC_API_BASE_URL}`);
} else {
  console.log(`Using configured backend at ${apiBaseUrl}`);
}

const expo = spawn('expo', ['start', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

expo.on('error', (error) => {
  console.error(`Could not start Expo: ${error.message}`);
  process.exitCode = 1;
});
expo.on('exit', (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
