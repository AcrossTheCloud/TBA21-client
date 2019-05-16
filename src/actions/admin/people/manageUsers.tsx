import { get, has } from 'lodash';
import CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';

import config from '../../../config';
import { getCurrentCredentials } from '../../../components/utils/Auth';
import { User } from '../../../components/pages/admin/people/ManageUsers';

// Defining our Actions for the reducers
export const LOAD_MORE = 'LOAD_MORE';
export const ERROR = 'ERROR';

export interface UserList {
  users: User[];
  paginationToken: string | undefined;
}

/**
 * Load list of users from AWS Cognito
 * @param limit {number | null} Number of results to load
 * @param paginationToken {string | null} String returned from AWS API Call
 * @param userQuery filters search results
 * @param userQueryOption toggles the search result filter
 */
export const listUsers = async (limit: number = 15, paginationToken?: string, userQuery?: string, userQueryOption?: string): Promise<UserList | null> => {
  const
    credentials = await getCurrentCredentials(),
    cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({
      region: config.cognito.REGION,
      credentials: {
        accessKeyId: get(credentials, 'accessKeyId'),
        sessionToken: get(credentials, 'sessionToken'),
        secretAccessKey: get(credentials, 'data.Credentials.SecretKey'),
      }
    }),
    params: CognitoIdentityServiceProvider.ListUsersRequest = {
      UserPoolId: config.cognito.USER_POOL_ID,
      Limit: limit
    };

  if (userQuery) {
    Object.assign (params, {Filter:  `${userQueryOption} ^=  '${userQuery}'`} );
  }

  let responsePaginationToken: string | undefined;

  // If we've passed a paginationToken add it to the Params.
  if (paginationToken) {
    Object.assign(params, {PaginationToken: paginationToken});
  }

  const data = await cognitoIdentityServiceProvider.listUsers(params).promise();

  if (data && data.Users) {
    // If we have a token return it, otherwise we assume we're at the end of the list os our users.
    if (has(data, 'PaginationToken')) {
      responsePaginationToken = data.PaginationToken;
    } else {
      responsePaginationToken = undefined;
    }

    // Convert attributes to a key: value pair instead of an Array of Objects
    const users: User[] = data.Users.map( (user: any) => { // tslint:disable-line: no-any
      let userAttributes: any = {}; // tslint:disable-line: no-any

      user.Attributes.forEach( (attribute: {Name: string, Value: string}) => {
        userAttributes[attribute.Name] = attribute.Value;
      });

      // Disable the user if their status is unknown or COMPROMISED, because, who knows.
      if (user.UserStatus === 'UNKNOWN' || user.UserStatus === 'COMPROMISED') {
        user.Enabled = false;
      }

      return {
        username: user.Username,
        email: userAttributes.email,
        enabled: user.Enabled,
        status: user.UserStatus,
        emailVerified: userAttributes.email_verified === 'true'
      };
    });

    return {
      users: users,
      paginationToken: responsePaginationToken
    };
  } else {
    return null;
  }
};

/**
 * Disptaches an array of users, pagination token and limit back to the Component
 * @param limit {number | null} Number of results to load
 * @param paginationToken {string | null} String returned from AWS API Call
 * @param refresh {boolean} If we should wipe the userlist.
 */
export const loadMore = (limit: number, paginationToken?: string | null, refresh: boolean = false) => async dispatch => {
  // If we don't have any more results to load, do nothing.
  if (paginationToken === null) { return; }

  // Dispatch an error if we stumble upon one.
  const dispatchError = () => {
    dispatch({
       type: ERROR,
       errorMessage: 'We\'re having difficulties right now, please try again.'
     });
  };
  try {
    const response: UserList | null = await listUsers(limit, paginationToken);

    if (response && has(response, 'users')) {
      dispatch({
        type: LOAD_MORE,
        users: response.users,
        paginationToken: response.paginationToken,
        limit: limit,
        refresh: refresh
      });
    } else {
      dispatchError();
    }
  } catch (e) {
    dispatchError();
  }
};
