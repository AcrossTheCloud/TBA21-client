import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { Auth } from 'aws-amplify';
import { AWSError } from 'aws-sdk';
import { get } from 'lodash';

import { getCurrentAuthenticatedUser } from '../../components/utils/Auth';
import config from '../../config';

// Actions
export const OVERLAY = 'OVERLAY';
export const DELETED_ACCOUNT = 'DELETED_ACCOUNT';
export const PROFILE_ERROR = 'PROFILE_ERROR';
export const PROFILE_SUCCESS = 'PROFILE_SUCCESS';

/**
 * Dispatches to the PROFILE_ERROR reducer action.type
 */
export const dispatchError = (message: string) => dispatch => {
  dispatch({type: PROFILE_ERROR, message: message});
};

/**
 * Updates the users attributes in AWS Cognito
 *
 * @param attributes {Object: Name, Value}
 */
export const updateAttributes = (attributes: any) => async dispatch => { // tslint:disable-line: no-any
  try {
    const cognitoUser = await getCurrentAuthenticatedUser();

    // Puts an overlay over the entire page.
    dispatch({type: OVERLAY, overlay: true});

    if (cognitoUser && typeof cognitoUser !== 'boolean') {
      // Update attributes on the users local Cognito storage.
      await Auth.updateUserAttributes(cognitoUser, attributes);
      dispatch({type: PROFILE_SUCCESS, message: 'We\'ve updated your profile'});

    } else {
      throw new Error('Not authed');
    }
  } catch (e) {
    // Account with that email address already exists in Cognito.
    if (e.code === 'AliasExistsException') {
      dispatch({type: PROFILE_ERROR, message: 'An account with the given email already exists.', showForm: true});
    } else {
      dispatch({type: PROFILE_ERROR, message: 'We\'re having some difficulties at the moment.'});
    }
  }
};

/**
 * Deletes the users account from AWS Cognito
 */
export const deleteAccount = () => async dispatch => {
  // Checks that the user is Authenticated and has an accessToken from aws-amplify
  const accessToken: string = get(await getCurrentAuthenticatedUser(), 'signInUserSession.accessToken.jwtToken');

  // Puts an overlay over the entire page.
  dispatch({type: OVERLAY, overlay: true});

  // No accessToken? Have an error
  if (accessToken && accessToken.length) {
    // Sets up CognitoIdentityServiceProvider with our correct region and API version
    const
      cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider(
        {
          apiVersion: '2016-04-18',
          region: config.cognito.REGION
        }
      ),
      deleteUserParams: CognitoIdentityServiceProvider.DeleteUserRequest = {
        AccessToken: accessToken,
      };

    // API to deleteUser - https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#deleteUser-property
    // This call only allows the USER to delete themselves.
    cognitoIdentityServiceProvider.deleteUser(deleteUserParams, (err: AWSError, data: any) => { // tslint:disable-line: no-any
      if (err) {
        dispatch({type: PROFILE_ERROR, message: 'We\'ve had trouble removing your account, please try again.'});
      } else {
        dispatch({type: DELETED_ACCOUNT});
      }
    });
  } else {
    dispatch({type: PROFILE_ERROR, message: 'You don\'t seem to be logged in.'});
  }
};

/**
 * Updates the users Password.
 *
 * @param oldPassword {string}
 * @param newPassword {string}
 */
export const changePassword = (oldPassword: string, newPassword: string) => async dispatch => {
  const cognitoUser = await getCurrentAuthenticatedUser();

  if (cognitoUser && typeof cognitoUser !== 'boolean') {
    try {
      await Auth.changePassword(cognitoUser, oldPassword, newPassword);
      dispatch({type: PROFILE_SUCCESS, message: 'Your password has been changed.'});
    } catch (e) {
      const message = (e.message ? e.message : 'We\'re having some difficulties at the moment.');
      dispatch({type: PROFILE_ERROR, message: message});
    }
   }
};
