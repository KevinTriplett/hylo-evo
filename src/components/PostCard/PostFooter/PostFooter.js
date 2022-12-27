import React from 'react'
import { withTranslation, useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { CURRENT_USER_PROP_TYPES } from 'store/models/Me'
import { find, get, sortBy, isFunction } from 'lodash/fp'
import './PostFooter.scss'
import Icon from 'components/Icon'
import RoundImageRow from 'components/RoundImageRow'
import cx from 'classnames'
import Tooltip from 'components/Tooltip'

class PostFooter extends React.PureComponent {
  static propTypes= {
    currentUser: PropTypes.shape(CURRENT_USER_PROP_TYPES),
    commenters: PropTypes.array,
    commentersTotal: PropTypes.number,
    constrained: PropTypes.bool,
    votesTotal: PropTypes.number,
    myVote: PropTypes.bool,
    voteOnPost: PropTypes.func.isRequired,
    onClick: PropTypes.func
  }

  render () {
    const {
      currentUser,
      commenters,
      commentersTotal,
      constrained,
      myVote,
      onClick,
      postId,
      votesTotal
    } = this.props
    const vote = isFunction(this.props.voteOnPost) ? () => this.props.voteOnPost() : undefined

    const tooltipId = 'postfooter-tt-' + postId

    return (
      <div styleName={cx('footer', { constrained })}>
        <PeopleInfo onClick={onClick} people={commenters} peopleTotal={commentersTotal} excludePersonId={get('id', currentUser)} />
        { currentUser ? <a onClick={vote} styleName={cx('vote-button', { voted: myVote })}
          data-tip-disable={myVote} data-tip={this.props.t('Upvote this post so more people see it.')} data-for={tooltipId}>
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

export function PeopleInfo (props) {
  const { t } = useTranslation()
  const {
    people,
    peopleTotal,
    excludePersonId,
    phrases = {
      emptyMessage: t('Be the first to comment'),
      phraseSingular: t('commented'),
      mePhraseSingular: t('commented'),
      pluralPhrase: t('commented')
    },
    onClick
  } = props
  const currentUserIsMember = find(c => c.id === excludePersonId, people)
  const sortedPeople = currentUserIsMember && people.length === 2
    ? sortBy(c => c.id !== excludePersonId, people) // me first
    : sortBy(c => c.id === excludePersonId, people) // me last
  const firstName = person => person.id === excludePersonId ? t('You') : person.name.split(' ')[0]
  const {
    emptyMessage,
    phraseSingular,
    mePhraseSingular,
    pluralPhrase
  } = phrases
  let names = ''
  let phrase = pluralPhrase

  let caption, avatarUrls
  if (sortedPeople.length === 0) {
    caption = emptyMessage
    avatarUrls = []
  } else {
    if (sortedPeople.length === 1) {
      phrase = currentUserIsMember ? mePhraseSingular : phraseSingular
      names = firstName(sortedPeople[0])
    } else if (sortedPeople.length === 2) {
      names = t(`{{personOne}} and {{personTwo}}`, { personOne: firstName(sortedPeople[0]), personTwo: firstName(sortedPeople[1]) })
    } else {
      names = `${firstName(sortedPeople[0])}, ${firstName(sortedPeople[1])} and ${peopleTotal - 2} other${peopleTotal - 2 > 1 ? 's' : ''}`// TODO: Handle this translation
    }
    caption = `${names} ${phrase}`
    avatarUrls = people.map(p => p.avatarUrl)
  }
  return <span styleName='commenters'>
    <RoundImageRow imageUrls={avatarUrls.slice(0, 3)} styleName='people' onClick={onClick} />
    <span styleName='caption' onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'inherit' }}>
      {caption}
    </span>
  </span>
}

export default withTranslation()(PostFooter)
