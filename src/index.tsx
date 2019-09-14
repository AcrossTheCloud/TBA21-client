import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Amplify from 'aws-amplify';
import { config as AWSConfig } from 'aws-sdk';
import { CookiesProvider } from 'react-cookie';

import { AppRouter } from './router';
import config from './config.js';

import 'bootstrap/dist/css/bootstrap.css';

// Our custom styles
import './styles/app.scss';

Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  Storage: {
    region: config.s3.REGION,
    bucket: config.s3.BUCKET,
    identityPoolId: config.cognito.IDENTITY_POOL_ID
  },
  API: {
    endpoints: [
      {
        name: 'tba21',
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION
      },
    ]
  }
});

// Set AWS-SDK Region
AWSConfig.region = config.s3.REGION;

ReactDOM.render(
  <CookiesProvider>
    <AppRouter />
  </CookiesProvider>
  , 
  document.getElementById('root')
);
