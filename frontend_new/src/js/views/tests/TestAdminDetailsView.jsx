import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Table } from 'reactstrap';

import { processDate } from '../../utils/date';
import RadioQuestion from '../../common/components/Question/RadioQuestion';
import CheckboxQuestion from '../../common/components/Question/CheckboxQuestion';
import TextQuestion from '../../common/components/Question/TextQuestion';
import {
  REFETCH_TIMEOUT,
  TEST_RESULT_STATUS_DONE, TEST_RESULT_STATUS_IN_PROGRESS,
  TEST_RESULT_STATUS_REQUIRES_REVIEW,
} from '../../constants/core';

export const query = gql`
  query TestDetailView($uuid: String!) {
    test(uuid: $uuid) {
      name
      description
      minutes
      status
      startAt
      uuid
      solvedTests {
        edges {
          node {
            uuid
            user {
              firstName
              lastName
              email
              id
            }
            status
            result
            startTime
            endTime
          }
        }
      }
      questions {
        edges {
          node {
            id
            uuid
            type
            question
            imgUrl
            videoUrl
            audioUrl
            otherUrl
#            currentAnswer
            answers {
              edges {
                node {
                  id
                  uuid
                  text
                  correct
                }
              }
            }
          }
        }
      }
    }
  }
`;

