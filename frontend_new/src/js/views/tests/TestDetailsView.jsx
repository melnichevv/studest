import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { processDate } from '../../utils/date';
import RadioQuestion from '../../common/components/Question/RadioQuestion';
import CheckboxQuestion from '../../common/components/Question/CheckboxQuestion';
import TextQuestion from '../../common/components/Question/TextQuestion';

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
class TestDetailsView extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = () => {
    console.warn('finishing test');
    this.setState({
      finishing: true,
    });
    /* Call finish mutation here */
  };

  render() {
    const { data } = this.props;
    if (data.loading || !data.testResult) {
      return <div>Loading...</div>;
    }
    data.test = data.testResult.test;
    const testHeader = (
      <div>
        <h2 className="test-title">Test "{data.test.name}"</h2>
        <div>Time allowed: {data.test.minutes}</div>
        <div>Start at: {processDate(data.test.startAt)}</div>
        <div>Description: {data.test.description}</div>
      </div>
    );
    let testBody = '';
    if (this.state.finishing) {
      testBody = (
        <div>
          <h3>
            Well done!
            You will receive an email with your results soon.
            Please be patient (:
          </h3>
        </div>
      );
    } else {
      testBody = (
        <div>
          {data.test.questions.edges.map(item => (
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
            </div>
          ))}
          <div>
            <button onClick={this.handleSubmit}>
              Finish test
            </button>
          </div>
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
TestDetailsView = graphql(query, queryOptions)(TestDetailsView);
export default TestDetailsView;
