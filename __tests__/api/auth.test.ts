import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/auth/[...nextauth]/route'

describe('Auth API', () => {
  it('returns 401 for invalid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      }
    })

    await POST(req)
    expect(res._getStatusCode()).toBe(401)
  })

  it('returns user data for valid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'correctpassword'
      }
    })

    await POST(req)
    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('user')
  })
}) 