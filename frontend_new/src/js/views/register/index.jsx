import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo/index';

import RegisterForm from './RegisterForm';

require('../../../style/index.css');

const mutation = gql`
  mutation register($email: String!, $firstName: String!, $lastName: String!, $password: String!) {
    register(email: $email, firstName: $firstName, lastName: $lastName, password: $password) {
      status
      formErrors
      user {
        id
      }
    }
  }
`;

const mapStateToProps = state => ({
  ...state,
});

@connect(mapStateToProps)
class RegisterView extends Component {
  static propTypes = {
    register: PropTypes.func.isRequired,
  };
  constructor() {
    super();

    this.state = {
      formErrors: {},
    };
  }

  componentDidMount() {
    console.warn(this.props, this.state);
  }
  handleSubmit = () => {
    this.props
      .mutate({
        variables: this.props.form.register.values,
      })
      .then((res) => {
        console.warn('register res', res);
        if (res.data.register.status === 200) {
          if (res.data.register.user) {
            this.props.history.push('/login');
          }
        } else if (res.data.register.formErrors) {
          const formErrors = JSON.parse(res.data.register.formErrors);
          this.setState({
            formErrors,
          });
        }
      })
      .catch((err) => {
        console.log('Network error', err);
      });
    return this.props.register(this.props.form.register.values, this.props.history);
  };

  render() {
    return (
      <Fragment>
        <div>
          <h1>Register</h1>
          <RegisterForm
            onSubmit={this.handleSubmit}
            formErrors={this.state.formErrors}
          />
        </div>
      </Fragment>
    );
  }
}
// eslint-disable-next-line no-class-assign
RegisterView = graphql(mutation)(RegisterView);

export default RegisterView;
