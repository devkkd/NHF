import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2 } from '../config/r2.js';
import crypto from 'crypto';
export const presign = async (req, res, next) => {
  try {
    const { mimeType, fileSize, folder='uploads' } = req.body;
    if (!mimeType || !fileSize) return res.status(400).json({ ok:false, error:'mimeType and fileSize required' });
    if (fileSize > 10*1024*1024) return res.status(400).json({ ok:false, error:'Max 10MB' });
    const ext = mimeType.split('/')[1] || 'bin';
    const key = folder + '/' + crypto.randomUUID() + '.' + ext;
    const cmd = new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ContentType: mimeType, ContentLength: fileSize });
    const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 300 });
    const publicUrl = process.env.R2_PUBLIC_URL + '/' + key;
    res.json({ ok:true, data:{ uploadUrl, publicUrl, key } });
  } catch(err) { next(err); }
};
