import * as React from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink } from 'reactstrap';

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
                <NavLink href="/">Home</NavLink>
              </NavItem>
              { this.state.isAuthenticated ?
                <NavItem>
                  <NavLink href="/itemEntry">Item Metadata Entry</NavLink>
                </NavItem>
                : ''
              }
              { this.state.isAuthenticated ?
                <NavItem>
                  <NavLink href="/PersonEntry">Person Metadata Entry</NavLink>
                </NavItem>
                : ''
              }

              <NavItem>
                <NavLink href="/view">View Items</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/map">Map View</NavLink>
              </NavItem>

              <NavItem>
                <NavLink href="/viewGraph">View Items and People Graph</NavLink>
              </NavItem>
              { this.state.isAuthenticated ?
                <NavItem>
                  <NavLink href="/" onClick={() => { this.logout(); }}>Logout</NavLink>
                </NavItem>
                :
                <NavItem>
                  <NavLink href="/login">Login</NavLink>
                </NavItem>
              }
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
