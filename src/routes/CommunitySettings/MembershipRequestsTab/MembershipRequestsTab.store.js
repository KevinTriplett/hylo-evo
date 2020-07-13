import {
  FETCH_JOIN_REQUESTS,
  FETCH_JOIN_REQUESTS_PENDING,
  ACCEPT_JOIN_REQUEST,
  DECLINE_JOIN_REQUEST
} from 'store/constants'
import { createSelector as ormCreateSelector } from 'redux-orm'
import orm from 'store/models'
export const MODULE_NAME = 'MembershipRequestsTab'

const defaultState = []

export default function reducer (state = defaultState, action) {
  const { error, type, payload } = action
  if (error) return state

  switch (type) {
    case FETCH_JOIN_REQUESTS_PENDING:
      return null;
    case FETCH_JOIN_REQUESTS:
      const requests = payload.data.joinRequests.items || []
      return requests.filter(r => r.status === 0)
    case ACCEPT_JOIN_REQUEST:
      const { acceptJoinRequest } = payload.data
      return (state || []).filter(item => item.id !== acceptJoinRequest.id)
    case DECLINE_JOIN_REQUEST:
      const { declineJoinRequest } = payload.data
      return (state || []).filter(item => item.id !== declineJoinRequest.id)
    default:
      return state
  }
}

export function fetchJoinRequests (communityId) {
  return {
    type: FETCH_JOIN_REQUESTS,
    graphql: {
      query: `query ($communityId: ID) {
        joinRequests (communityId: $communityId) {
          total
          hasMore
          items {
            id
            status
            createdAt    
            user {
              id
              avatarUrl
              name
              skills {
                items {
                  id
                  name
                }
              }
            }
          }
        }
      }`,
      variables: { communityId }
    },
    meta: {
      communityId
    }
  }
}

export function acceptJoinRequest (joinRequestId, communityId, userId) {
  return {
    type: ACCEPT_JOIN_REQUEST,
    graphql: {
      query: `mutation ($joinRequestId: ID, $communityId: ID, $userId: ID) {
        acceptJoinRequest(joinRequestId: $joinRequestId, communityId: $communityId, userId: $userId) {
          id
        }
      }`,
      variables: { joinRequestId, communityId, userId }
    },
    meta: {
      joinRequestId,
      optimistic: true
    }
  }
}

export function declineJoinRequest (joinRequestId) {
  return {
    type: DECLINE_JOIN_REQUEST,
    graphql: {
      query: `mutation ($joinRequestId: ID) {
        declineJoinRequest(joinRequestId: $joinRequestId) {
          id
        }
      }`,
      variables: { joinRequestId }
    },
    meta: {
      joinRequestId,
      optimistic: true
    }
  }
}
