import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as login from '../../actions/authActions';
import LoginForm from './LoginForm';

require('../../../style/index.css');

const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(login, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class LoginView extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
  };

  componentDidMount() {
    console.warn(this.props, this.state);
  }
  handleSubmit = (data, dispatch, form) => {
    console.warn('handleSubmit', data, dispatch, form);
    console.warn(this.props);
    console.warn('this.props');
    return this.props.login(this.props.form.login.values, this.props.history);
  };

  render() {
    return (
      <Fragment>
        <div>
          <h1>LoginView</h1>
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
