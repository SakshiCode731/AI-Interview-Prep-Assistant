const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signupUser, loginUser } = require('../controllers/authController');
const User = require('../models/user');

// Mock everything that touches the DB or does real crypto work
jest.mock('../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('signupUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if user already exists', async () => {
    const req = { body: { name: 'Test', email: 'existing@test.com', password: '123456' } };
    const res = mockRes();

    User.findOne.mockResolvedValue({ _id: 'someId', email: 'existing@test.com' });

    await signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('should hash the password before saving', async () => {
    const req = { body: { name: 'Test', email: 'new@test.com', password: 'plainpassword' } };
    const res = mockRes();

    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue('fakesalt');
    bcrypt.hash.mockResolvedValue('hashedpassword123');
    User.create.mockResolvedValue({
      _id: 'newUserId',
      name: 'Test',
      email: 'new@test.com',
      role: 'user'
    });
    jwt.sign.mockReturnValue('fake.jwt.token');

    await signupUser(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 'fakesalt');
    expect(User.create).toHaveBeenCalledWith({
      name: 'Test',
      email: 'new@test.com',
      password: 'hashedpassword123'
    });
  });

  it('should return 201 with user data and token on success', async () => {
    const req = { body: { name: 'Test', email: 'new@test.com', password: 'plainpassword' } };
    const res = mockRes();

    User.findOne.mockResolvedValue(null);
    bcrypt.genSalt.mockResolvedValue('fakesalt');
    bcrypt.hash.mockResolvedValue('hashedpassword123');
    User.create.mockResolvedValue({
      _id: 'newUserId',
      name: 'Test',
      email: 'new@test.com',
      role: 'user'
    });
    jwt.sign.mockReturnValue('fake.jwt.token');

    await signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: 'newUserId',
      name: 'Test',
      email: 'new@test.com',
      role: 'user',
      token: 'fake.jwt.token'
    });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    const req = { body: { name: 'Test', email: 'crash@test.com', password: '123456' } };
    const res = mockRes();

    User.findOne.mockRejectedValue(new Error('DB connection lost'));

    await signupUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB connection lost' });
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user does not exist', async () => {
    const req = { body: { email: 'nouser@test.com', password: '123456' } };
    const res = mockRes();

    User.findOne.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  it('should return 401 if password does not match', async () => {
    const req = { body: { email: 'test@test.com', password: 'wrongpassword' } };
    const res = mockRes();

    User.findOne.mockResolvedValue({ _id: 'id1', email: 'test@test.com', password: 'hashedpw' });
    bcrypt.compare.mockResolvedValue(false);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
  });

  it('should return 200 with token if login succeeds', async () => {
    const req = { body: { email: 'test@test.com', password: 'correctpassword' } };
    const res = mockRes();

    User.findOne.mockResolvedValue({
      _id: 'id1',
      name: 'Test User',
      email: 'test@test.com',
      role: 'user',
      password: 'hashedpw'
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('fake.jwt.token');

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      _id: 'id1',
      name: 'Test User',
      email: 'test@test.com',
      role: 'user',
      token: 'fake.jwt.token'
    });
  });
});