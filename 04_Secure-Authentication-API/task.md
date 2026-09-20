# Secure Authentication API

**Status:** Overdue (was due 14 Aug)
**Priority:** Medium
**Type:** Batch task

## Objective

Implement authentication for a FastAPI application.

## Features

- User Registration
- Login
- JWT Authentication
- Password Hashing
- Role-based Access (Admin/User)
- Refresh Token

## Security Requirements

- OAuth2 Password Flow
- bcrypt Password Hashing
- JWT Expiry
- Protected Routes

## Bonus

- Implement Logout using token blacklist

## YouTube Submission

Show:
- Login
- Invalid Login
- Protected API
- JWT working
- Authorization flow

## Implementation Checklist

- [ ] Project scaffolding (FastAPI app structure)
- [ ] User model + database setup
- [ ] Password hashing (bcrypt via passlib)
- [ ] User registration endpoint
- [ ] Login endpoint (OAuth2 Password Flow)
- [ ] JWT access token generation + expiry
- [ ] Refresh token endpoint
- [ ] Role-based access control (Admin/User)
- [ ] Protected route dependency (get_current_user)
- [ ] Admin-only protected route example
- [ ] Logout via token blacklist (bonus)
- [ ] Manual testing (valid/invalid login, protected routes)
- [ ] Record YouTube demo
- [ ] Submit
