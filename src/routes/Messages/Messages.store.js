import { createSelector } from 'reselect'
import { createSelector as ormCreateSelector } from 'redux-orm'
import { get, some, isEmpty, includes, pick, uniqueId } from 'lodash/fp'
import { AnalyticsEvents } from 'hylo-utils/constants'
import orm from 'store/models'
import { toRefArray } from 'util/reduxOrmMigration'
import {
  FETCH_MESSAGES,
  FETCH_THREAD,
  FETCH_THREADS,
  UPDATE_THREAD_READ_TIME,
  CREATE_MESSAGE,
  FIND_OR_CREATE_THREAD
} from 'store/constants'
import { makeGetQueryResults } from 'store/reducers/queryResults'
import FindOrCreateThreadMutation from 'graphql/mutations/FindOrCreateThreadMutation.graphql'
import CreateMessageMutation from 'graphql/mutations/CreateMessageMutation.graphql'
import MessageThreadQuery from 'graphql/queries/MessageThreadQuery.graphql'
import MessageThreadMessagesQuery from 'graphql/queries/MessageThreadMessagesQuery.graphql'
import getQuerystringParam from 'store/selectors/getQuerystringParam'

export const MODULE_NAME = 'Messages'
export const UPDATE_MESSAGE_TEXT = `${MODULE_NAME}/UPDATE_MESSAGE_TEXT`
export const SET_THREAD_SEARCH = `${MODULE_NAME}/SET_THREAD_SEARCH`
export const SET_CONTACTS_SEARCH = `${MODULE_NAME}/SET_CONTACTS_SEARCH`

// LOCAL STORE

// Actions

export function setContactsSearch (search) {
  return {
    type: SET_CONTACTS_SEARCH,
    payload: search
  }
}

export function setThreadSearch (threadSearch) {
  return {
    type: SET_THREAD_SEARCH,
    payload: threadSearch
  }
}

export function updateMessageText (messageThreadId, messageText) {
  return {
    type: UPDATE_MESSAGE_TEXT,
    meta: {
      messageThreadId,
      messageText
    }
  }
}

// Selectors

export const moduleSelector = state => state[MODULE_NAME]

export const getContactsSearch = createSelector(
  moduleSelector,
  (state, props) => state.contactsSearch
)

export const getThreadSearch = createSelector(
  moduleSelector,
  (state, props) => get('threadSearch', state)
)

// REDUCER

export const defaultState = {
  contactsSearch: '',
  threadSearch: ''
}

export default function reducer (state = defaultState, action) {
  const { error, type, payload, meta } = action
  if (error) return state

  switch (type) {
    case SET_CONTACTS_SEARCH:
      return { ...state, contactsSearch: payload }
    case SET_THREAD_SEARCH:
      return { ...state, threadSearch: payload }
    case UPDATE_MESSAGE_TEXT:
      return { ...state, [meta.messageThreadId]: meta.messageText }
    default:
      return state
  }
}

// GLOBAL STORE

// ACTIONS (to be moved to /store/actions/*)

export function findOrCreateThread (participantIds, createdAt) {
  return {
    type: FIND_OR_CREATE_THREAD,
    graphql: {
      query: FindOrCreateThreadMutation,
      variables: {
        participantIds,
        // TODO: Remove createdAt generation if not used by Hylo API
        createdAt
      }
    },
    meta: {
      extractModel: 'MessageThread'
    }
  }
}

export function fetchThread (id) {
  return {
    type: FETCH_THREAD,
    graphql: {
      query: MessageThreadQuery,
      variables: {
        id
      }
    },
    meta: {
      extractModel: 'MessageThread',
      extractQueryResults: {
        getType: () => FETCH_MESSAGES,
        getItems: get('payload.data.messageThread.messages')
      }
    }
  }
}

export function fetchMessages (id, opts = {}) {
  return {
    type: FETCH_MESSAGES,
    graphql: {
      query: MessageThreadMessagesQuery,
      variables: opts.cursor ? { id, cursor: opts.cursor } : { id }
    },
    meta: {
      extractModel: 'MessageThread',
      extractQueryResults: {
        getItems: get('payload.data.messageThread.messages')
      },
      id
    }
  }
}

