export async function apiLogin(username, password) {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })
    return res.ok ? checkSession() : null
  }
  
  export async function apiRegister(username, password) {
    const res = await fetch('/register', {
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
    await fetch('/logout', { method: 'POST', credentials: 'include' })
  }
  
  export async function checkSession() {
    try {
      const res = await fetch('/session', { credentials: 'include' })
      if (!res.ok) return null
      const data = await res.json()
      return data.username ? data : null
    } catch {
      return null
    }
  }
  
  export async function apiGetUsers() {
    const res = await fetch('/api/users', { credentials: 'include' })
    if (!res.ok) throw new Error('Failed to fetch users')
    return res.json()
  }
  
  export async function apiUpdateRole(id, role) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
    })
    if (!res.ok) throw new Error('Failed to update role')
    return res.json()
  }
  
  export async function apiDeleteUser(id) {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to delete user')
    return res.json()
  }

export async function apiGetCredentials(username) {
  const res = await fetch('/api/credentials', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-Username': username },
    })
  if (!res.ok) throw new Error('Failed to update role')
  return res.json()
}

export async function apiPostCredentials(username, email, password) {
  let data = {"username": username, "email": email, "password": password}
  const res = await fetch('/api/credentials', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  if (!res.ok) throw new Error('Failed to update role')
  return res.json()
}

export async function apiPutCredentials() {
  let data = {"username": username, "email": email, "password": password}
  const res = await fetch('/api/credentials', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
  if (!res.ok) throw new Error('Failed to update role')
  return res.json()
}