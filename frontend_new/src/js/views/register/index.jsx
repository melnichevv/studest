import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as auth from '../../actions/authActions';
import RegisterForm from './RegisterForm';

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

  componentDidMount() {
    console.warn(this.props, this.state);
  }
  handleSubmit = (data, dispatch, form) => {
    console.warn('handleSubmit', data, dispatch, form);
    console.warn(this.props);
    console.warn('this.props');
    return this.props.register(this.props.form.login.values, this.props.history);
  };

  render() {
    return (
      <Fragment>
        <div>
          <h1>Register</h1>
          <RegisterForm
            onSubmit={this.handleSubmit}
          />
        </div>
      </Fragment>
    );
  }
}

export default LoginView;
