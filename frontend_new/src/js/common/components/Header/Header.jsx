import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import * as logout from '../../../actions/authActions';

require('./Header.css');

const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(logout, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class Header extends PureComponent {
  static propTypes = {
    logout: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  logout() {
    this.props.logout(this.props.history);
  }

  render() {
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavLink className="navbar-brand" tag={Link} to="/" replace>Home</NavLink>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {
                !!this.props.auth.token &&
                <NavItem>
                  <NavLink tag={Link} to="/tests/" replace>Tests</NavLink>
                </NavItem>
              }
              {
                !this.props.auth.token &&
                <NavItem>
                  <NavLink tag={Link} to="/login/">Login</NavLink>
                </NavItem>
              }
              {
                !this.props.auth.token &&
                <NavItem>
                  <NavLink tag={Link} to="/register/">Register</NavLink>
                </NavItem>
              }
              { !!this.props.auth.token &&
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    { this.props.auth.user ? `Hello, ${this.props.auth.user.first_name}` : 'Profile' }
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem>
                      Option 1
                    </DropdownItem>
                    <DropdownItem>
                      Option 2
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={this.logout.bind(this)}>
                      Logout
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              }
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

export default Header;
