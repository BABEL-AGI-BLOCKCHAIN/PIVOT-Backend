import fsPromises from 'fs/promises';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

async function uploadOnPinata(filePath) {
  if (!filePath) {
    throw new Error('No file path provided.');
  }

  const normalizedPath = path.normalize(filePath).replace(/\\/g, '/');

  const fileBuffer = await fsPromises.readFile(normalizedPath);

  const formData = new FormData();
  formData.append('file', fileBuffer, path.basename(normalizedPath));

  const pinataMetadata = JSON.stringify({ name: path.basename(normalizedPath) });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  formData.append('pinataOptions', pinataOptions);

  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
    });

    await fsPromises.unlink(normalizedPath);

    const cid = response.data.IpfsHash;
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  } catch (error) {
    throw new Error(`Error uploading to Pinata: ${error.message}`);
  }
}

export default uploadOnPinata;
