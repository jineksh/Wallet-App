import { Router } from 'express';

const userRouter = Router();

userRouter.get('/', (_req, res) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ],
  });
});

userRouter.get('/:id', (req, res) => {
  res.json({
    id: Number(req.params.id),
    name: 'Sample User',
  });
});

export default userRouter;
