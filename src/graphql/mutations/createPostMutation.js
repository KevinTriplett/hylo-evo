import postFieldsFragment from 'graphql/fragments/postFieldsFragment'

export default
`mutation (
  $type: String,
  $title: String,
  $details: String,
  $linkPreviewId: String,
  $groupIds: [String],
  $imageUrls: [String],
  $fileUrls: [String],
  $announcement: Boolean,
  $topicNames: [String],
  $acceptContributions: Boolean,
  $eventInviteeIds: [ID],
  $startTime: Date,
  $endTime: Date,
  $location: String,
  $locationId: ID,
  $isPublic: Boolean
) {
  createPost(data: {
    type: $type,
    title: $title,
    details: $details,
    linkPreviewId: $linkPreviewId,
    groupIds: $groupIds,
    imageUrls: $imageUrls,
    fileUrls: $fileUrls,
    announcement: $announcement,
    topicNames: $topicNames,
    acceptContributions: $acceptContributions,
    eventInviteeIds: $eventInviteeIds,
    startTime: $startTime,
    endTime: $endTime,
    location: $location,
    locationId: $locationId,
    isPublic: $isPublic
  }) {${postFieldsFragment(false)}}
}`
