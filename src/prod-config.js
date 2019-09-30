export default {
  s3: {
    REGION: "eu-central-1",
    BUCKET: "ocean-archive-prod-content",
    PROFILE_PIC_BUCKET: "profile-pics.ocean-archive.org"
  },
  apiGateway: {
    REGION: "eu-central-1",
    URL: "https://demo-api.ocean-archive.org/"
  },
  cognito: {
    REGION: "eu-central-1",
    USER_POOL_ID: "eu-central-1_MClQ7jNon",
    APP_CLIENT_ID: "2lrll2fm15mhbhjgmss7snk8v6",
    IDENTITY_POOL_ID: "eu-central-1:87c9ec1d-7fa8-4c74-b907-c31bdec2b879"
  },
  google : {
    UA_ID: "UA-147444684-3"
  },
  social: {
    FB: "370805207078211"
  },
  other: {
    BASE_CONTENT_URL: 'https://prod-content.ocean-archive.org/',
    THUMBNAIL_URL: "https://thumbnails.ocean-archive.org/",
    VIDEO_STREAMING_URL: "https://video-streaming.ocean-archive.org/",
    AUDIO_URL: "https://audio.ocean-archive.org/",
    PROFILE_URL: "https://profile-pics.ocean-archive.org/"
  }
};
