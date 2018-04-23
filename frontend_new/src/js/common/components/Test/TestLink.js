import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

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

class TestLink extends Component {
  static propTypes = {
    test: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.startTest = this.startTest.bind(this);
  }

  startTest(event) {
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
    console.warn(this.props.test);
    if (this.props.test.result) {
      return (
        <Link to={`/tests/${this.props.test.uuid}/details/`} replace>{this.props.test.name}</Link>
      );
    } else if (this.props.test.result === null) {
      console.warn('in else', this.props.test.status, this.props.test.result);
      if (this.props.test.status === 'CLOSED') {
        return (
          <p>{this.props.test.name}</p>
        );
      } else if (this.props.test.status === 'OPEN') {
        return (
          <Link to={`/tests/${this.props.test.uuid}/pre/`} replace>{this.props.test.name}</Link>
        );
      }
    }
    return '';
  }
}

// eslint-disable-next-line no-class-assign
TestLink = graphql(mutation)(TestLink);
export default TestLink;
