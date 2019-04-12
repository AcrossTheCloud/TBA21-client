import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { getCurrentAuthenticatedUser } from '../../components/utils/Auth';
import { DeleteUserRequest } from 'aws-sdk/clients/cognitoidentityserviceprovider';

import config from '../../config';
import { AWSError } from 'aws-sdk';

// Actions
export const OVERLAY = 'OVERLAY';
export const DELETED_ACCOUNT = 'DELETED_ACCOUNT';
export const DELETE_ACCOUNT_ERROR = 'DELETE_ACCOUNT_ERROR';

/**
 * Dispatches to the DELETE_ACCOUNT_ERROR reducer action.type
 */
export const dispatchError = () => dispatch => {
  dispatch({type: DELETE_ACCOUNT_ERROR});
};

/**
 * Deletes the users account from AWS Cognito
 */
export const deleteAccount = () => async dispatch => {

  // Checks that the user is Authenticated and has an accessToken from aws-amplify
  const authedUserDetails: any = await getCurrentAuthenticatedUser(); // tslint:disable-line: no-any
  if (authedUserDetails && authedUserDetails.signInUserSession && authedUserDetails.signInUserSession.accessToken) {
    const
      accessTokenObject = authedUserDetails.signInUserSession.accessToken,
      accessToken: string = accessTokenObject.jwtToken ? accessTokenObject.jwtToken : '';

    // Puts an overlay over the entire page.
    dispatch({type: OVERLAY});

    // No accessToken? Have an error
    if (accessToken.length < 1) {
      dispatchError();
    }

    // Sets up CognitoIdentityServiceProvider with our correct region and API version
    const
      cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider(
        {
          apiVersion: '2016-04-18',
          region: config.cognito.REGION
        }
      ),
      deleteUserParams: DeleteUserRequest = {
        AccessToken: accessToken,
      };

    // API to deleteUser - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#deleteUser-property
    // This call only allows the USER to delete themselves.
    cognitoIdentityServiceProvider.deleteUser(deleteUserParams, (err: AWSError, data: any) => { // tslint:disable-line: no-any
      if (err) {
        dispatchError();
      } else {
        dispatch({type: DELETED_ACCOUNT});
      }
    });

  } else {
    dispatchError();
  }
};
