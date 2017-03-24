import { compact } from 'lodash'
import { applyMiddleware, compose } from 'redux'
import createLogger from 'redux-logger'
import promiseMiddleware from 'redux-promise'

import apiMiddleware from './apiMiddleware'
import transformMiddleware from './transformMiddleware'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const middleware = compact([
  apiMiddleware(),
  transformMiddleware,
  promiseMiddleware,
  process.env.NODE_ENV === 'development' && createLogger({collapsed: true})
])

export default composeEnhancers(
  applyMiddleware(...middleware)
)
