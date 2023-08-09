import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { selectedValue } = req.body
  process.env.PINECONE_NAME_SPACE = req.body.selectedValue+'.pdf';
  console.log('process.env.PINECONE_NAME_SPACE:'+process.env.PINECONE_NAME_SPACE)

  // 在这里，你可以处理你的 selectedValue。
  // 这可能包括保存到数据库，更新环境变量，等等。

  // 然后，返回一个响应给客户端
  res.status(200).json({ message: 'Value updated successfully.' })
}