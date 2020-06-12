import { get } from 'lodash/fp'
import { createSelector } from 'reselect'
import bboxPolygon from '@turf/bbox-polygon'
import booleanWithin from '@turf/boolean-within'
import { point } from '@turf/helpers'
import { FETCH_MEMBERS_MAP, FETCH_POSTS_MAP } from 'store/constants'
import { POST_TYPES } from 'store/models/Post'
import postsQueryFragment from 'graphql/fragments/postsQueryFragment'
import { makeGetQueryResults, makeQueryResultsModelSelector } from 'store/reducers/queryResults'

export const MODULE_NAME = 'MapExplorer'
export const STORE_FETCH_POSTS_PARAM = `${MODULE_NAME}/STORE_FETCH_POSTS_PARAM`
export const STORE_CLIENT_FILTER_PARAMS = `${MODULE_NAME}/STORE_CLIENT_FILTER_PARAMS`

export const SORT_OPTIONS = [
  { id: 'updated', label: 'Latest' },
  { id: 'votes', label: 'Popular' }
]

const communityPostsQuery = `query (
  $slug: String,
  $sortBy: String,
  $filter: String,
  $search: String,
  $topic: ID,
  $first: Int,
  $offset: Int,
  $boundingBox: [PointInput]
) {
  community(slug: $slug, updateLastViewed: true) {
    id
    slug
    name
    avatarUrl
    bannerUrl
    postCount
    ${postsQueryFragment}
  }
}`

const networkPostsQuery = `query (
  $networkSlug: String,
  $sortBy: String,
  $search: String,
  $filter: String,
  $topic: ID,
  $first: Int,
  $offset: Int,
  $boundingBox: [PointInput]
) {
  network(slug: $networkSlug) {
    id
    ${postsQueryFragment}
  }
}`

const allCommunitiesPostsQuery = `query (
  $sortBy: String,
  $search: String,
  $filter: String,
  $topic: ID,
  $first: Int,
  $offset: Int,
  $boundingBox: [PointInput]
) {
  ${postsQueryFragment}
}`

const membersFragment = `
  members(sortBy: $sortBy, order: "desc", boundingBox: $boundingBox, search: $search) {
    items {
      id
      name
      avatarUrl
      locationObject {
        center {
          lat
          lng
        }
      }
    }
  }
`

const communityMembersQuery = `query (
  $slug: String,
  $sortBy: String,
  $search: String,
  $boundingBox: [PointInput]
) {
  community(slug: $slug, updateLastViewed: true) {
    id
    slug
    name
    avatarUrl
    bannerUrl
    postCount
    ${membersFragment}
  }
}`

const networkMembersQuery = `query (
  $networkSlug: String,
  $sortBy: String,
  $search: String,
  $boundingBox: [PointInput]
) {
  network(slug: $networkSlug) {
    id
    ${membersFragment}
  }
}`

const allCommunitiesMembersQuery = `query (
  $sortBy: String,
  $search: String,
  $boundingBox: [PointInput]
) {
  ${membersFragment}
}`

// actions
export function fetchPosts ({ subject, slug, networkSlug, sortBy, search, filter, topic, boundingBox }) {
  var query, extractModel, getItems

  if (subject === 'community') {
    query = communityPostsQuery
    extractModel = 'Community'
    getItems = get('payload.data.community.posts')
  } else if (subject === 'network') {
    query = networkPostsQuery
    extractModel = 'Network'
    getItems = get('payload.data.network.posts')
  } else if (subject === 'all-communities') {
    query = allCommunitiesPostsQuery
    extractModel = 'Post'
    getItems = get('payload.data.posts')
  } else {
    throw new Error(`FETCH_POSTS_MAP with subject=${subject} is not implemented`)
  }

  return {
    type: FETCH_POSTS_MAP,
    graphql: {
      query,
      variables: {
        slug,
        networkSlug,
        sortBy,
        search,
        filter,
        topic,
        boundingBox
      }
    },
    meta: {
      extractModel,
      extractQueryResults: {
        getItems
      }
    }
  }
}

export function fetchMembers ({ boundingBox, subject, slug, networkSlug, sortBy, search }) {
  var query, extractModel, getItems

  if (subject === 'community') {
    query = communityMembersQuery
    extractModel = 'Community'
    getItems = get('payload.data.community.members')
  } else if (subject === 'network') {
    query = networkMembersQuery
    extractModel = 'Network'
    getItems = get('payload.data.network.members')
  } else if (subject === 'all-communities') {
    query = allCommunitiesMembersQuery
    extractModel = 'User'
    getItems = get('payload.data.people')
  } else {
    throw new Error(`FETCH_MEMBERS_MAP with subject=${subject} is not implemented`)
  }

  return {
    type: FETCH_MEMBERS_MAP,
    graphql: {
      query,
      variables: {
        slug,
        networkSlug,
        sortBy,
        search,
        boundingBox
      }
    },
    meta: {
      extractModel,
      extractQueryResults: {
        getItems
      }
    }
  }
}

export function storeFetchPostsParam (params) {
  return {
    type: STORE_FETCH_POSTS_PARAM,
    payload: params
  }
}

export function storeClientFilterParams (params) {
  return {
    type: STORE_CLIENT_FILTER_PARAMS,
    payload: params
  }
}

