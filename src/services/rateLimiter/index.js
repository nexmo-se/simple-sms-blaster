const http = require('http');
const https = require('https');
const axios = require('axios');
const Bottleneck = require('bottleneck').default;

const getTrackTime = () => {
  const currentTime = new Date();
  const year = currentTime.getFullYear();
  const month = currentTime.getMonth() + 1;
  const date = currentTime.getDate();
  const hours = currentTime.getHours();
  const minute = `0${currentTime.getMinutes()}`.slice(-2);
  const second = `0${currentTime.getSeconds()}`.slice(-2);
  const trackTime = `${month}/${date}/${year} ${hours}:${minute}:${second}`;
  return trackTime;
};

const tracker = {
  lastTps: 0,
  trackingTps: 0,
  trackTime: getTrackTime(),
};

const trackTps = () => {
  const trackTime = getTrackTime();
  if (tracker.trackTime === trackTime) {
    tracker.trackingTps += 1;
  } else {
    tracker.trackTime = trackTime;
    tracker.lastTps = tracker.trackingTps;
    tracker.trackingTps = 1;

    console.log(`TPS: ${tracker.lastTps}tps`);
  }
};

const newInstance = (tps) => {
  const httpAgent = new http.Agent({ keepAlive: true });
  const httpsAgent = new https.Agent({ keepAlive: true });

  // Set Rate
  const config = { maxRequests: tps, perMilliseconds: 1000 };
  console.log('Creating new Bottleneck instance (Axios)', config);

  const minTime = Math.ceil(1000 / tps);
  const bottleneckInstance = new Bottleneck({ minTime, trackDoneStatus: true });

  const originalAxiosInstance = axios.create({ httpAgent, httpsAgent });
  originalAxiosInstance.interceptors.request.use((req) => {
    trackTps();
    return req;
  });

  return {
    get: (url, requestConfig) => bottleneckInstance.schedule(
      () => originalAxiosInstance.get(url, requestConfig),
    ),
    post: (url, body, requestConfig) => bottleneckInstance.schedule(
      () => originalAxiosInstance.post(url, body, requestConfig),
    ),
    put: (url, body, requestConfig) => bottleneckInstance.schedule(
      () => originalAxiosInstance.put(url, body, requestConfig),
    ),
    delete: (url, body, requestConfig) => bottleneckInstance.schedule(
      () => originalAxiosInstance.delete(url, body, requestConfig),
    ),
  };
};

module.exports = {
  newInstance,
};
