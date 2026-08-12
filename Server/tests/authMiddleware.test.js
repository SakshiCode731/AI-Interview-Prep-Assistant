const jwt = require('jsonwebtoken');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/user');

// Mock the User model and jwt so we don't hit a real DB or need a real token
jest.mock('../models/user');
jest.mock('jsonwebtoken');

describe('adminOnly middleware', () => {
  it('should call next() if user is admin', () => {
    const req = { user: { role: 'admin' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not admin', () => {
    const req = { user: { role: 'user' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. Admin only.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if req.user is missing entirely', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    adminOnly(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('protect middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no Authorization header is present', async () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid/verification fails', async () => {
    const req = { headers: { authorization: 'Bearer badtoken123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach user to req and call next() if token is valid', async () => {
    const req = { headers: { authorization: 'Bearer goodtoken123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    const fakeUser = { _id: 'user123', name: 'Test User', role: 'user' };

    jwt.verify.mockReturnValue({ id: 'user123' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser)
    });

    await protect(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});