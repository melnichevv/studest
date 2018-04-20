import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Input } from 'reactstrap';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { SAVE_TIMEOUT } from '../../../constants/core';

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
    this.state = {
      currentAnswer: props.question.currentAnswer,
    };
    this.saveResults = this.saveResults.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  saveResults(value) {
    const now = Date.now();
    const diff = now - this.state.lastEdit;
    if (diff >= SAVE_TIMEOUT) {
      this.props
        .mutate({
          variables: {
            question: this.props.question.uuid,
            answers: value,
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
  }

  handleChange(event) {
    this.setState(Object.assign({}, this.state, {
      lastEdit: Date.now(),
      currentAnswer: event.target.value,
    }));

    setTimeout(this.saveResults, SAVE_TIMEOUT, event.target.value);
  }

  render() {
    return (
      <div className="text-question">
        <FormGroup tag="div">
          <legend>{this.props.question.question}</legend>
          <FormGroup>
            <Input
              type="textarea"
              name={this.props.question.uuid}
              id={this.props.question.uuid}
              value={this.state.currentAnswer}
              onChange={this.handleChange}
              rows={Math.max(this.state.currentAnswer.split(/\r*\n/).length, 3)}
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