export function createMessage (messageThreadId, messageText, forNewThread) {
  // TODO: Remove createdAt generation if not used by Hylo API
  const createdAt = new Date().getTime().toString()
  return {
    type: CREATE_MESSAGE,
    graphql: {
      query: CreateMessageMutation,
      variables: {
        messageThreadId,
        text: messageText,
        createdAt
      }
    },
    meta: {
      optimistic: true,
      extractModel: 'Message',
      tempId: uniqueId(`messageThread${messageThreadId}_`),
      messageThreadId,
      messageText,
      forNewThread,
      analytics: AnalyticsEvents.DIRECT_MESSAGE_SENT
    }
  }
}

export function updateThreadReadTime (id) {
  return {
    type: UPDATE_THREAD_READ_TIME,
    payload: {
      api: {
        path: `/noo/post/${id}/update-last-read`,
        method: 'POST'
      }
    },
    meta: { id }
  }
}

// Selectors

export function presentPersonListItem (person) {
  return {
    ...pick([ 'id', 'name', 'avatarUrl' ], person.ref),
    community: person.memberships.first()
      ? person.memberships.first().community.name : null
  }
}

// TODO: Handle querystring participants for Members Message button
export function getParticipantSearch (props, participantsFromStore) {
  const participantIds = getQuerystringParam('participants', null, props)
  if (participantIds) {
    return participantIds
      .split(',')
      .filter(pId => !participantsFromStore.find(participant => participant.id === pId))
  }
  return null
}

// TODO: Fix contacts search for Holochain+Apollo and Hylo API
export const getHolochainContactsWithSearch = ormCreateSelector(
  orm,
  state => state.orm,
  (state, props) => p => {
    const contactsSearch = getContactsSearch(state)
    const holoFilter = props.holochainActive ? p.isHoloData : true
    if (!contactsSearch || contactsSearch.length < 1) return holoFilter
    return holoFilter && p.name.toLowerCase().includes(contactsSearch.toLowerCase())
  },
  (session, search = () => true) => {
    return session.Person
      .all()
      .filter(search)
      .toModelArray()
      .map(presentPersonListItem)
      .sort(nameSort)
  }
)

export const getRecentContacts = ormCreateSelector(
  orm,
  state => state.orm,
  session => {
    return session.PersonConnection
      .all()
      .toModelArray()
      .map(connection => presentPersonListItem(connection.person))
      .sort(nameSort)
  }
)

// Threads and Messages

export const getCurrentMessageThreadId = (_, { match }) => match.params.messageThreadId

export const getTextForCurrentMessageThread = createSelector(
  moduleSelector,
  getCurrentMessageThreadId,
  (state, messageThreadId) => state[messageThreadId] || ''
)

export const getCurrentMessageThread = ormCreateSelector(
  orm,
  state => state.orm,
  getCurrentMessageThreadId,
  (session, messageThreadId) => {
    var thread
    try {
      thread = session.MessageThread.get({ id: messageThreadId })
    } catch (e) {
      return null
    }
    return {
      ...thread.ref,
      participants: thread.participants.toModelArray()
    }
  }
)

export const getThreadResults = makeGetQueryResults(FETCH_THREADS)

export const getThreadsHasMore = createSelector(getThreadResults, get('hasMore'))

export const getThreads = ormCreateSelector(
  orm,
  state => state.orm,
  getThreadSearch,
  getThreadResults,
  (session, threadSearch, results) => {
    if (isEmpty(results) || isEmpty(results.ids)) return []
    return session.MessageThread.all()
      .filter(x => includes(x.id, results.ids))
      .filter(filterThreadsByParticipant(threadSearch))
      .orderBy(x => -new Date(x.updatedAt))
      .toModelArray()
  }
)

export const getMessages = createSelector(
  state => orm.session(state.orm),
  getCurrentMessageThreadId,
  (session, messageThreadId) => {
    let messageThread
    try {
      messageThread = session.MessageThread.get({ id: messageThreadId })
    } catch (e) {
      return []
    }
    return messageThread.messages.orderBy(c => Number(c.id)).toModelArray()
  }
)

const getMessageResults = makeGetQueryResults(FETCH_MESSAGES)

export const getMessagesHasMore = createSelector(
  getMessageResults,
  get('hasMore')
)

// Utility

const nameSort = (a, b) => {
  const aName = a.name.toUpperCase()
  const bName = b.name.toUpperCase()
  return aName > bName ? 1 : aName < bName ? -1 : 0
}

export function filterThreadsByParticipant (threadSearch) {
  if (!threadSearch) return () => true

  const threadSearchLC = threadSearch.toLowerCase()
  return thread => {
    const participants = toRefArray(thread.participants)
    const match = name => name.toLowerCase().startsWith(threadSearchLC)
    return some(p => some(match, p.name.split(' ')), participants)
  }
}
