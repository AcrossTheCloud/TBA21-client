import * as React from 'react';
import { has, get } from 'lodash';
import BootstrapTable from 'react-bootstrap-table-next';
import { Alert } from 'reactstrap';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import config from '../../../../config';
import { checkAuth, getCurrentCredentials } from '../../../utils/Auth';

// set interface
interface State {
  users: User[];
  errorMessage?: string;
}
interface Props {
  history: any; // tslint:disable-line: no-any
}

interface User {
  id: number;
  email: string;
  username: string;
}

const columns = [{
  dataField: 'id',
  hidden: true
},
{
  dataField: 'username',
  hidden: true
},
{
  dataField: 'email',
  text: 'User Email'
}];

export class ManageUsers extends React.Component<Props, State> { // put in header
  constructor(props: Props) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      users: []
    };
  }
  async componentDidMount() {
    const
      { authorisation, isAuthenticated } = await checkAuth(),
      credentials = await getCurrentCredentials();

    console.log(credentials);

    if (!isAuthenticated || authorisation && !has(authorisation, 'admin')) {
      this.props.history.push('/');
    }
    const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
      region: config.cognito.REGION,
      credentials: {
        accessKeyId: get(credentials, 'accessKeyId'),
        sessionToken: get(credentials, 'sessionToken'),
        secretAccessKey: get(credentials, 'data.Credentials.SecretKey'),
      }
    });

    const params: CognitoIdentityServiceProvider.ListUsersRequest = {
      UserPoolId: config.cognito.USER_POOL_ID
    };

    cognitoidentityserviceprovider.listUsers(params, (err: any, data: any) => { // tslint:disable-line: no-any
      // console.log(err, data);
      if (err) {
        this.setState({errorMessage: 'We\'re having difficulties right now, please try again.'});
      }
      if (data && data.Users) {
        const users: User[] = data.Users.map( (user: any, index: number) => { // tslint:disable-line: no-any
          let userAttributes: any = {}; // tslint:disable-line: no-any
          user.Attributes.forEach( (attribute: {Name: string, Value: string}) => {
            userAttributes[attribute.Name] = attribute.Value;
          });

          return {
            id: index,
            email: userAttributes.email,
            username: user.Username
          };
        });

        this.setState({users: users});

        console.log(users);

      }
    });

  }

  render() {
    if (this.state.errorMessage) {
      return <Alert color="danger">{this.state.errorMessage}</Alert>;
    } else {
      return <BootstrapTable keyField="id" data={this.state.users} columns={columns} />;
    }
  }
}
