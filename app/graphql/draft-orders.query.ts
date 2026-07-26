export const DRAFT_ORDERS_QUERY = `#graphql
  query DraftOrders($first: Int!, $after: String, $query: String) {
    draftOrders(first: $first, after: $after, query: $query, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          status
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          customer {
            id
            displayName
            email
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
