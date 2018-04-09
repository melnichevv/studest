import React, { Component } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

export const query = gql`
  query DetailView($uuid: String!) {
    test(uuid: $uuid) {
      name
      description
      minutes
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
        <p>Description: {data.test.description}</p>
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
