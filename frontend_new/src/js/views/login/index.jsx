import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as login from '../../actions/authActions';
import LoginForm from './LoginForm';

import { bindActionCreators } from 'redux';

require('../../../style/index.css');


// const mapStateToProps = function (state) {
//   console.warn('state in mapStateToProps', state, state.isFetching);
//   return {
//     ...state,
//   };
// };
const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(login, dispatch),
  };
}
// export const reduxFormSubmitAction = (actionFn, data) => {
//   // redux-form can track submitting process itself,
//   // but it requires a promise returned.
//   const promise = new Promise((onSuccess, onError) => {
//     actionFn({ data, onSuccess, onError });
//   });
//   return promise.catch((errors) => {
//     // it's a common pattern for redux-form
//     // to raise `SubmissionError` if there're errors
//     // throw new SubmissionError(errors);
//   });
// };

@connect(mapStateToProps, mapDispatchToProps)
class LoginView extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
    // example: PropTypes.object.isRequired,
  };

  componentDidMount() {
    // this.props.getAwesomeCode();
  }
  handleSubmit = (data, dispatch, form) => {
    console.warn('handleSubmit', data, dispatch, form);
    console.warn(this.props);
    console.warn('this.props');
    return this.props.login(this.props.form.login.values, this.props.history);
    // return reduxFormSubmitAction(this.props.login, data);
  };

  render() {
    return (
      <Fragment>
        <div>
          <h1>LoginView</h1>
          <LoginForm onSubmit={this.handleSubmit} isFetching={this.props.core.isFetching} />
        </div>
      </Fragment>
    );
  }
}

export default LoginView;

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(LoginView);
