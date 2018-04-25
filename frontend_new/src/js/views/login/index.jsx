import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as auth from '../../actions/authActions';
import LoginForm from './LoginForm';

require('../../../style/index.css');

const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(auth, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class LoginView extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
  };

  handleSubmit = (data, dispatch, form) => {
    return this.props.login(this.props.form.login.values, this.props.history);
  };

  render() {
    return (
      <Fragment>
        <div>
          <h1>Login</h1>
          <LoginForm
            onSubmit={this.handleSubmit}
            // isFetching={this.props.core.isFetching}
          />
        </div>
      </Fragment>
    );
  }
}

export default LoginView;
