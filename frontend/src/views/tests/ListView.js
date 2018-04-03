import React from 'react'
import {Link} from 'react-router-dom'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag';
import queryString from 'query-string'

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
            },
            pageInfo {
                hasNextPage,
                hasPreviousPage,
                startCursor,
                endCursor
            }
        }
    }
`;

class ListView extends React.Component {
    componentWillMount() {
        // Redirect user to login page, if he/she is not authorized (doesn't have token)
        if (!localStorage.token) {
            window.location.replace('/login');
        }
    }

    handleSearchSubmit(e) {
        e.preventDefault();
        let data = new FormData(this.form);
        let query = `?search=${data.get('search')}`;
        this.props.history.push(`/${query}`)
    }


    loadMore() {
      let { data, location } = this.props;
      data.fetchMore({
        query: query,
        variables: {
          search: queryString.parse(location.search).search,
          endCursor: data.allTests.pageInfo.endCursor,
        },
        updateQuery: (prev, next) => {
          const newEdges = next.fetchMoreResult.allTests.edges;
          const pageInfo = next.fetchMoreResult.allTests.pageInfo;
          return {
            allTests: {
              edges: [...prev.allTests.edges, ...newEdges],
              pageInfo,
            },
          }
        },
      })
    }

    render() {
        let {data} = this.props;
        if (data.loading || !data.allTests) {
            return <div>Loading...</div>
        }
        return (
            <div>
                <form
                    ref={ref => (this.form = ref)}
                    onSubmit={e => this.handleSearchSubmit(e)}
                >
                    <input type="text" name="search"/>
                    <button type="submit">Search</button>
                </form>
                {data.allTests.edges.map(item => (
                    <p key={item.node.id}>
                        <Link to={`/tests/${item.node.uuid}/`}>
                            {item.node.name}
                        </Link>
                    </p>
                ))}
                {data.allTests.pageInfo.hasNextPage &&
                <button onClick={() => this.loadMore()}>Load more...</button>}
            </div>
        )
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

ListView = graphql(query, queryOptions)(ListView);
export default ListView
