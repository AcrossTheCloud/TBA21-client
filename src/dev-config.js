export default {
  s3: {
    REGION: "ap-southeast-2",
    BUCKET: "tba21-content-dev"
  },
  apiGateway: {
    REGION: "ap-southeast-2",
    URL: "https://c8rat70v4a.execute-api.ap-southeast-2.amazonaws.com/dev/"
  },
  cognito: {
    REGION: "ap-southeast-2",
    USER_POOL_ID: "ap-southeast-2_0HC4ds3BG",
    APP_CLIENT_ID: "7evr9uegdj8i30vmlh2enfv9t7",
    IDENTITY_POOL_ID: "ap-southeast-2:580ddd7d-a1b0-426a-a5ff-cd5e4f885d30"
  },
  other: {
    BASE_CONTENT_URL: 'https://tba21-content-dev.acrossthecloud.net/'
  }
};