// selectors
export const boundingBoxSelector = (state) => {
  return state.MapExplorer.fetchPostsParam ? state.MapExplorer.fetchPostsParam.boundingBox : null
}

export const filterPostTypesSelector = (state) => {
  return state.MapExplorer.clientFilterParams.postTypes
}

export const searchTextSelector = (state) => {
  return state.MapExplorer.clientFilterParams.search
}

export const filterTopicsSelector = (state) => {
  return state.MapExplorer.clientFilterParams.topics
}

export const sortBySelector = (state) => {
  return state.MapExplorer.clientFilterParams.sortBy
}

const getPostResults = makeGetQueryResults(FETCH_POSTS_MAP)

export const getPosts = makeQueryResultsModelSelector(
  getPostResults,
  'Post'
)

export const getPostsByBoundingBox = createSelector(
  getPosts,
  boundingBoxSelector,
  (posts, boundingBox) => {
    if (!boundingBox) {
      return posts
    }

    const bbox = bboxPolygon([boundingBox[0].lng, boundingBox[0].lat, boundingBox[1].lng, boundingBox[1].lat])
    return posts.filter(post => {
      const locationObject = post.locationObject
      if (locationObject) {
        const centerPoint = point([locationObject.center.lng, locationObject.center.lat])
        return booleanWithin(centerPoint, bbox)
      }
      return false
    })
  }
)

export const getPostsFilteredByType = createSelector(
  getPostsByBoundingBox,
  filterPostTypesSelector,
  (posts, filterPostTypes) => posts.filter(post => filterPostTypes[post.type])
)

export const getSearchedPosts = createSelector(
  getPostsFilteredByType,
  searchTextSelector,
  (posts, searchText) => {
    const trimmedText = searchText.trim()
    if (trimmedText === '') return posts
    return posts.filter(post => {
      return post.title.toLowerCase().includes(searchText) ||
             post.details.toLowerCase().includes(searchText) ||
             post.topics.toModelArray().find(topic => topic.name.includes(searchText))
    })
  }
)

export const getFilteredPosts = createSelector(
  getSearchedPosts,
  filterTopicsSelector,
  (posts, filterTopics) => {
    if (filterTopics.length === 0) return posts
    return posts.filter(post => {
      return post.topics.toModelArray().find(pt => filterTopics.find(ft => pt.name === ft.name))
    })
  }
)

export const getSortedFilteredPosts = createSelector(
  getFilteredPosts,
  sortBySelector,
  (posts, sortBy) => {
    // TODO: use createdAt or the same updatedAt which includes comments that is used in the stream?
    return posts.sort((a, b) => sortBy === 'votes' ? b.votesTotal - a.votesTotal : new Date(b.createdAt) - new Date(a.createdAt))
  }
)

const getMemberResults = makeGetQueryResults(FETCH_MEMBERS_MAP)

export const getMembers = makeQueryResultsModelSelector(
  getMemberResults,
  'Person'
)

export const getMembersByBoundingBox = createSelector(
  getMembers,
  boundingBoxSelector,
  (members, boundingBox) => {
    if (!boundingBox) {
      return members
    }

    const bbox = bboxPolygon([boundingBox[0].lng, boundingBox[0].lat, boundingBox[1].lng, boundingBox[1].lat])
    return members.filter(member => {
      const locationObject = member.locationObject
      if (locationObject) {
        const centerPoint = point([locationObject.center.lng, locationObject.center.lat])
        return booleanWithin(centerPoint, bbox)
      }
      return false
    })
  }
)

export const getSortedFilteredMembers = createSelector(
  getMembersByBoundingBox,
  sortBySelector,
  (members, sortBy) => {
    return members
  }
)

export const getCurrentTopics = createSelector(
  getFilteredPosts,
  (posts) => {
    const topics = (posts ? posts.reduce((topics, post) => {
      post.topics.toModelArray().forEach((topic) => { topics[topic.name] = topics[topic.name] ? topics[topic.name] + 1 : 1 })
      return topics
    }, {}) : {})
    const orderedTopics = []
    Object.keys(topics).forEach(key => {
      orderedTopics.push({ 'name': key, 'count': topics[key] })
    })
    return orderedTopics.sort((a, b) => b.count - a.count)
  }
)

// export const getHasMorePosts = createSelector(getPostResults, get('hasMore'))

// reducer
const DEFAULT_STATE = {
  clientFilterParams: {
    postTypes: Object.keys(POST_TYPES).reduce((types, type) => { types[type] = true; return types }, {}),
    search: '',
    sortBy: SORT_OPTIONS[0].id,
    topics: []
  },
  selectedPost: null,
  fetchPostsParam: {
    boundingBox: null
  }
}

export default function (state = DEFAULT_STATE, action) {
  if (action.type === STORE_FETCH_POSTS_PARAM) {
    return {
      ...state,
      fetchPostsParam: action.payload
    }
  }
  if (action.type === STORE_CLIENT_FILTER_PARAMS) {
    return {
      ...state,
      clientFilterParams: { ...state.clientFilterParams, ...action.payload, postTypes: action.payload.postTypes ? { ...action.payload.postTypes } : state.clientFilterParams.postTypes }
    }
  }
  return state
}
