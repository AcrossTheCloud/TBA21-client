import * as React from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem
} from 'reactstrap';

import { Link } from 'react-router-dom';

import { Auth } from 'aws-amplify';

export default class Header extends React.Component<{history: any}, {isAuthenticated: boolean, isOpen: boolean}> { // tslint:disable-line: no-any

  state: {isOpen: false, isAuthenticated: false};

  async componentDidMount() {
    try {
      if (await Auth.currentSession()) {
        this.setState({ isAuthenticated: true });
      }
    } catch (e) {
      if (e !== 'No current user') {
        this.setState({ isAuthenticated: false });
      }
    }

  }

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.props.history.listen(async (location: any) => { // tslint:disable-line: no-any
      try {
        if (await Auth.currentSession()) {
          this.setState({ isAuthenticated: true });
        }
      } catch (e) {
        if (e !== 'No current user') {
          this.setState({ isAuthenticated: false });
        }
      }
    });

    this.toggle = this.toggle.bind(this);
    this.state = {
      isAuthenticated: false,
      isOpen: false
    };
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
