import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import queryString from 'query-string';
import { Table } from 'reactstrap';
import { bindActionCreators } from 'redux';
import * as core from '../../actions/coreActions';

import SearchForm from '../core/SearchForm';
import { processDate } from '../../utils/date';
import TestLink from '../../common/components/Test/TestLink';
import { MIN_ITEM_LOAD, TEST_RESULT_STATUSES, TEST_RESULT_STATUS_NEW_PRT } from '../../constants/core';

export const query = gql`
  query ListViewSearch($minItemLoad: Int, $search: String, $endCursor: String) {
    userTests(first: $minItemLoad, name_Icontains: $search, after: $endCursor) {
      edges {
        node {
          id
          name
          description
          created
          startAt
          minutes
          uuid
          status
          result {
            id
            uuid
            status
            result
            startTime
            endTime
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
      /* TODO This causes a warning of bad code. Fixme */
      // const initialSearch = queryString.parse(this.props.location.search).search;
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
    /* Use different links for new, already started and already finished tests */
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
                      <TestLink test={item.node} />
                    </td>
                    <td>
                      {
                        item.node.result ?
                          TEST_RESULT_STATUSES[item.node.result.status] : TEST_RESULT_STATUS_NEW_PRT
                      }
                    </td>
                    <td>
                      {item.node.description}
                    </td>
                    <td>
                      {processDate(item.node.startAt)}
                    </td>
                    <td>
                      {item.node.minutes}m
                    </td>
                    <td>
                      {processDate(item.node.created)}
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
      minItemLoad: MIN_ITEM_LOAD,
      search: queryString.parse(props.location.search).search,
      endCursor: null,
    },
  }),
};

// eslint-disable-next-line no-class-assign
TestsView = graphql(query, queryOptions)(TestsView);
export default TestsView;
