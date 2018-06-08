import * as React from 'react';

import { NavProps } from 'reactstrap';

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink } from 'reactstrap';

export default class Header extends React.Component<NavProps, {dropdownOpen: Boolean}> {

    state: { dropdownOpen: boolean; };

    setState(arg0: {dropdownOpen: boolean}): void {
      this.state = arg0;
    }

    constructor(props: NavProps) {
      super(props);

      this.toggle = this.toggle.bind(this);
      this.state = {
        dropdownOpen: false
      };
    }
    toggle() {
      this.setState({
        dropdownOpen: !this.state.dropdownOpen
      });
    }

    render() {
      return (
        <div>
          <Navbar color="light" light expand="md">
            <NavbarBrand href="/">TBA21 OceanArchive</NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse dropdownOpen={this.state.dropdownOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <NavLink href="/">Home</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink href="/entry">Metadata Entry</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </div>
      );
    }
  }
