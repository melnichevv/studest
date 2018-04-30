import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Container, Row, Col, Jumbotron } from 'reactstrap';

import { processDate } from '../../utils/date';
import RadioQuestion from '../../common/components/Question/RadioQuestion';
import CheckboxQuestion from '../../common/components/Question/CheckboxQuestion';
import TextQuestion from '../../common/components/Question/TextQuestion';
import { TEST_RESULT_STATUS_DONE, TEST_RESULT_STATUS_REQUIRES_REVIEW } from '../../constants/core';

require('./Tests.css');

export const query = gql`
  query DetailView($uuid: String!) {
    testResult(uuid: $uuid) {
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

const mutation = gql`
  mutation FinishTest($test: String!) {
    finishTest(test: $test) {
      status
      testResult {
        uuid
        status
        startTime
        endTime
        result
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
class TestDetailsView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.finishTest = this.finishTest.bind(this);
  }

  finishTest = () => {
    console.warn('finishing test', this.props);
    this.setState({
      finishing: true,
    });
    const testUuid = this.props.data.test.uuid;
    this.props
      .mutate({
        variables: {
          test: testUuid,
        },
      })
      .then((res) => {
        if (res.data.finishTest.status === 200) {
          const { testResult } = res.data.finishTest;
          this.setState({
            finishing: true,
            testResult,
          });
        }
      })
      .catch((err) => {
        console.log('Network error', err);
      });
  };

  render() {
    const { data } = this.props;
    if (data.loading || !data.testResult) {
      return <div>Loading...</div>;
    }
    data.test = data.testResult.test;
    const testHeader = (
      <Jumbotron>
        <h3 className="display-4 test-title">Test "{data.test.name}"</h3>
        <p className="lead">Description: {data.test.description}</p>
        <hr className="my-2" />
        <div>Time allowed: {data.test.minutes} minutes</div>
        <div>Start at: {processDate(data.test.startAt)}</div>
      </Jumbotron>
    );
    let testBody = '';
    if (this.state.finishing) {
      testBody = (
        <Row>
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
        </Row>
      );
    } else {
      testBody = (
        <Jumbotron>
          {data.test.questions.edges.map(item => (
            <Row key={item.node.id} className="question-row">
              <Col sm={{ order: 1 }} md={{ size: 6, order: 2 }}>
                <div>
                  {item.node.imgUrl ? <p>Image URL: {item.node.imgUrl}</p> : ''}
                  {item.node.audioUrl ? <p>Audio URL: {item.node.audioUrl}</p> : ''}
                  {item.node.videoUrl ? <p>Video URL: {item.node.videoUrl}</p> : ''}
                  {item.node.otherUrl ? <p>Other URL: {item.node.otherUrl}</p> : ''}
                </div>
              </Col>
              {item.node.type === 'radio'}
              {
                item.node.type === 'radio' &&
                <RadioQuestion
                  question={item.node}
                  testResult={data.testResult}
                  form={item.node.uuid}
                />
              }
              {
                item.node.type === 'checkbox' &&
                <CheckboxQuestion
                  question={item.node}
                  testResult={data.testResult}
                />
              }
              {
                item.node.type === 'text' &&
                <TextQuestion
                  question={item.node}
                  testResult={data.testResult}
                />
              }
            </Row>
          ))}
          <Row>
            <button onClick={this.finishTest}>
              Finish test
            </button>
          </Row>
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
TestDetailsView = graphql(query, queryOptions)(TestDetailsView);
// eslint-disable-next-line no-class-assign
TestDetailsView = graphql(mutation)(TestDetailsView);
export default TestDetailsView;
