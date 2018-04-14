import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import processDate from '../../utils/date';

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
            type
            question
            imgUrl
            videoUrl
            audioUrl
            otherUrl
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
        <p>Time allowed: {data.test.minutes}</p>
        <p>Start at: {processDate(data.test.startAt)}</p>
        <p>Description: {data.test.description}</p>
        {data.test.questions.edges.map(item => (
          <p key={item.node.id}>
            <p>Type: {item.node.type}</p>
            <p>Question: {item.node.question}</p>
            {item.node.imgUrl ? <p>Image URL: {item.node.imgUrl}</p> : ''}
            {item.node.audioUrl ? <p>Audio URL: {item.node.audioUrl}</p> : ''}
            {item.node.videoURL ? <p>Video URL: {item.node.videoUrl}</p> : ''}
            {item.node.otherURL ? <p>Other URL: {item.node.otherURL}</p> : ''}
          </p>
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
