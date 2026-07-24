export const ORDERS_QUERY = `#graphql
  query Orders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
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
