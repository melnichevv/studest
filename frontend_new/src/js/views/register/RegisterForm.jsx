import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, Field, reduxForm, formValueSelector } from 'redux-form';

let RegisterForm = (props) => {
  return (
    <form onSubmit={props.handleSubmit}>
      <div>
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

RegisterForm = reduxForm({
  form: 'login', // a unique identifier for this form
})(RegisterForm);

// Decorate with connect to read form values
const selector = formValueSelector('selectingFormValues'); // <-- same as form name
RegisterForm = connect((state) => {
  const { username, password } = selector(state, 'username', 'password');
  const formValues = getFormValues('login')(state);
  return {
    username,
    password,
    formValues,
  };
})(RegisterForm);

export default RegisterForm;
