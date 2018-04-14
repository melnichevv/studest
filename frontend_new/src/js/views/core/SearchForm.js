import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, Field, reduxForm, formValueSelector } from 'redux-form';
import './SearchForm.css';

let SearchForm = (props) => {
  return (
    <form className="search-form" onSubmit={props.handleSubmit}>
      <div>
        <Field
          name="search"
          component="input"
          type="text"
          placeholder="Search for tests"
        />
        <button type="submit">Search</button>
      </div>
    </form>
  );
};

SearchForm = reduxForm({
  form: 'search', // a unique identifier for this form
})(SearchForm);

// Decorate with connect to read form values
const selector = formValueSelector('selectingFormValues'); // <-- same as form name
SearchForm = connect((state) => {
  const search = selector(state, 'search');
  const formValues = getFormValues('search')(state);
  return {
    formValues,
    search,
  };
})(SearchForm);

export default SearchForm;
