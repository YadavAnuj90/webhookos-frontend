/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  devIndicators: false,
  webpack: (config, { dev }) => {
    if (dev) {
      /* ── silence noisy Fast-Refresh / HMR console logs ── */
      config.infrastructureLogging = { level: 'error' };
    }
    return config;
  },
  /* suppress SWC platform warnings in terminal */
  logging: { fetches: { fullUrl: false } },
};
