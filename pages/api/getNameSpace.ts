import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch(process.env.VECTOR_URL+'');
        const datas = await response.json();
        const decodedData = datas.data.map((fileName: string) => decodeURIComponent(fileName));
        res.status(200).json({ data: decodedData });
    } catch (error) {
        console.log('An error occurred while fetching options.', error);
        res.status(500).json({ error: 'An error occurred while fetching options.' });
    }
}