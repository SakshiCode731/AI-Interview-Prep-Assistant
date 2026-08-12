const { getProgress } = require('../controllers/progressController');
const Answer = require('../models/Answer');

jest.mock('../models/Answer');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('getProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all zeros when user has no answers', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    Answer.find.mockResolvedValue([]);

    await getProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalQuestionsAttempted: 0,
      totalMockInterviews: 0,
      avgOverallScore: 0,
      topicBreakdown: []
    });
  });

  it('should correctly calculate average score and topic breakdown', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    Answer.find.mockResolvedValue([
      { sessionId: 'session1', category: 'DSA', score: 8 },
      { sessionId: 'session1', category: 'DSA', score: 6 },
      { sessionId: 'session2', category: 'HR', score: 9 },
    ]);

    await getProgress(req, res);

    const jsonArg = res.json.mock.calls[0][0];

    expect(jsonArg.totalQuestionsAttempted).toBe(3);
    expect(jsonArg.totalMockInterviews).toBe(2); // 2 unique sessionIds
    expect(jsonArg.avgOverallScore).toBeCloseTo(7.7, 1); // (8+6+9)/3

    const dsaTopic = jsonArg.topicBreakdown.find(t => t.topic === 'DSA');
    expect(dsaTopic.attempted).toBe(2);
    expect(dsaTopic.avgScore).toBe(70); // (8+6)/2 = 7 -> *10 = 70

    const hrTopic = jsonArg.topicBreakdown.find(t => t.topic === 'HR');
    expect(hrTopic.attempted).toBe(1);
    expect(hrTopic.avgScore).toBe(90); // 9 -> *10 = 90
  });

  it('should default category to "Technical" when missing', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    Answer.find.mockResolvedValue([
      { sessionId: 'session1', score: 5 }, // no category field
    ]);

    await getProgress(req, res);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.topicBreakdown[0].topic).toBe('Technical');
  });

  it('should return 500 if the database call fails', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    Answer.find.mockRejectedValue(new Error('DB error'));

    await getProgress(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB error' });
  });
});