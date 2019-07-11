import * as React from 'react';
import { NavLink as ReactLink, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { has } from 'lodash';

import { AuthConsumer } from '../../providers/AuthProvider';

import 'styles/layout/_navigation.scss';

interface State {
  isOpen: boolean;
}

class HeaderClass extends React.Component<RouteComponentProps, State> { // tslint:disable-line: no-any
  constructor(props: RouteComponentProps) { // tslint:disable-line: no-any
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

  AdminRoutes(): JSX.Element {
    return (
      <UncontrolledDropdown inNavbar nav>
        <DropdownToggle nav caret>
          Admin
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem>
            <NavItem>
              <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/admin/People">People</NavLink>
            </NavItem>
          </DropdownItem>
          <DropdownItem>
            <NavItem>
              <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/admin/PersonEntry">Person Metadata Entry</NavLink>
            </NavItem>
          </DropdownItem>
          <DropdownItem>
            <NavItem>
              <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/admin/ManageUsers">Manage Users</NavLink>
            </NavItem>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  ColllaboratorRoutes(): JSX.Element {
    return (
      <NavItem>
        <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/items/upload">Items</NavLink>
      </NavItem>
    );
  }

  render() {
    return (
      <AuthConsumer>
        {({ isAuthenticated, authorisation, logout }) => {
          const isAdmin = (authorisation && Object.keys(authorisation).length &&  authorisation.hasOwnProperty('admin'));
          return (
            <div id="navigation">
              <Navbar color="light" light expand="md">
                <NavbarBrand href="/">TBA21</NavbarBrand>
                <NavbarToggler onClick={this.toggle}/>
                <Collapse isOpen={this.state.isOpen} navbar>
                  <Nav className="ml-auto" navbar>
                    <NavItem>
                      <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/">Home</NavLink>
                    </NavItem>

                    {isAuthenticated && isAdmin ?
                      <this.AdminRoutes />
                      : <></>
                    }

                    {isAuthenticated && (has(authorisation, 'collaborator') || has(authorisation, 'editor') || has(authorisation, 'admin')) ?
                      <this.ColllaboratorRoutes />
                      : <></>
                    }

                    <NavItem>
                      <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/view">View Items</NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/map">Map View</NavLink>
                    </NavItem>

                    <NavItem>
                      <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/viewGraph">View Items and People Graph</NavLink>
                    </NavItem>

                    {isAuthenticated ?
                      <>
                        <NavItem>
                            <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/Profile">Profile</NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/" onClick={logout}>
                            Logout
                          </NavLink>
                        </NavItem>
                      </>
                      :
                      <NavItem>
                        <NavLink exact tag={ReactLink} className="nav-link" activeClassName="active" to="/login">Login</NavLink>
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

export const Header = withRouter(HeaderClass);
