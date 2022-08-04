import React from 'react'
import PropTypes from 'prop-types'
import { CURRENT_USER_PROP_TYPES } from 'store/models/Me'
import { RESPONSES } from 'store/models/EventInvitation'
import { PERSON_PROP_TYPES } from 'store/models/Person'
import { find, get, sortBy, isFunction, filter } from 'lodash/fp'
import './PostFooter.scss'
import Icon from 'components/Icon'
import RoundImageRow from 'components/RoundImageRow'
import cx from 'classnames'
import Tooltip from 'components/Tooltip'

export default class PostFooter extends React.PureComponent {
  static propTypes= {
    type: PropTypes.string,
    currentUser: PropTypes.shape(CURRENT_USER_PROP_TYPES),
    commenters: PropTypes.array,
    commentersTotal: PropTypes.number,
    constrained: PropTypes.bool,
    votesTotal: PropTypes.number,
    myVote: PropTypes.bool,
    members: PropTypes.arrayOf(PropTypes.shape(PERSON_PROP_TYPES)),
    voteOnPost: PropTypes.func.isRequired,
    onClick: PropTypes.func
  }

  render () {
    const {
      currentUser,
      commenters,
      commentersTotal,
      constrained,
      donationsLink,
      eventInvitations,
      members,
      myVote,
      postId,
      projectManagementLink,
      type,
      votesTotal
    } = this.props
    const onClick = isFunction(this.props.onClick) ? this.props.onClick : undefined
    const vote = isFunction(this.props.voteOnPost) ? () => this.props.voteOnPost() : undefined

    const eventAttendees = filter(ei => ei.response === RESPONSES.YES, eventInvitations)

    let peopleRowResult

    switch (type) {
      case 'project':
        peopleRowResult = peopleSetup(
          members,
          members.length,
          get('id', currentUser),
          {
            emptyMessage: 'No project members',
            phraseSingular: 'is a member',
            mePhraseSingular: 'are a member',
            pluralPhrase: 'are members'
          }
        )
        break
      case 'event':
        peopleRowResult = peopleSetup(
          eventAttendees,
          eventAttendees.length,
          get('id', currentUser),
          {
            emptyMessage: 'No one is attending yet',
            phraseSingular: 'is attending',
            mePhraseSingular: 'are attending',
            pluralPhrase: 'attending'
          }
        )
        break
      default:
        peopleRowResult = peopleSetup(
          commenters,
          commentersTotal,
          get('id', currentUser),
          {
            emptyMessage: 'Be the first to comment',
            phraseSingular: 'commented',
            mePhraseSingular: 'commented',
            pluralPhrase: 'commented'
          }
        )
    }

    const tooltipId = 'postfooter-tt-' + postId

    const { caption, avatarUrls } = peopleRowResult

    return (
      <div styleName={cx('footer', { constrained })}>
        {donationsLink &&
          <a data-tip='Donate to this project' data-for={tooltipId + '-donate'} styleName='icon-links' href={donationsLink} target='_blank' rel='noreferrer'>
            <Icon green styleName='icon' name='Loans' />
            <Tooltip
              delay={550}
              id={tooltipId + '-donate'}
            />
          </a>}
        {projectManagementLink &&
          <a data-tip='Look at the project management tool' data-for={tooltipId + '-manage'} styleName='icon-links' href={projectManagementLink} target='_blank' rel='noreferrer'>
            <Icon green styleName='icon' name='Mentorship' />
            <Tooltip
              delay={550}
              id={tooltipId + '-manage'}
            />
          </a>}
        <RoundImageRow imageUrls={avatarUrls.slice(0, 3)} styleName='people' onClick={onClick} />
        <span styleName='caption' onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'inherit' }}>
          {caption}
        </span>
        { currentUser ? <a onClick={vote} styleName={cx('vote-button', { voted: myVote })}
          data-tip-disable={myVote} data-tip='Upvote this post so more people see it.' data-for={tooltipId}>
          <Icon name='ArrowUp' styleName='arrowIcon' />
          {votesTotal}
        </a> : '' }
        <Tooltip
          delay={550}
          id={tooltipId}
        />

      </div>
    )
  }
}

export const peopleSetup = (
  people,
  peopleTotal,
  excludePersonId,
  phrases = {
    emptyMessage: 'Be the first to comment',
    phraseSingular: 'commented',
    mePhraseSingular: 'commented',
    pluralPhrase: 'commented'
  }
) => {
  const currentUserIsMember = find(c => c.id === excludePersonId, people)
  const sortedPeople = currentUserIsMember && people.length === 2
    ? sortBy(c => c.id !== excludePersonId, people) // me first
    : sortBy(c => c.id === excludePersonId, people) // me last
  const firstName = person => person.id === excludePersonId ? 'You' : person.name.split(' ')[0]
  const {
    emptyMessage,
    phraseSingular,
    mePhraseSingular,
    pluralPhrase
  } = phrases
  let names = ''
  let phrase = pluralPhrase

  if (sortedPeople.length === 0) return { caption: emptyMessage, avatarUrls: [] }
  if (sortedPeople.length === 1) {
    phrase = currentUserIsMember ? mePhraseSingular : phraseSingular
    names = firstName(sortedPeople[0])
  } else if (sortedPeople.length === 2) {
    names = `${firstName(sortedPeople[0])} and ${firstName(sortedPeople[1])}`
  } else {
    names = `${firstName(sortedPeople[0])}, ${firstName(sortedPeople[1])} and ${peopleTotal - 2} other${peopleTotal - 2 > 1 ? 's' : ''}`
  }
  const caption = `${names} ${phrase}`
  const avatarUrls = people.map(p => p.avatarUrl)
  return { caption, avatarUrls }
}
