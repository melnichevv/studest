import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import { Table } from 'reactstrap';
import { bindActionCreators } from 'redux';
import * as core from '../../actions/coreActions';

import SearchForm from '../core/SearchForm';
import processDate from '../../utils/date';

export const query = gql`
  query ListViewSearch($search: String, $endCursor: String, $status: String) {
    userTests(first: 2, test_Name_Icontains: $search, after: $endCursor, status: $status) {
      edges {
        node {
          id
          uuid
          status
          result
          startTime
          endTime
          test {
            id
            name
            description
            created
            startAt
            minutes
            uuid
          }
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
    coreActions: bindActionCreators(core, dispatch),
  };
}

@connect(mapStateToProps, mapDispatchToProps)
class TestsView extends Component {
  static propTypes = {
  };

  componentDidMount() {
    const initialSearch = queryString.parse(this.props.location.search).search;
    this.props.coreActions.saveSearch(initialSearch);
  }

  handleSubmit = () => {
    const formData = this.props.form.search.values;
    const searchQuery = `?search=${formData ? formData.search : ''}`;
    this.props.history.push(`/tests/${searchQuery}`);
  };

  render() {
    const { data } = this.props;
    if (data.loading) {
      const initialSearch = queryString.parse(this.props.location.search).search;
      /* TODO This causes a warning of bad code. Fixme */
      // if (this.props.core.search !== initialSearch) {
      //   this.props.coreActions.saveSearch(initialSearch);
      // }
      return (
        <Fragment>
          <h1>Tests</h1>
          <div>
            <SearchForm onSubmit={this.handleSubmit} />
            <Table striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Start at</th>
                  <th>Time allowed</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th colSpan="6">Loading...</th>
                </tr>
              </tbody>
            </Table>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <h1>Tests</h1>
        <div>
          <SearchForm onSubmit={this.handleSubmit} />
          <Table striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Description</th>
                <th>Start at</th>
                <th>Time allowed</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {
                data.userTests &&
                data.userTests.edges.length > 0 &&
                data.userTests.edges.map(item => (
                  <tr key={item.node.id}>
                    <td>
                      <Link to={`/tests/${item.node.uuid}/details/`} replace>{item.node.test.name}</Link>
                    </td>
                    <td>
                      {item.node.status}
                    </td>
                    <td>
                      {item.node.test.description}
                    </td>
                    <td>
                      {processDate(item.node.test.startAt)}
                    </td>
                    <td>
                      {item.node.test.minutes}m
                    </td>
                    <td>
                      {processDate(item.node.test.created)}
                    </td>
                  </tr>
                ))
              }
              {
                (!data.userTests || data.userTests.edges.length === 0) &&
                <tr>
                  <td colSpan="5">
                    No tests
                  </td>
                </tr>
              }
            </tbody>
          </Table>
          {data.userTests && data.userTests.pageInfo.hasNextPage && (
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
};

// eslint-disable-next-line no-class-assign
TestsView = graphql(query, queryOptions)(TestsView);
export default TestsView;
