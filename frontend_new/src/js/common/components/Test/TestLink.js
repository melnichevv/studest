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
    user: PropTypes.object.isRequired,
  };

  render() {
    console.warn(this.props.test);
    if (this.props.user.is_staff) {
      return (
        <Link
          to={`/tests/${this.props.test.uuid}/admin/`}
          replace
        >
          {this.props.test.name}
        </Link>
      );
    }
    if (this.props.test.result) {
      return (
        <Link
          to={`/tests/${this.props.test.result.uuid}/details/`}
          replace
        >
          {this.props.test.name}[{this.props.test.result}
        </Link>
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
