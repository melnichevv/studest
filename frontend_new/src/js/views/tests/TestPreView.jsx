import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { processDate, toMoment } from '../../utils/date';
import {TEST_RESULT_STATUS_IN_PROGRESS} from "../../constants/core";

export const query = gql`
  query DetailView($uuid: String!) {
    test(uuid: $uuid) {
      id
      name
      description
      created
      startAt
      minutes
      uuid
      status
      result {
        id
        uuid
        status
        result
        startTime
        endTime
      }
    }
  }
`;

const mutation = gql`
  mutation StartTest($test: String!) {
    startTest(test: $test) {
      status
    }
  }
`;

require('../../../style/index.css');

const mapStateToProps = state => ({
  ...state,
});

function mapDispatchToProps(dispatch) {
  return {
    // ...bindActionCreators(login, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class TestPreView extends Component {
  constructor(props) {
    super(props);
    this.startTest = this.startTest.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.data.loading && this.props.data.loading) {
      if (
        nextProps.data.test.result &&
        nextProps.data.test.result.status === TEST_RESULT_STATUS_IN_PROGRESS
      ) {
        /* Redirect user to test solving page if test is in progress */
        const testUuid = nextProps.data.test.uuid;
        this.props.history.push(`/tests/${testUuid}/details`);
      }
    }
  }

  startTest() {
    const { data } = this.props;
    const testUuid = data.test.uuid;
    this.props
      .mutate({
        variables: {
          test: testUuid,
        },
      })
      .then((res) => {
        if (res.data.startTest.status === 200) {
          console.warn('res', res);
          this.props.history.push(`/tests/${testUuid}/details`);
        }
      })
      .catch((err) => {
        console.log('Network error');
      });
  }

  render() {
    const { data } = this.props;
    if (data.loading || !data.test) {
      return <div>Loading...</div>;
    }
    let startButton = '';
    if (data.test.status === 'OPEN') {
      startButton = (
        <div>
          <button onClick={this.startTest}>Start test</button>
        </div>
      );
    }
    return (
      <div>
        <h1>Test "{data.test.name}"</h1>
        <div>Time allowed: {data.test.minutes}</div>
        <div>Start at: {processDate(data.test.startAt)}</div>
        <div>Description: {data.test.description}</div>
        {startButton}
      </div>
    );
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      uuid: props.match.params.uuid,
    },
  }),
};

// eslint-disable-next-line no-class-assign
TestPreView = graphql(query, queryOptions)(TestPreView);
// eslint-disable-next-line no-class-assign
TestPreView = graphql(mutation)(TestPreView);
export default TestPreView;
