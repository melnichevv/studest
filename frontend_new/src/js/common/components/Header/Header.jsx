import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import {
  Button,
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
import * as logout from '../../../actions/authActions';
// import './Header.css';

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

  render() {
    console.warn(this.props);
    console.warn(!this.props.auth.token);
    console.warn(!!this.props.auth.token);
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">Home</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {
                !this.props.auth.token &&
                <NavItem>
                  <NavLink tag={Link} to="/tests/">Tests</NavLink>
                </NavItem>
              }
              {
                !this.props.auth.token &&
                <NavItem>
                  <NavLink tag={Link} to="/login/">Login</NavLink>
                </NavItem>
              }
              { !!this.props.auth.token &&
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    { this.props.auth.user ? this.props.auth.user.get_full_name : 'Profile' }
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem>
                      Option 1
                    </DropdownItem>
                    <DropdownItem>
                      Option 2
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={this.props.logout(this.props.history)}>
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

  // render() {
  //   const { pathname } = this.props.location;
  //   console.warn('props in header', this.props);
  //
  //   const isHome = pathname === '/';
  //   const isJustAnotherPage = pathname === '/page';
  //   const isLoginPage = pathname === '/login';
  //   const isLogoutPage = pathname === '/logout';
  //
  //   return (
  //     <header className="globalHeader">
  //       <ul>
  //         <li className={!isHome ? 'active' : ''}>
  //           {
  //             isHome ?
  //               'Home' : <Link to="/">Home</Link>
  //
  //           }
  //         </li>
  //         <li className={!isJustAnotherPage ? 'active' : ''}>
  //           {
  //             isJustAnotherPage ?
  //               'Just Another Page' : <Link to="/page">Just Another Page</Link>
  //           }
  //         </li>
  //         {
  //           !!this.props.auth.token &&
  //           <li className={!isLoginPage ? 'active' : ''}>
  //             {
  //               isLoginPage ?
  //                 'Login' : <Link to="/login">Log in</Link>
  //             }
  //           </li>
  //         }
  //         {
  //           !this.props.auth.token &&
  //           <li className={!isLogoutPage ? 'active' : ''}>
  //             {
  //               isLogoutPage ?
  //                 'Logout' : <Button color='link' onClick={this.props.unsetCurrentUser}>Log out</Button>
  //             }
  //           </li>
  //         }
  //       </ul>
  //     </header>
  //   );
  // }
}

export default Header;
