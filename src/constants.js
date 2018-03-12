/**
 * Group of Http status codes used by the extension.
 * @type {Readonly<{UNAUTHORIZED: number, REQUEST_DENIED: number}>}
 */
const httpStatusCodes = Object.freeze({
  UNAUTHORIZED: 401,
  REQUEST_DENIED: 999
});

/**
 * Group of event subtypes used to choose correct message types to render.
 * @type {Readonly<{INVITATION_ACCEPT: string, INMAIL_REPLY: string, MEMBER_TO_MEMBER: string, INMAIL: string}>}
 */
const eventSubTypes = Object.freeze({
  INVITATION_ACCEPT: 'INVITATION_ACCEPT',
  INMAIL_REPLY: 'INMAIL_REPLY',
  MEMBER_TO_MEMBER: 'MEMBER_TO_MEMBER',
  INMAIL: 'INMAIL',
});

/**
 * Key used to extract message information.
 * @type {string}
 */
const MESSAGE_KEY = 'com.linkedin.voyager.messaging.event.MessageEvent';

/**
 * Key used to extract picture information.
 * @type {string}
 */
const PICTURE_KEY = 'com.linkedin.common.VectorImage';

/**
 * Key used to extract member information.
 * @type {string}
 */
const MEMBER_KEY = 'com.linkedin.voyager.messaging.MessagingMember';

/**
 * Base cdn URL to load profile pic.
 * @type {string}
 */
const PICTURE_URL_BASE = 'https://media-exp2.licdn.com/mpr/mpr/shrinknp_100_100/';

/**
 * Picture path placeholder used when a profile pic is not available.
 * @type {string}
 */
const DEFAULT_PICTURE_URL = '../assets/default.png';

/**
 * Limits number of messages to display.
 * @type {number}
 */
const MESSAGE_LIMIT_COUNT = 5;

/**
 * Limits max chars to display per message before truncating the rest.
 * @type {number}
 */
const MESSAGE_LENGTH_LIMIT_CHARS = 100;
