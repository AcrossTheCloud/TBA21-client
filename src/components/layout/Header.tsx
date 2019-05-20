import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem
} from 'reactstrap';

import { AuthConsumer } from '../../providers/AuthProvider';

interface Props {
  history: any; // tslint:disable-line: no-any
}

interface State {
  isOpen: boolean;
}

export default class Header extends React.Component<Props, State> { // tslint:disable-line: no-any
  constructor(props: Props) { // tslint:disable-line: no-any
    super(props);

    this.state = {
      isOpen: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
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
                          <Link className="nav-link" to="/PersonEntry">Person Metadata Entry</Link>
                        </NavItem>
                        <NavItem>
                          <Link className="nav-link" to="/ManageUsers">Manage Users</Link>
                        </NavItem>
                        <NavItem>
                          <Link className="nav-link" to="/Collections">Collections</Link>
                        </NavItem>
                        <NavItem>
                          <Link className="nav-link" to="/Items">Items</Link>
                        </NavItem>
                        <NavItem>
                          <Link className="nav-link" to="/People">People</Link>
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
                      <>
                        <NavItem>
                            <Link className="nav-link" to="/Profile">Profile</Link>
                        </NavItem>
                        <NavItem>
                          <Link className="nav-link" to="/" onClick={logout}>
                            Logout
                          </Link>
                        </NavItem>
                      </>
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
