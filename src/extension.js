/**
 * Group of Http status codes used by the extension.
 * @type {Readonly<Object>}
 */
const httpStatusCodes = Object.freeze({
  UNAUTHORIZED: 401,
  REQUEST_DENIED: 999
});

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
      if (response.status === httpStatusCodes.UNAUTHORIZED || response.status === httpStatusCodes.REQUEST_DENIED) {
        goToLogin();
        return;
      }

      return response.text();
    })
    .then(processResponse);
}

function goToLogin() {
  chrome.tabs.create({
    url: 'https://www.linkedin.com/m/login/'
  });
}
