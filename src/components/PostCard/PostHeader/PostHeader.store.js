export const MODULE_NAME = 'PostHeader'

// Constants
export const DELETE_POST = `${MODULE_NAME}/DELETE_POST`

// Action Creators
export function deletePost (id) {
  return {
    type: DELETE_POST,
    graphql: {
      query: `mutation ($id: ID) {
        deletePost(id: $id) {
          success
        }
      }`,
      variables: {
        id
      }
    },
    meta: {
      optimistic: true,
      id
    }
  }
}
