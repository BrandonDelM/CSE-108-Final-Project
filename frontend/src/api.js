const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function apiLogin(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  return res.ok ? checkSession() : null
}

export async function apiRegister(username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.msg || 'Registration failed')
  return data
}

export async function apiLogout() {
  await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' })
}

export async function checkSession() {
  try {
    const res = await fetch(`${API_BASE}/session`, { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    return data.username ? data : null
  } catch {
    return null
  }
}

export async function apiGetUsers() {
  const res = await fetch(`${API_BASE}/api/users`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export async function apiUpdateRole(id, role) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error('Failed to update role')
  return res.json()
}

export async function apiDeleteUser(id) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete user')
  return res.json()
}

export async function apiGetCredentials(username) {
  const res = await fetch(`${API_BASE}/api/credentials`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to query credentials')
  return res.json()
}

export async function apiPostCredentials(username, email, password) {
  const data = { username, email, password }
  const res = await fetch(`${API_BASE}/api/credentials`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to add credentials')
  return res.json()
}

export async function apiPutCredentials(username, email, password) {
  const data = { username, email, password }
  const res = await fetch(`${API_BASE}/api/credentials`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to update credentials')
  return res.json()
}

export async function apiGetSubscribers(username) {
  const res = await fetch(`${API_BASE}/api/subscriber`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to query subscribers')
  return res.json()
}

export async function apiPostSubscriber(data) {
  const res = await fetch(`${API_BASE}/api/subscriber`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to add subscriber')
  return res.json()
}

export async function apiPutSubscriber(data) {
  const res = await fetch(`${API_BASE}/api/subscriber`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to update subscriber')
  return res.json()
}

export async function apiDeleteSubscriber(username, email) {
  const data = { username, email }
  const res = await fetch(`${API_BASE}/api/subscriber`, {
    method: 'DELETE',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete subscriber')
  return res.json()
}

export async function apiGetEmails(username) {
  const res = await fetch(`${API_BASE}/api/users/emails`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch emails')
  return res.json()
}

export async function apiGetSentEmails(username) {
  const res = await fetch(`${API_BASE}/api/users/sent`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch sent emails')
  return res.json()
}

export async function apiGetCampaignUsername(id) {
  const res = await fetch(`${API_BASE}/api/campaign/username`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Id': id },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch campaign username')
  return res.json()
}

export async function apiGetCampaignId(username) {
  const res = await fetch(`${API_BASE}/api/campaign/id`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch campaign id')
  return res.json()
}

export async function apiSend(subject, fields, bgColor = '') {
  const res = await fetch(`${API_BASE}/api/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subject, fields, bgColor }),
  })
  if (!res.ok) throw new Error('Failed to send')
  return res.json()
}

export async function apiSave(subject, fields, bgColor = '') {
  const res = await fetch(`${API_BASE}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ subject, fields, bgColor }),
  })
  if (!res.ok) throw new Error('Failed to save')
  return res.json()
}

export async function getCreatedEmails(username) {
  const res = await fetch(`${API_BASE}/api/mail`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Username': username },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch emails')
  return res.json()
}

export async function getEmailById(id) {
  const res = await fetch(`${API_BASE}/api/mail/id`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Id': id },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch email')
  return res.json()
}

export async function apiSendSavedEmail(id, recipients) {
  const res = await fetch(`${API_BASE}/api/mail/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id, recipients }),
  })
  if (!res.ok) throw new Error('Failed to send email')
  return res.json()
}

export async function apiDeleteEmail(id) {
  const res = await fetch(`${API_BASE}/api/mail/delete`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Failed to delete email')
  return res.json()
}

export async function getEmailHTMLById(id) {
  const res = await fetch(`${API_BASE}/api/mail/html`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Id': id },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch email HTML')
  return res.json()
}