import { ORM } from 'redux-orm'
import './Model.extension'
import Activity from './Activity'
import Attachment from './Attachment'
import Comment from './Comment'
import EventInvitation from './EventInvitation'
import Group, { GroupConnection, GroupModerator } from './Group'
import GroupTopic from './GroupTopic'
import Invitation from './Invitation'
import JoinRequest from './JoinRequest'
import LinkPreview from './LinkPreview'
import Location from './Location'
import Me, { MySkillsToLearn } from './Me'
import Membership from './Membership'
import Message from './Message'
import MessageThread from './MessageThread'
import Notification from './Notification'
import Person, { PersonSkillsToLearn } from './Person'
import PersonConnection from './PersonConnection'
import Post, { PostFollower, PostCommenter, ProjectMember } from './Post'
import PostMembership from './PostMembership'
import SearchResult from './SearchResult'
import Skill from './Skill'
import Topic from './Topic'
import Vote from './Vote'
import Widget from './Widget'

export const orm = new ORM({ stateSelector: state => state.orm })

orm.register(
  Activity,
  Attachment,
  Comment,
  EventInvitation,
  Group,
  GroupConnection,
  GroupModerator,
  GroupTopic,
  Invitation,
  LinkPreview,
  Location,
  JoinRequest,
  Me,
  Membership,
  Message,
  MessageThread,
  MySkillsToLearn,
  Notification,
  Person,
  PersonConnection,
  PersonSkillsToLearn,
  Post,
  PostCommenter,
  PostFollower,
  PostMembership,
  ProjectMember,
  SearchResult,
  Skill,
  Topic,
  Vote,
  Widget
)

export default orm
