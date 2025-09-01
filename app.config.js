import 'dotenv/config';

export default {
  expo: {
    name: 'ubereats',
    version: '1.0.0',
    extra: {
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    },
  },
};