import React from 'react'
import { Route, Switch } from 'react-router-dom'
import HyloTipTapEditorMobile from 'components/HyloTipTapEditor/HyloTipTapEditorMobile'

export default function HyloAppRouter () {
  return (
    <Switch>
      <Route
        path='/hyloApp/editor'
        component={routeProps => (
          <HyloTipTapEditorMobile {...routeProps} />
        )}
      />
    </Switch>
  )
}