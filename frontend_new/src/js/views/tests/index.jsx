import React, { Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import * as login from '../../actions/authActions';

export const query = gql`
  query ListViewSearch($search: String, $endCursor: String) {
    allTests(first: 2, name_Icontains: $search, after: $endCursor) {
      edges {
        node {
          id
          name
          description
          created
          minutes
          uuid
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
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
    ...bindActionCreators(login, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class TestsView extends Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    isFetching: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    // this.props.getAwesomeCode();
  }
  handleSubmit = (data, dispatch, form) => {
    console.warn('handleSubmit', data, dispatch, form);
    console.warn(this.props);
    console.warn('this.props');
    return this.props.login(this.props.form.login.values, this.props.history);
    // return reduxFormSubmitAction(this.props.login, data);
  };

  render() {
    const { data } = this.props;
    if (data.loading || !data.allTests) {
      return <div>Loading...</div>;
    }
    return (
      <Fragment>
        <h1>Tests</h1>
        <div>
          {/*<form*/}
            {/*ref={ref => (this.form = ref)}*/}
            {/*onSubmit={e => this.handleSearchSubmit(e)}*/}
          {/*>*/}
            {/*<input type="text" name="search" />*/}
            {/*<button type="submit">Search</button>*/}
          {/*</form>*/}
          {data.allTests.edges.map(item => (
            <p key={item.node.id}>
              <Link to={`/tests/${item.node.uuid}/`}>{item.node.name}</Link>
            </p>
          ))}
          {data.allTests.pageInfo.hasNextPage && (
            <button onClick={() => this.loadMore()}>Load more...</button>
          )}
        </div>
      </Fragment>
    );
  }
}


const queryOptions = {
  options: props => ({
    variables: {
      search: queryString.parse(props.location.search).search,
      endCursor: null,
    },
  }),
}

// eslint-disable-next-line no-class-assign
TestsView = graphql(query, queryOptions)(TestsView);
export default TestsView;
