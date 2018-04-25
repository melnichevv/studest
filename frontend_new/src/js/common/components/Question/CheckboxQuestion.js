import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

import * as testActions from '../../../actions/testActions';
import TextQuestion from "./TextQuestion";

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

// const query = gql`
// {
//   currentUser {
//     id
//   }
// }
// `;

function mapStateToProps(state) {
  console.warn('mptp', this.props, state);
  return {
    ...state,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    ...bindActionCreators(testActions, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class CheckboxQuestion extends Component {
  static propTypes = {
    question: PropTypes.object.isRequired,
    testResult: PropTypes.object,
    readonly: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    const isUpdated = props.test.isUpdated ? props.test.isUpdated : false;
    let { answers } = props.test.answers ? props.test.answers : [];
    if (!isUpdated) {
      answers = props.question.currentAnswer ?
        JSON.parse(props.question.currentAnswer.replace(/'/g, '"')) : [];
    }
    this.state = {
      answers,
      isUpdated,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // only update answers if the data has changed
    if (prevProps.question.currentAnswer !== this.props.question.currentAnswer) {
      this.setState({
        answers: this.props.question.currentAnswer ? this.props.question.currentAnswer : [],
        isUpdated: false,
      });
    }
  }

  handleChange(event) {
    if (this.props.readonly) {
      return;
    }
    let { answers } = this.state;
    if (!answers) {
      answers = [];
    }
    const index = answers.indexOf(event.target.value);
    if (!event.target.checked) {
      if (index > -1) {
        answers.splice(index, 1);
      }
    } else {
      if (index === -1) {
        answers.push(event.target.value);
      }
    }
    this.setState({
      answers,
      isUpdated: true,
    });
    console.warn('this.state', this.state);
    this.props
      .mutate({
        variables: {
          question: this.props.question.uuid,
          answers,
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
    return (
      <div className="checkbox-question">
        <FormGroup tag="div">
          <legend>{this.props.question.question}</legend>
          {this.props.question.answers.edges.map(item => (
            <FormGroup check>
              <Label check>
                <Input
                  type="checkbox"
                  name={this.props.question.uuid}
                  value={item.node.uuid}
                  onChange={this.handleChange}
                  checked={this.state.answers.includes(item.node.uuid)}
                  readOnly={this.props.readonly}
                />
                {item.node.text}
              </Label>
            </FormGroup>
          ))}
        </FormGroup>
      </div>
    );
  }
}

CheckboxQuestion.defaultProps = {
  testResult: {},
  readonly: false,
};

// eslint-disable-next-line no-class-assign
// CheckboxQuestion = graphql(query)(CheckboxQuestion);
// eslint-disable-next-line no-class-assign
CheckboxQuestion = graphql(mutation)(CheckboxQuestion);
export default CheckboxQuestion;
