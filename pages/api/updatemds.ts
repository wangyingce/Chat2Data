import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('req.body:'+req.body)

  process.env.CHAT_PROMPT_POSTURE = req.body.modelSelectedValue;
  console.log('process.env.CHAT_PROMPT_POSTURE:'+process.env.CHAT_PROMPT_POSTURE)
  res.status(200).json({ message: 'Value updated successfully.' })
}