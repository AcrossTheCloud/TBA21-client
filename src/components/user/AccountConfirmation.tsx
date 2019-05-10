import * as React from 'react';
import { Auth } from 'aws-amplify';
import { has, get } from 'lodash';
import { Alert, FormGroup, Input, Label } from 'reactstrap';
import LoaderButton from '../utils/LoaderButton';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface Props extends RouteComponentProps {
  email: string;
}

interface State {
  email: string | undefined;
  errorMessage: string | undefined;
  isLoading: boolean;
  hasResentCode: boolean;
  confirmationCode: string;
}

class AccountConfirmationClass extends React.Component<Props, State>  {
  matchEmail;

  constructor(props: Props) {
    super(props);

    this.matchEmail = has(props.match, 'params.email') ? get(props.match, 'params.email') : undefined;

    this.state = {
      email: this.matchEmail,
      errorMessage: undefined,
      isLoading: false,
      hasResentCode: false,
      confirmationCode: '',
    };
  }

  componentDidMount(): void {
    if (!this.matchEmail && !this.props.email) {
      this.props.history.push('/');
    } else {
      this.setState({ email: this.matchEmail ? this.matchEmail : this.props.email});
    }
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
  }

  handleConfirmationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (this.state.email) {
      this.setState({isLoading: true});

      try {
        await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);

        this.props.history.push('/login');
      } catch (e) {
        alert(e.message);
        this.setState({isLoading: false});
      }
    }
  }

  resendConfirmationCode = async () => {
    if (this.state.email) {
      try {
        this.setState({hasResentCode: true});
        await Auth.resendSignUp(this.state.email);
      } catch (e) {
        // NOTE
        // We get InvalidParameterException if the user is signed up, documentation on responses is non-existent
        if (e.code === 'UserNotFoundException') {
          this.setState({errorMessage: 'Looks like there\'s no account with this email address.'});
        } else {
          this.setState( { errorMessage: `We\'re unable to confirm your account due to an error, please contact us. (${e.code})` });
        }
      }
    }
  }

  render() {
    if (this.state.errorMessage) {
      return <Alert color="danger">{this.state.errorMessage}</Alert>;
    } else {
      return (
        <form onSubmit={this.handleConfirmationSubmit}>
          <FormGroup id="confirmationCode">
            <Label>Confirmation Code</Label>
            <Input
              autoFocus
              type="tel"
              value={this.state.confirmationCode}
              onChange={(e) => this.setState({confirmationCode: e.target.value})}
            />
            Please check your email for the code{this.state.hasResentCode ? '.' : <> or <a href="#" onClick={this.resendConfirmationCode}>resend the code</a>.</>}
          </FormGroup>
          <LoaderButton
            block
            disabled={!this.validateConfirmationForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Verify"
            loadingText="Verifying…"
          />
        </form>
      );
    }
  }
}

// Passes in history for us :)
export const AccountConfirmation = withRouter(AccountConfirmationClass);
