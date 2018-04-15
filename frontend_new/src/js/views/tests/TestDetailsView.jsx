import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import processDate from '../../utils/date';
import RadioQuestion from '../../common/components/Question/RadioQuestion';
import CheckboxQuestion from '../../common/components/Question/CheckboxQuestion';
import TextQuestion from "../../common/components/Question/TextQuestion";

export const query = gql`
  query DetailView($uuid: String!) {
    test(uuid: $uuid) {
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
            answers {
              edges {
                node {
                  id
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
  render() {
    const { data } = this.props;
    if (data.loading || !data.test) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <h1>Test "{data.test.name}"</h1>
        <div>Time allowed: {data.test.minutes}</div>
        <div>Start at: {processDate(data.test.startAt)}</div>
        <div>Description: {data.test.description}</div>
        {data.test.questions.edges.map(item => (
          <div key={item.node.id}>
            {item.node.imgUrl ? <p>Image URL: {item.node.imgUrl}</p> : ''}
            {item.node.audioUrl ? <p>Audio URL: {item.node.audioUrl}</p> : ''}
            {item.node.videoURL ? <p>Video URL: {item.node.videoUrl}</p> : ''}
            {item.node.otherURL ? <p>Other URL: {item.node.otherURL}</p> : ''}
            {item.node.type === 'radio'}
            {
              item.node.type === 'radio' && <RadioQuestion question={item.node} form={item.node.uuid} />
            }
            {
              item.node.type === 'checkbox' && <CheckboxQuestion question={item.node} />
            }
            {
              item.node.type === 'text' && <TextQuestion question={item.node} />
            }
          </div>
        ))}
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
