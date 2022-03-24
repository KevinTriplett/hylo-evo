import { groupBy } from 'lodash'
import Map from 'components/Map'
import { createIconLayerFromPostsAndMembers } from 'components/Map/layers/clusterLayer'
import { createIconLayerFromGroups } from 'components/Map/layers/iconLayer'
import useEnsureSearchedGroups from 'hooks/useEnsureSearchedGroups'
import React, { useEffect, useState } from 'react'

import './FarmMap.scss'

export default function FarmMapWidget ({ group, items }) {
  /*
    - Source group from the props, and its location
    - Source the posts from props; that will get you farm posts on the map
    - make a separate query for nearby groups, probably the same as the groupExplorer fetch
  */
  const coord = group.locationObject && group.locationObject.center && { lng: parseFloat(group.locationObject.center.lng), lat: parseFloat(group.locationObject.center.lat) }
  const defaultViewport = {
    width: 400,
    height: 300,
    latitude: coord.lat,
    longitude: coord.lng,
    zoom: 8,
    bearing: 0,
    pitch: 0,
    mapBoundingBox: null
  }
  const [viewport, setViewport] = useState(defaultViewport)
  const [groupIconLayer, setGroupIconLayer] = useState(null)
  const [postsLayer, setPostsLayer] = useState([])
  const [pointerX, setPointerX] = useState(null)
  const [pointerY, setPointerY] = useState(null)
  const [hoveredObject, setHoveredObject] = useState(null)
  const { pending, groups } = useEnsureSearchedGroups({ sortBy: 'nearest', nearCoord: coord, groupType: 'farm' })

  const onMapHover = (info) => {
    setHoveredObject(info.objects || info.object)
    setPointerX(info.x)
    setPointerY(info.y)
  }

  useEffect(() => {
    const viewGroups = groups.filter(group => {
      const locationObject = group.ref.locationObject
      return locationObject && locationObject.center && locationObject.center.lng && locationObject.center.lat
    }).map((group) => {
      return { ...group.ref }
    })

    setGroupIconLayer(createIconLayerFromGroups({
      groups: viewGroups,
      onHover: onMapHover,
      onClick: () => {}
    }))
  }, [groups])

  useEffect(() => {
    const viewPosts = items.filter(post => {
      const locationObject = post.locationObject
      return locationObject && locationObject.center && locationObject.center.lng && locationObject.center.lat
    })
    console.log(viewport, 'why do dead?')
    setPostsLayer(createIconLayerFromPostsAndMembers({
      members: [],
      posts: viewPosts,
      onHover: onMapHover,
      onClick: () => {},
      boundingBox: viewport.mapBoundingBox,
      forceUpdate: true
    }))
  }, [items, viewport])

  const _renderTooltip = () => {
    if (hoveredObject) {
      let message
      let type
      if (Array.isArray(hoveredObject) && hoveredObject.length > 0) {
        // cluster
        const types = groupBy(hoveredObject, 'type')
        message = Object.keys(types).map(type => <p key={type}>{types[type].length} {type}{types[type].length === 1 ? '' : 's'}</p>)
        type = 'cluster'
      } else {
        message = hoveredObject.message
        type = hoveredObject.type
        console.log(type, 'type')
      }

      return (
        <div styleName='postTip' className={type} style={{ left: pointerX + 15, top: pointerY }}>
          {message}
        </div>
      )
    }
    return ''
  }

  return (
    <div styleName='farm-map-container'>
      <Map
        layers={[groupIconLayer, postsLayer]}
        children={_renderTooltip()}
        viewport={viewport}
        onViewportUpdate={setViewport}
      />
    </div>
  )
}
