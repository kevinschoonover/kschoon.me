import gql from 'graphql-tag';
import * as ApolloReactCommon from '@apollo/react-common';
import * as ApolloReactHooks from '@apollo/react-hooks';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Checkin = {
  __typename?: 'Checkin';
  id: Scalars['Int'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  reservationCode: Scalars['String'];
  checkinStatus: CheckinStatusEnum;
  log?: Maybe<Scalars['String']>;
};

export type CheckinConnection = {
  __typename?: 'CheckinConnection';
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** A list of edges. */
  edges?: Maybe<Array<Maybe<CheckinEdge>>>;
};

/** An edge in a connection. */
export type CheckinEdge = {
  __typename?: 'CheckinEdge';
  /** The item at the end of the edge */
  node: Checkin;
  /** A cursor for use in pagination */
  cursor: Scalars['String'];
};

export enum CheckinStatusEnum {
  Waiting = 'WAITING',
  Scheduled = 'SCHEDULED',
  Completed = 'COMPLETED',
  Failed = 'FAILED'
}

export type MutationRoot = {
  __typename?: 'MutationRoot';
  createCheckin: Checkin;
  updateCheckinStatus: Checkin;
};


export type MutationRootCreateCheckinArgs = {
  newCheckin: NewCheckin;
};


export type MutationRootUpdateCheckinStatusArgs = {
  id: Scalars['Int'];
  status: CheckinStatusEnum;
};

export type NewCheckin = {
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  reservationCode: Scalars['String'];
};

/** Information about pagination in a connection */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']>;
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']>;
};

export type QueryRoot = {
  __typename?: 'QueryRoot';
  allCheckins: CheckinConnection;
};


export type QueryRootAllCheckinsArgs = {
  after?: Maybe<Scalars['String']>;
  before?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  last?: Maybe<Scalars['Int']>;
};

export type AllCheckinsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllCheckinsQuery = (
  { __typename?: 'QueryRoot' }
  & { allCheckins: (
    { __typename?: 'CheckinConnection' }
    & { edges?: Maybe<Array<Maybe<(
      { __typename?: 'CheckinEdge' }
      & { node: (
        { __typename?: 'Checkin' }
        & Pick<Checkin, 'id' | 'firstName' | 'lastName' | 'reservationCode' | 'checkinStatus'>
      ) }
    )>>> }
  ) }
);

export type CreateCheckinMutationVariables = Exact<{
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  reservationCode: Scalars['String'];
}>;


export type CreateCheckinMutation = (
  { __typename?: 'MutationRoot' }
  & { createCheckin: (
    { __typename?: 'Checkin' }
    & Pick<Checkin, 'id' | 'firstName' | 'lastName' | 'reservationCode' | 'checkinStatus'>
  ) }
);


export const AllCheckinsDocument = gql`
    query allCheckins {
  allCheckins {
    edges {
      node {
        id
        firstName
        lastName
        reservationCode
        checkinStatus
      }
    }
  }
}
    `;

/**
 * __useAllCheckinsQuery__
 *
 * To run a query within a React component, call `useAllCheckinsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllCheckinsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllCheckinsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllCheckinsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AllCheckinsQuery, AllCheckinsQueryVariables>) {
        return ApolloReactHooks.useQuery<AllCheckinsQuery, AllCheckinsQueryVariables>(AllCheckinsDocument, baseOptions);
      }
export function useAllCheckinsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AllCheckinsQuery, AllCheckinsQueryVariables>) {
          return ApolloReactHooks.useLazyQuery<AllCheckinsQuery, AllCheckinsQueryVariables>(AllCheckinsDocument, baseOptions);
        }
export type AllCheckinsQueryHookResult = ReturnType<typeof useAllCheckinsQuery>;
export type AllCheckinsLazyQueryHookResult = ReturnType<typeof useAllCheckinsLazyQuery>;
export type AllCheckinsQueryResult = ApolloReactCommon.QueryResult<AllCheckinsQuery, AllCheckinsQueryVariables>;
export const CreateCheckinDocument = gql`
    mutation createCheckin($firstName: String!, $lastName: String!, $reservationCode: String!) {
  createCheckin(newCheckin: {firstName: $firstName, lastName: $lastName, reservationCode: $reservationCode}) {
    id
    firstName
    lastName
    reservationCode
    checkinStatus
  }
}
    `;
export type CreateCheckinMutationFn = ApolloReactCommon.MutationFunction<CreateCheckinMutation, CreateCheckinMutationVariables>;

/**
 * __useCreateCheckinMutation__
 *
 * To run a mutation, you first call `useCreateCheckinMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCheckinMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCheckinMutation, { data, loading, error }] = useCreateCheckinMutation({
 *   variables: {
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *      reservationCode: // value for 'reservationCode'
 *   },
 * });
 */
export function useCreateCheckinMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateCheckinMutation, CreateCheckinMutationVariables>) {
        return ApolloReactHooks.useMutation<CreateCheckinMutation, CreateCheckinMutationVariables>(CreateCheckinDocument, baseOptions);
      }
export type CreateCheckinMutationHookResult = ReturnType<typeof useCreateCheckinMutation>;
export type CreateCheckinMutationResult = ApolloReactCommon.MutationResult<CreateCheckinMutation>;
export type CreateCheckinMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateCheckinMutation, CreateCheckinMutationVariables>;