import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('req.body.ic='+req.body.ic);
    const content = fs.readFileSync('nmspclst.txt', 'utf8');
    const fileContent = content.split('.pdf,').filter(item => item.trim() !== '');
    res.status(200).json({ optionValues: fileContent });
}