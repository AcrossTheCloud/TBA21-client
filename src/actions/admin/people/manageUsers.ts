import { get, has } from 'lodash';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';

import config from '../../../config';
import { getCurrentCredentials } from '../../../components/utils/Auth';
import { User } from '../../../components/pages/admin/people/ManageUsers';

// Defining our Actions for the reducers
export const LOAD_MORE = 'LOAD_MORE';
export const ERROR = 'ERROR';

interface UserList {
  users: User[];
  paginationToken: string;
}

const listUsers = async (paginationToken?: string): Promise<UserList | null> => {
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
      Limit: 2
    };

  let responsePaginationToken: string;

  // If we've passed a paginationToken add it to the Params.
  if (paginationToken) {
    Object.assign(params, {PaginationToken: paginationToken});
  }

  return new Promise( (resolve, reject) => {
    cognitoIdentityServiceProvider.listUsers(params, (error: any, data: any) => { // tslint:disable-line: no-any
      if (error) {
        reject(error);
      }

      if (data && data.Users) {
        if (has(data, 'PaginationToken')) {
          responsePaginationToken = data.PaginationToken;
        }

        const users: User[] = data.Users.map( (user: any) => { // tslint:disable-line: no-any
          let userAttributes: any = {}; // tslint:disable-line: no-any

          user.Attributes.forEach( (attribute: {Name: string, Value: string}) => {
            userAttributes[attribute.Name] = attribute.Value;
          });

          return {
            id: user.Username,
            email: userAttributes.email,
            username: user.Username
          };
        });

        resolve({
          users: users,
          paginationToken: responsePaginationToken
        });
      } else {
        reject(null);
      }
    });
  });
};

export const loadMore = (paginationToken?: string) => async dispatch => {
  const dispatchError = () => {
    dispatch({
       type: ERROR,
       errorMessage: 'We\'re having difficulties right now, please try again.'
     });
  };
  try {
    const response: UserList | null = await listUsers(paginationToken);

    if (response && has(response, 'users')) {
      dispatch({
        type: LOAD_MORE,
        users: response.users,
        paginationToken: response.paginationToken
      });
    } else {
      dispatchError();
    }
  } catch (e) {
    dispatchError();
  }
};