const testResultQuery = gql`
  query TestResultDetailView($uuid: String!, $userId: String) {
    testResult(uuid: $uuid, userId: $userId) {
      id
      uuid
      status
      result
      startTime
      endTime
      test {
        name
        description
        minutes
        startAt
        uuid
        questions {
          edges {
            node {
              id
              uuid
              type
              question
              imgUrl
              videoUrl
              audioUrl
              otherUrl
              currentAnswer
              answers {
                edges {
                  node {
                    id
                    uuid
                    text
                    correct
                  }
                }
              }
            }
          }
        }
      }
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
class TestAdminDetailsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      testResult: {},
      switchingUser: false,
      currentTest: null,
      forceStop: false,
    };
    this.fetchTestResult = this.fetchTestResult.bind(this);
    this.refetchData = this.refetchData.bind(this);
    this.viewTest = this.viewTest.bind(this);
    this.stopViewTest = this.stopViewTest.bind(this);
  }

  componentDidMount() {
    this.refetchData();
  }

  refetchData = (noTimeout = false) => {
    if (this.props.data) {
      console.warn('refetching data');
      this.props.data.refetch();
      if (!noTimeout) {
        setTimeout(this.refetchData, REFETCH_TIMEOUT);
      }
    } else {
      console.warn('scheduled refetching because no this.props.data', this.props.data);
      if (!noTimeout) {
        setTimeout(this.refetchData, REFETCH_TIMEOUT);
      }
    }
  };

  stopViewTest = () => {
    this.setState({
      testResult: {},
      switchingUser: false,
      currentTest: null,
      forceStop: true,
    });
  };

  viewTest = (testResult) => {
    this.setState(Object.assign({}, this.state, {
      currentTest: testResult.uuid,
      forceStop: false,
    }));
    this.fetchTestResult(testResult);
  };

  fetchTestResult = (testResult) => {
    console.warn('fetchTestResult', testResult, this.state);
    this.props.client.query({
      query: testResultQuery,
      variables: {
        uuid: testResult.uuid,
        userId: testResult.user.id,
      },
      fetchPolicy: 'network-only',
    })
      .then((res) => {
        if (res.data) {
          if (!this.state.forceStop && (this.state.currentTest === testResult.uuid)) {
            this.setState(Object.assign({}, this.state, {
              testResult: res.data.testResult,
              switchingUser: false,
              currentTest: res.data.testResult.uuid,
            }));
            if (res.data.testResult.status === TEST_RESULT_STATUS_IN_PROGRESS) {
              setTimeout(this.fetchTestResult, REFETCH_TIMEOUT, testResult);
            }
          }
        }
      })
      .catch((err) => {
        this.setState(Object.assign({}, this.state, {
          testResult: {},
          switchingUser: false,
          currentTest: null,
        }));
        console.log('Network error', err);
      });
  };

  render() {
    const { data } = this.props;
    if (data.loading || !data.test) {
      return <div>Loading...</div>;
    }
    let currentTest = data.test;
    if (this.state.testResult && this.state.testResult.test) {
      currentTest = this.state.testResult.test;
    }
    const testHeader = (
      <div>
        <h2 className="test-title">Test "{data.test.name}"</h2>
        <div>Time allowed: {data.test.minutes}</div>
        <div>Start at: {processDate(data.test.startAt)}</div>
        <div>Description: {data.test.description}</div>
        <div>
          <div className="force-update-table">
            <h4>
              Currently passing this test
            </h4>
            <button onClick={() => { this.refetchData(true); }}>
              Force update
            </button>
          </div>
          {
            data.test.solvedTests &&
            <Table striped>
              <thead>
                <tr>
                  <th>
                    User
                  </th>
                  <th>
                    Started at
                  </th>
                  <th>
                    Ended at
                  </th>
                  <th>
                    Result
                  </th>
                  <th>
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.test.solvedTests.edges.map(testResult => (
                  <tr>
                    <td>
                      {testResult.node.user.firstName} {testResult.node.user.lastName}
                    </td>
                    <td>
                      {testResult.node.startTime && processDate(testResult.node.startTime)}
                    </td>
                    <td>
                      {testResult.node.endTime && processDate(testResult.node.endTime)}
                    </td>
                    <td>
                      {
                        testResult.node.endTime && testResult.node.result &&
                        <p>{testResult.node.result}</p>
                      }
                    </td>
                    <td>
                      {
                        testResult.node.uuid !== this.state.currentTest &&
                        <button
                          onClick={() => { this.viewTest(testResult.node, true, false); }}
                          disabled={this.state.switchingUser}
                        >
                          View
                        </button>
                      }
                      {
                        testResult.node.uuid === this.state.currentTest &&
                        <button
                          onClick={this.stopViewTest}
                        >
                          Stop
                        </button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          }
        </div>
      </div>
    );
    let testBody = '';
    if (this.state.finishing) {
      testBody = (
        <div>
          <h3>
            Well done!
            {
              !this.state.testResult &&
              <div>
                Sending your results. Please wait.
              </div>
            }
            {
              this.state.testResult &&
              <div>
                {
                  this.state.testResult.status === TEST_RESULT_STATUS_DONE &&
                    <div>
                      Your result is {this.state.testResult.result}
                    </div>
                }
                {
                  this.state.testResult.status === TEST_RESULT_STATUS_REQUIRES_REVIEW &&
                    <div>
                      You will receive an email with your results soon.
                      Please be patient (:
                    </div>
                }
              </div>
            }
          </h3>
        </div>
      );
    } else {
      testBody = (
        <div>
          {currentTest.questions.edges.map(item => (
            <div key={item.node.id}>
              {item.node.imgUrl ? <p>Image URL: {item.node.imgUrl}</p> : ''}
              {item.node.audioUrl ? <p>Audio URL: {item.node.audioUrl}</p> : ''}
              {item.node.videoURL ? <p>Video URL: {item.node.videoUrl}</p> : ''}
              {item.node.otherURL ? <p>Other URL: {item.node.otherURL}</p> : ''}
              {item.node.type === 'radio'}
              {
                item.node.type === 'radio' &&
                <RadioQuestion
                  question={item.node}
                  testResult={this.state.testResult}
                  readonly={this.props.auth.user.is_staff}
                />
              }
              {
                item.node.type === 'checkbox' &&
                <CheckboxQuestion
                  question={item.node}
                  testResult={this.state.testResult}
                  readonly={this.props.auth.user.is_staff}
                />
              }
              {
                item.node.type === 'text' &&
                <TextQuestion
                  question={item.node}
                  testResult={this.state.testResult}
                  readonly={this.props.auth.user.is_staff}
                />
              }
            </div>
          ))}
        </div>
      );
    }
    return (
      <div>
        {testHeader}
        {testBody}
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
TestAdminDetailsView = graphql(query, queryOptions)(TestAdminDetailsView);
// eslint-disable-next-line no-class-assign
TestAdminDetailsView = withApollo(TestAdminDetailsView);
export default TestAdminDetailsView;

/*
READ THIS
https://github.com/apollographql/apollo-client/blob/master/docs/source/basics/queries.md#datasubscribetomoreoptions
 */
