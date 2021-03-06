import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

export const query = gql`
  query DetailView($id: ID!) {
    message(id: $id) {
      id
      creationDate
      message
    }
  }
`;

class DetailView extends React.Component {
  render() {
    let { data } = this.props;
    if (data.loading || !data.message) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <h1>Message {data.message.id}</h1>
        <p>{data.message.creationDate}</p>
        <p>{data.message.message}</p>
      </div>
    );
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    }
  })
};

// eslint-disable-next-line no-class-assign
DetailView = graphql(query, queryOptions)(DetailView);
export default DetailView;
