import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { get, omit } from 'lodash/fp'
import { baseUrl, postUrl } from 'util/navigation'

export const mapDispatchToProps = (dispatch, props) => {
  const routeParams = get('match.params', props)

  if (!routeParams) return {}

  const { postId, slug } = routeParams
  const context = props.match.url.includes('public') ? 'public' : ''
  const urlParams = {
    groupSlug: slug,
    ...omit(['postId', 'action', 'groupSlug'], routeParams),
    context
  }
  const closeUrl = postId
    ? postUrl(postId, urlParams)
    : baseUrl(urlParams)

  return {
    closeModal: () => dispatch(push(closeUrl))
  }
}

export default connect(null, mapDispatchToProps)
