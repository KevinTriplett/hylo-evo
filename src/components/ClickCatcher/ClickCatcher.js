import React from 'react'
import { useHistory } from 'react-router-dom'
import { PathHelpers } from 'hylo-shared'

export default function ClickCatcher ({ handleMouseOver, groupSlug, ...props }) {
  const history = useHistory()

  return React.createElement('span', { ...props, onClick: handleClick(history.push, groupSlug) })
}

export const handleClick = (push, groupSlug) => event => {
  const element = event.target

  switch (element?.nodeName.toLowerCase()) {
    case 'span': {
      if (element.classList.contains('mention')) {
        return push(PathHelpers.mentionPath(element.getAttribute('data-id'), groupSlug))
      }
      if (element.classList.contains('topic')) {
        return push(PathHelpers.topicPath(element.getAttribute('data-label'), groupSlug))
      }

      break
    }

    // // TODO: Move to processHTML on backend
    // case 'a': {
    //   const mentionMatch = element.getAttribute('href').match(/(topics|members)\/(.*)$/)

    //   if (mentionMatch) {
    //     event.preventDefault()

    //     const pathFunc = mentionMatch[1] === 'topics' ? PathHelpers.topicPath : PathHelpers.mentionPath

    //     return push(pathFunc(mentionMatch[2], groupSlug))
    //   }

    //   // Any link with `target='_self'` will be handled by React Router
    //   if (element.getAttribute('target') === '_self') {
    //     event.preventDefault()

    //     return push(element.getAttribute('href'))
    //   }
    // }
  }
}
