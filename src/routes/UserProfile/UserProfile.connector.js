import { get } from 'lodash/fp'
import { createSelector as ormCreateSelector } from 'redux-orm'
import { connect } from 'react-redux'

import { fetchPerson } from './UserProfile.actions'
import orm from 'store/models'

export function getPerson (id) {
  return ormCreateSelector(orm, session => {
    if (session.Person.hasId(id)) {
      return session.Person.withId(id).withRefs
    }
    return {
      name: ''
    }
  })
}

export function mapStateToProps ({ orm }, { match }) {
  const id = get('params.id', match)
  return {
    id,
    person: getPerson(id)(orm)
  }
}

export default connect(mapStateToProps, { fetchPerson })
