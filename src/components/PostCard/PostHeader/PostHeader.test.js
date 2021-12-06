import PostHeader, { TopicsLine } from './PostHeader'
import { shallow } from 'enzyme'
import React from 'react'

it('matches snapshot', () => {
  const creator = {
    name: 'JJ',
    avatarUrl: 'foo.png',
    id: 123
  }
  const context = {
    label: 'some context',
    url: '/foo/bar'
  }

  const groups = [
    {
      name: 'FooC', slug: 'fooc'
    },
    {
      name: 'BarC', slug: 'barc'
    }
  ]

  const wrapper = shallow(<PostHeader groups={groups} creator={creator} />)
  expect(wrapper).toMatchSnapshot()
  wrapper.setProps({ context, type: 'request', groups })
  expect(wrapper).toMatchSnapshot()
  wrapper.setProps({ deletePost: () => {}, editPost: () => {} })
  expect(wrapper).toMatchSnapshot()
})

it('matches announcement snapshot', () => {
  const creator = {
    name: 'JJ',
    avatarUrl: 'foo.png',
    id: 123
  }
  const context = {
    label: 'some context',
    url: '/foo/bar'
  }

  const groups = [
    {
      name: 'FooC', slug: 'fooc'
    },
    {
      name: 'BarC', slug: 'barc'
    }
  ]

  const wrapper = shallow(<PostHeader groups={groups} creator={creator} announcement />)
  expect(wrapper).toMatchSnapshot()
  wrapper.setProps({ context, type: 'request', groups })
  expect(wrapper).toMatchSnapshot()
  wrapper.setProps({ deletePost: () => {}, editPost: () => {} })
  expect(wrapper).toMatchSnapshot()
})

it('renders human readable dates', () => {
  const creator = {
    name: 'JJ',
    avatarUrl: 'foo.png',
    id: 123
  }
  const groups = [
    {
      name: 'FooC', slug: 'fooc'
    },
    {
      name: 'BarC', slug: 'barc'
    }
  ]
  const context = {
    label: 'some context',
    url: '/foo/bar'
  }
  let startTime = '11/29/2020'
  let endTime = '11/29/2029'

  const wrapper = shallow(<PostHeader type='request' groups={groups} creator={creator} context={context} startTime={startTime} endTime={endTime} />)
  expect(wrapper).toMatchSnapshot()
  startTime = '11/29/2022'
  endTime = '11/29/2029'
  wrapper.setProps({ startTime, endTime })
  expect(wrapper).toMatchSnapshot()
  startTime = '11/29/2010'
  endTime = '11/29/2020'
  wrapper.setProps({ startTime, endTime })
  expect(wrapper).toMatchSnapshot()
})

describe('TopicsLine', () => {
  it('matches last snapshot', () => {
    const props = {
      topics: [{ name: 'one' }, { name: 'two' }],
      slug: 'hay',
      newLine: true
    }

    const wrapper = shallow(<TopicsLine {...props} />)
    expect(wrapper).toMatchSnapshot()
  })
})
