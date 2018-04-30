import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Table, Container, Row, Col, Jumbotron } from 'reactstrap';
import YouTube from 'react-youtube';
import { BeatLoader } from 'react-spinners';

import { processDate } from '../../utils/date';
import RadioQuestion from '../../common/components/Question/RadioQuestion';
import CheckboxQuestion from '../../common/components/Question/CheckboxQuestion';
import TextQuestion from '../../common/components/Question/TextQuestion';
import {
  REFETCH_TIMEOUT,
  TEST_RESULT_STATUS_DONE, TEST_RESULT_STATUS_IN_PROGRESS,
  TEST_RESULT_STATUS_REQUIRES_REVIEW,
} from '../../constants/core';

require('./Tests.css');


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
      refetching: true,
    };
    this.fetchTestResult = this.fetchTestResult.bind(this);
    this.refetchData = this.refetchData.bind(this);
    this.viewTest = this.viewTest.bind(this);
    this.stopViewTest = this.stopViewTest.bind(this);
    this.toggleRefetching = this.toggleRefetching.bind(this);
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
      refetching: this.state.refetching,
    });
  };

  toggleRefetching = () => {
    this.setState(Object.assign({}, this.state, {
      refetching: !this.state.refetching,
    }));
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
    if (!this.state.refetching) {
      setTimeout(this.fetchTestResult, REFETCH_TIMEOUT, testResult);
    }
    else {
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
    }
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
      <Jumbotron>
        <h3 className="display-4 test-title">Test "{data.test.name}"</h3>
        <p className="lead">Description: {data.test.description}</p>
        <hr className="my-2" />
        <div>Status: {data.test.status}</div>
        <div>Time allowed: {data.test.minutes} minutes</div>
        <div>Start at: {processDate(data.test.startAt)}</div>
        <hr className="my-2" />
        <div>
          <div>
            <h4>
              Currently passing this test
              <button onClick={this.toggleRefetching} className="refetching-button">
                {
                  this.state.refetching ? 'Stop' : 'Continue'
                }
              </button>
              {
                this.state.refetching &&
                <p className="refetching-status">
                  <BeatLoader alt="Refetching" />
                </p>
              }
            </h4>
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
                      {testResult.node.uuid === this.state.currentTest ? ' (Viewing)' : ''}
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
          {
            data.test.solvedTests &&
            <button onClick={() => { this.refetchData(true); }} className="force-update-table">
              Force update table
            </button>
          }
        </div>
      </Jumbotron>
    );
    let testBody = '';
    if (this.state.finishing) {
      testBody = (
        <Jumbotron>
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
        </Jumbotron>
      );
    } else {
      const opts = {
        height: '100',
        width: '200',
        playerVars: { // https://developers.google.com/youtube/player_parameters
          autoplay: 0,
        },
      };
      testBody = (
        <Jumbotron>
          {currentTest.questions.edges.map(item => (
            <Row key={item.node.id} className="question-row">
              <Col sm={{ order: 1 }} md={{ size: 6, order: 2 }}>
                <Row>
                  {item.node.imgUrl ?
                    <Col md="auto" sm={{ size: 12 }}>
                      <img src={item.node.imgUrl} alt="" />
                    </Col> : ''
                  }
                  {/*{item.node.audioUrl ? <Col>Audio URL: {item.node.audioUrl}</Col> : ''}*/}
                  {item.node.videoUrl ?
                    <Col md="auto" sm={{ size: 12 }}>
                      <YouTube
                        videoId={item.node.videoUrl}
                        opts={opts}
                      />
                    </Col> : ''
                  }
                  {item.node.otherUrl ?
                    <Col md="auto" sm={{ size: 12 }}>
                      <a href={item.node.otherUrl} target="_blank">Additional info</a>
                    </Col> : ''
                  }
                </Row>
              </Col>
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
            </Row>
          ))}
        </Jumbotron>
      );
    }
    return (
      <Container>
        {testHeader}
        {testBody}
      </Container>
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
