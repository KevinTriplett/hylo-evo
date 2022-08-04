import React from 'react'
import PostTitle from '../PostTitle'
import PostDetails from '../PostDetails'
import cx from 'classnames'
import './PostBody.scss'

export default function PostBody (props) {
  const {
    slug,
    expanded,
    className,
    constrained,
    highlightProps,
    post
  } = props

  return <div styleName={cx('body', { smallMargin: !expanded }, { constrained })} className={className}>
    <PostTitle
      {...post}
      highlightProp={highlightProps}
      constrained={constrained}
    />
    <PostDetails
      {...post}
      slug={slug}
      highlightProp={highlightProps}
      expanded={expanded}
      constrained={constrained}
    />
  </div>
}
