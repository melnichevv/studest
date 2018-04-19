import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
// import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
// import * as logout from '../../../actions/authActions';
require('./Question.css');

const mutation = gql`
  mutation CreateView($testResult: String!, $question: String!, $answers: [String!]) {
    createQuestionAnswer(testResult: $testResult, question: $question, answers: $answers) {
      status
      formErrors
      answer {
        answer
      }
    }
  }
`;

const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    // ...bindActionCreators(logout, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class TextQuestion extends PureComponent {
  static propTypes = {
    question: PropTypes.object.isRequired,
    testResult: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    console.warn(event.target.value);

    /* TODO Add submit by timeout */
    this.props
      .mutate({
        variables: {
          question: this.props.question.uuid,
          answers: event.target.value,
          testResult: this.props.testResult.uuid,
        },
      })
      .then((res) => {
        console.warn('res', res);
      })
      .catch((err) => {
        console.log('Network error');
      });
  }

  render() {
    // console.warn('text', this.props);
    return (
      <div className="text-question">
        <FormGroup tag="div">
          <legend>{this.props.question.question}</legend>
          <FormGroup>
            <Input
              type="textarea"
              name={this.props.question.uuid}
              id={this.props.question.uuid}
              // value={item.node.uuid}
              onChange={this.handleChange}
            />
          </FormGroup>
        </FormGroup>
      </div>
    );
  }
}


// eslint-disable-next-line no-class-assign
// TextQuestion = graphql(query)(TextQuestion);
// eslint-disable-next-line no-class-assign
TextQuestion = graphql(mutation)(TextQuestion);

export default TextQuestion;
