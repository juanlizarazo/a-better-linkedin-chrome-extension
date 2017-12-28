/**
 * Group of Http status codes used by the extension.
 * @type {Readonly<Object>}
 */
const httpStatusCodes = Object.freeze({
  UNAUTHORIZED: 401,
  REQUEST_DENIED: 999
});

const eventSubTypes = Object.freeze({
  INVITATION_ACCEPT: "INVITATION_ACCEPT",
  INMAIL_REPLY: "INMAIL_REPLY",
  MEMBER_TO_MEMBER: "INMAIL_REPLY",
  INMAIL: "INMAIL",
});

const MESSAGE_KEY = 'com.linkedin.voyager.messaging.event.MessageEvent';

const MESSAGE_LIMIT_COUNT = 5;

const MESSAGE_LENGTH_LIMIT_CHARS = 100;

/**
 * Request stats and passes results to handler function.
 */
function requestStats() {
  chrome.cookies.get({
    url: 'https://www.linkedin.com',
    name: 'JSESSIONID'
  }, extractTokenAndPerformRequest);
}

function extractTokenAndPerformRequest(cookie) {
  if (!cookie) {
    goToLogin();
    return;
  }

  const token = cookie.value.replace(/"/g, '');
  performRequest(token);
}

function performRequest(token) {
  const request = new Request('https://linkedin.com/voyager/api/messaging/conversations?keyVersion=LEGACY_INBOX', {
    method: 'GET',
    headers: new Headers({
      accept: 'application/json',
      'Content-Type': 'application/json',
      'csrf-token': token
    }),
    credentials: 'include'
  });

  fetch(request)
    .then(response => {
      if (
        response.status === httpStatusCodes.UNAUTHORIZED ||
        response.status === httpStatusCodes.REQUEST_DENIED
      ) {
        goToLogin();
        return;
      }

      return response.json();
    })
    .then(processResponse);
}

/**
 * Processes response and appends data to DOM.
 *
 * @param {object} json
 */
function processResponse(json) {
  console.log(json);
  const { elements, metadata, paging } = json;

  const unreadCount = metadata.unreadCount;
  const totalMessages = paging.total;

  createBadges(unreadCount, totalMessages);

  const messages = [];

  for (let element of elements) {
    for (let event of element.events) {
      if (
        event.subtype === eventSubTypes.INMAIL ||
        event.subtype === eventSubTypes.INMAIL_REPLY ||
        event.subtype === eventSubTypes.MEMBER_TO_MEMBER
      ) {
        const { subject, body } = event.eventContent[MESSAGE_KEY];
        messages.push({
          subject,
          body: body.substr(0, MESSAGE_LENGTH_LIMIT_CHARS) + '...'
        });
      }
    }

    if (messages.length === MESSAGE_LIMIT_COUNT) {
      break;
    }
  }

  createMessageRows(messages);
}

/**
 * Creates and appends messages to DOM.
 *
 * @param {array} messages
 */
function createMessageRows(messages) {
  // Header
  document.getElementById('header').innerHTML = `
    <tr>
      <th>subject</th>
      <th>message</th>
    </tr>
  `;

  for (let message of messages) {
    const messageRow = document.createElement('tr');
    messageRow.innerHTML = `
      <td>${message.subject}</td>
      <td>${message.body}</td>
    `;

    document.getElementById('messages').appendChild(messageRow);
  }

}

function createBadges(unreadCount, totalMessages) {
  document.getElementById('stats').innerHTML = `
    <div class="badge badge-danger">Unread messages: <span id="unread-count"></span></div>
    <div class="badge badge-success">Total messages: <span id="total-messages"></span></div>
  `;

  document.getElementById('unread-count').innerText = unreadCount;
  document.getElementById('total-messages').innerText = totalMessages;
}

function goToLogin() {
  chrome.tabs.create({
    url: 'https://www.linkedin.com/m/login/'
  });
}
