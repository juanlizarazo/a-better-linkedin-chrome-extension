/**
 * Extracts session cookie data and passes it to handler
 * to perform request.
 */
function requestStats() {
  chrome.cookies.get({
    url: 'https://www.linkedin.com',
    name: 'JSESSIONID'
  }, extractTokenAndPerformRequest);
}

/**
 * Processes cookie object and initiates request.
 * @param {object} cookie
 */
function extractTokenAndPerformRequest(cookie) {
  if (!cookie) {
    goToLogin();
    return;
  }

  const token = cookie.value.replace(/"/g, '');
  performRequest(token);
}

/**
 * Performs request and passes response to method for processing and rendering.
 * @param {string} token - csrf token
 */
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
 * @param {object} json
 */
function processResponse(json) {
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
        const { subject = 'No subject', body } = event.eventContent[MESSAGE_KEY];
        const { miniProfile: profile } = event.from[MEMBER_KEY];

        const pictureUrl = profile.picture
          ? PICTURE_URL_BASE + profile.picture[PICTURE_KEY].id
          : DEFAULT_PICTURE_URL;

        messages.push({
          name: `${profile.firstName} ${profile.lastName}`,
          pictureUrl,
          subject,
          body: body.substr(0, MESSAGE_LENGTH_LIMIT_CHARS) + '...'
        });
      }
    }

    if (messages.length === MESSAGE_LIMIT_COUNT) {
      break;
    }
  }

  if (messages.length === 0) {
    document.getElementById('header').innerHTML = `
      <tr>
        <th>No actual messages found.</th>
      </tr>
    `;
    return;
  }
  createMessageRows(messages);
}

/**
 * Creates and appends messages to DOM.
 * @param {array} messages
 */
function createMessageRows(messages) {
  // Header
  document.getElementById('header').innerHTML = `
    <tr>
      <th></th>
      <th>Subject</th>
      <th>Message</th>
    </tr>
  `;

  for (let message of messages) {
    const messageRow = document.createElement('tr');
    messageRow.innerHTML = `
      <td>
        <img src="${message.pictureUrl}" width="50">
      </td>
      <td>
        <b>${message.name}</b><br />
        ${message.subject}
      </td>
      <td>${message.body}</td>
    `;

    document.getElementById('messages').appendChild(messageRow);
  }

  // footer
  document.getElementById('footer').innerHTML = `
    <tr>
      <td colspan="3">
        <span class="text-info">Showing last ${messages.length} messages.</span>
        <a class="btn btn-primary btn-sm float-right" id="go-to-inbox">Go to inbox</a>
      </td>
    </tr>
  `;

  document
    .getElementById('go-to-inbox')
    .addEventListener('click', goToInbox);
}

/**
 * Creates stats badges and appends them to DOM.
 *
 * @param {number} unreadCount
 * @param {number} totalMessages
 */
function createBadges(unreadCount, totalMessages) {
  document.getElementById('stats').innerHTML = `
    <span class="badge text-danger">Unread messages: ${unreadCount}</span> | 
    <span class="badge text-success">Total messages: ${totalMessages}</span>
  `;
}

/**
 * Opens new tab and loads sign in page.
 */
function goToLogin() {
  chrome.tabs.create({
    url: 'https://www.linkedin.com/m/login/'
  });
}

/**
 * Opens new tab and loads inbox page.
 */
function goToInbox() {
  chrome.tabs.create({
    url: 'https://www.linkedin.com/messaging'
  });
}
