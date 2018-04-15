import React from 'react';
import { connect } from 'react-redux';
import { getFormValues, Field, reduxForm, formValueSelector } from 'redux-form';
import { FormGroup, Label, Input } from 'reactstrap';

let RadioQuestionForm = (props) => {
  return (
    <form>
      <legend>{props.question.question}</legend>
      {props.question.answers.edges.map(item => (
        <Label check>
          <Field
            name={props.question.uuid}
            component="input"
            type="radio"
            onChange={props.handleChange}
          />
          {item.node.text}
        </Label>
      ))}
    </form>
  );
};

RadioQuestionForm = reduxForm({
})(RadioQuestionForm);

// Decorate with connect to read form values
// const selector = formValueSelector('selectingFormValues'); // <-- same as form name
RadioQuestionForm = connect((state) => {
  console.warn('state in RQF', state);
  // const { username, password } = selector(state, 'username', 'password');
  // const formValues = getFormValues('login')(state);
  return {
    // username,
    // password,
    // formValues,
  };
})(RadioQuestionForm);

export default RadioQuestionForm;
