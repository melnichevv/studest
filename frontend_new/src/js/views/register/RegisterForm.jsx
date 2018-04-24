import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, Field, reduxForm, formValueSelector } from 'redux-form';
import { email, required, minLength2, minLength5 } from '../../utils/validation';


const renderField = ({
  input,
  label,
  type,
  meta: { touched, error, warning },
}) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} placeholder={label} type={type} />
      {touched &&
        ((error && <span className="text-danger">{error}</span>) ||
          (warning && <span className="text-warning">{warning}</span>))}
    </div>
  </div>
);

let RegisterForm = (props) => {
  const { handleSubmit, formErrors } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Field
          name="firstName"
          component={renderField}
          type="text"
          label="First name:"
          validate={[required, minLength2]}
          placeholder="First name"
        />
        {
          formErrors.firstName &&
          <div>
            {formErrors.firstName}
          </div>
        }
      </div>
      <div>
        <Field
          name="lastName"
          component={renderField}
          type="text"
          label="Last name:"
          validate={[required, minLength2]}
          placeholder="Last name"
        />
        {
          formErrors.latName &&
          <div>
            {formErrors.lastName}
          </div>
        }
      </div>
      <div>
        <Field
          name="email"
          component={renderField}
          type="text"
          label="Email:"
          placeholder="Email"
          validate={[required, email]}
          autoComplete="off"
        />
        {
          formErrors.email &&
          <div>
            {formErrors.email}
          </div>
        }
      </div>
      <div>
        <Field
          name="password"
          component={renderField}
          type="password"
          label="Password:"
          validate={[required, minLength5]}
          placeholder="Password"
          autoComplete="off"
        />
        {
          formErrors.password &&
          <div>
            {formErrors.password}
          </div>
        }
      </div>
      {
        formErrors.nonForm &&
        <div className="text-danger">
          {formErrors.nonForm}
        </div>
      }
      <button
        type="submit"
        disabled={props.isFetching}
      >
        Register
      </button>
    </form>
  );
};

RegisterForm = reduxForm({
  form: 'register', // a unique identifier for this form
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
