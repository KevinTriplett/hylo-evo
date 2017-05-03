import React from 'react'
import { debounce, throttle } from 'lodash/fp'

import Icon from 'components/Icon'
import { getKeyCode, keyMap } from 'util/textInput'
import PeopleSelectorMatches from 'components/PeopleSelectorMatches'
import SelectorMatchedItem from 'components/SelectorMatchedItem'
import './PeopleSelector.scss'

const { any, arrayOf, func, shape, string } = React.PropTypes

const personType = shape({
  id: any,
  name: string,
  avatarUrl: string
})

// TODO: This _grossly_ underestimates the problem! See:
// https://www.w3.org/International/questions/qa-personal-names
const invalidPersonName = /[^a-z '-]+/gi

export default class PeopleSelector extends React.Component {
  static propTypes = {
    autocomplete: string,
    fetchPeople: func,
    deleteParticipant: func,
    participants: arrayOf(personType),
    setAutocomplete: func
  }

  constructor (props) {
    super(props)
    this.state = { currentMatch: null }
  }

  componentWillReceiveProps (props) {
    const { matches } = props
    if (!matches) {
      this.setState({ currentMatch: null })
      return
    }

    if (matches.find(m => m.id === this.state.currentMatch)) return
    this.setState({ currentMatch: matches[0].id })
  }

  arrow (direction) {
    let delta = 0
    const idx = this.props.matches.findIndex(m => m.id === this.state.currentMatch)
    if (direction === 'up') {
      if (idx > 0) delta = -1
    }
    if (direction === 'down') {
      if (idx < this.props.matches.length - 1) delta = 1
    }
    this.setState({ currentMatch: this.props.matches[idx + delta].id })
  }

  autocompleteSearch = throttle(1000, this.props.fetchPeople)

  onChange = debounce(200, () => {
    const { value } = this.autocomplete
    if (!invalidPersonName.exec(value)) {
      return this.props.setAutocomplete(value)
    }
    this.autocomplete.value = value.replace(invalidPersonName, '')
  })

  onKeyDown (evt) {
    switch (getKeyCode(evt)) {
      case keyMap.BACKSPACE: return
      case keyMap.UP: return this.arrow('up')
      case keyMap.DOWN: return this.arrow('down')
      case keyMap.COMMA:
      case keyMap.ENTER:
        evt.preventDefault()
        this.autocomplete.value = null
        return this.props.setAutocomplete(null)

      default:
        this.autocompleteSearch(this.autocomplete.value)
    }
  }

  render () {
    const { deleteParticipant, matches, participants } = this.props
    return <div styleName='people-selector'>
      <div styleName='thread-header' tabIndex='0'>
        <div styleName='autocomplete-control'>
          {participants && participants.map(match =>
            <SelectorMatchedItem
              avatarUrl={match.avatarUrl}
              key={match.id}
              name={match.name}
              deleteParticipant={() => deleteParticipant(match.id)} />
          )}
          <input styleName='autocomplete'
            ref={i => this.autocomplete = i} // eslint-disable-line no-return-assign
            type='text'
            spellCheck={false}
            onChange={evt => this.onChange(evt)}
            onKeyDown={evt => this.onKeyDown(evt)}
            placeholder={participants.length ? '' : 'Type in the names of people to message'} />
        </div>
        <Icon name='Ex' styleName='close-button' />
      </div>
      <PeopleSelectorMatches currentMatch={this.state.currentMatch} matches={matches} />
    </div>
  }
}
