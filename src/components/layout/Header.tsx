import * as React from 'react';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem
} from 'reactstrap';

import { checkAuth } from '../utils/Auth';
import { AuthConsumer } from '../../Providers/AuthProvider';

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  isAuthenticated: boolean;
  authorisation?: Authorisation;
  isOpen: boolean;
}

interface Authorisation {
  [key: string]: boolean;
}

export default class Header extends React.Component<Props, State> { // tslint:disable-line: no-any
  constructor(props: Props) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      isAuthenticated: false,
      isOpen: false
    };

    this.props.history.listen(async (location: any) => { // tslint:disable-line: no-any
      this.setState(await checkAuth());
    });

    this.toggle = this.toggle.bind(this);
  }

  async componentDidMount() {
    this.setState(await checkAuth());
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  async logout() {
    try {
      await Auth.signOut();
      this.props.history.push('/');
    } catch (e) {
      alert(e.message);
    }
  }
  render() {

    return (
      <AuthConsumer>
        {({ isAuthenticated, authorisation, logout }) => {
          const isAdmin = (authorisation && Object.keys(authorisation).length &&  authorisation.hasOwnProperty('admin'));
          return (
            <div className={'navigation'}>
              <Navbar color="light" light expand="md">
                <NavbarBrand href="/">TBA21</NavbarBrand>
                <NavbarToggler onClick={this.toggle}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                  <Nav className="ml-auto" navbar>
                    <NavItem>
                      <Link className="nav-link" to="/">Home</Link>
                    </NavItem>
                    {isAuthenticated && isAdmin ?
                      <>
                        <NavItem>
                          <Link className="nav-link" to="/itemEntry">Item Metadata Entry</Link>
                        </NavItem>
                        <NavItem>
                          <Link className="nav-link" to="/PersonEntry">Person Metadata Entry</Link>
                        </NavItem>
                        <NavItem>
                          <Link className="nav-link" to="/ManageUsers">Manage Users</Link>
                        </NavItem>
                      </>
                      : <></>
                    }

                    <NavItem>
                      <Link className="nav-link" to="/view">View Items</Link>
                    </NavItem>
                    <NavItem>
                      <Link className="nav-link" to="/map">Map View</Link>
                    </NavItem>

                    <NavItem>
                      <Link className="nav-link" to="/viewGraph">View Items and People Graph</Link>
                    </NavItem>

                    {isAuthenticated ?
                      <NavItem>
                        <Link className="nav-link" to="/" onClick={logout}>
                          Logout
                        </Link>
                      </NavItem>
                      :
                      <NavItem>
                        <Link className="nav-link" to="/login">Login</Link>
                      </NavItem>
                    }
                  </Nav>
                </Collapse>
              </Navbar>
            </div>
          );
        }}
      </AuthConsumer>
    );
  }
}
