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

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  isAuthenticated: boolean;
  authorisation?: any; // tslint:disable-line: no-any
  isOpen: boolean;
}

export default class Header extends React.Component<Props, State> { // tslint:disable-line: no-any
  isAdmin: boolean = false;

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
    const auth = await checkAuth();
    this.setState(auth);

    this.isAdmin = this.state.authorisation && this.state.authorisation.hasOwnProperty('admin');
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
      <div className={'navigation'}>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">TBA21</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <Link className="nav-link" to="/">Home</Link>
              </NavItem>
              { this.state.isAuthenticated ?
                <NavItem>
                  <Link className="nav-link" to="/itemEntry">Item Metadata Entry</Link>
                </NavItem>
                : ''
              }
              { this.state.isAuthenticated ?
                <NavItem>
                  <Link className="nav-link" to="/PersonEntry">Person Metadata Entry</Link>
                </NavItem>
                : ''
              }
              { this.state.isAuthenticated ?
                <NavItem>
                  <Link className="nav-link" to="/ManageUsers">Manage Users</Link>
                </NavItem>
                : ''
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
              { this.state.isAuthenticated ?
                <NavItem>
                  <Link className="nav-link" to="/" onClick={() => { this.logout(); }}>Logout</Link>
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
  }
}
