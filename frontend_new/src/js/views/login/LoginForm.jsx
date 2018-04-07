import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, Field, reduxForm, formValueSelector } from 'redux-form';

let LoginForm = (props) => {
  console.warn('props in LoginForm', props);
  return (
    <form onSubmit={props.handleSubmit}>
      <div>
        <div>
          {props.isFetching && 'qwe' }
          {!props.isFetching && 'asd' }
        </div>
        <label>Username:</label>
        <Field
          name="username"
          component="input"
          type="text"
          placeholder="Username"
        />
      </div>
      <div>
        <label>Password:</label>
        <Field
          name="password"
          component="input"
          type="password"
          placeholder="Password"
        />
      </div>
      <button
        type="submit"
        disabled={props.isFetching}
      >
        Login
      </button>
    </form>
  );
};

LoginForm = reduxForm({
  form: 'login', // a unique identifier for this form
})(LoginForm);

// Decorate with connect to read form values
const selector = formValueSelector('selectingFormValues'); // <-- same as form name
LoginForm = connect((state) => {
  const { username, password } = selector(state, 'username', 'password');
  const formValues = getFormValues('login')(state);
  return {
    username,
    password,
    formValues,
  };
})(LoginForm);

export default LoginForm;
