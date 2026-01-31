import { Track } from '../types';

interface CCMixterUpload {
  upload_id: number;
  upload_name: string;
  user_name: string;
  files: {
    download_url: string;
    file_format_info: {
        ps: string;
    }
  }[];
}

export async function fetchCCMixterTracks(query: string): Promise<Track[]> {
  try {
    const response = await fetch(`http://ccmixter.org/api/query?search=${query}&f=json&limit=20`);
    const data: CCMixterUpload[] = await response.json();

    return data.map((upload) => ({
      id: upload.upload_id.toString(),
      title: upload.upload_name,
      artist: upload.user_name,
      duration: upload.files[0]?.file_format_info?.ps || '0:00',
      url: upload.files[0]?.download_url,
    }));
  } catch (error) {
    console.error('Error fetching ccMixter tracks:', error);
    return [];
  }
}
