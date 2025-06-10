import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { AuthModal } from '@/components/auth-modal'

describe('AuthModal', () => {
  it('renders login form by default', () => {
    render(<AuthModal />)
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('switches to register form', async () => {
    render(<AuthModal />)
    fireEvent.click(screen.getByText(/create account/i))
    await waitFor(() => {
      expect(screen.getByText(/sign up/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for empty fields', async () => {
    render(<AuthModal />)
    fireEvent.click(screen.getByText(/sign in/i))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })
}) 