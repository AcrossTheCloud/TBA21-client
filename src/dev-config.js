export default {
  s3: {
    REGION: "eu-central-1",
    BUCKET: "oceanarchive-demo-dev",
    PROFILE_PIC_BUCKET: "profile-pics.ocean-archive.org"
  },
  apiGateway: {
    REGION: "eu-central-1",
    // URL: "https://demo-dev-api.ocean-archive.org/"
    URL: "https://q8qw8mup9h.execute-api.eu-central-1.amazonaws.com/prod/",
    // URL: "http://localhost:8080/prod/"
  },
  cognito: {
    REGION: "eu-central-1",
    USER_POOL_ID: "eu-central-1_bnvWk6I6I",
    APP_CLIENT_ID: "1cs7jkedr6joup35sq0mniveqg",
    IDENTITY_POOL_ID: "eu-central-1:fc8e6f8d-e49f-4344-bf06-bae75dcebe53"
  },
  google: {
    UA_ID: "UA-147444684-1"
  },
  social: {
    FB: "370805207078211"
  },
  other: {
    BASE_CONTENT_URL: "https://demo-dev-content.ocean-archive.org/",
    THUMBNAIL_URL: "https://thumbnails.ocean-archive.org/",
    VIDEO_STREAMING_URL: "https://video-streaming.ocean-archive.org/",
    AUDIO_URL: "https://audio.ocean-archive.org/",
    PROFILE_URL: "https://profile-pics.ocean-archive.org/"
  }
};
