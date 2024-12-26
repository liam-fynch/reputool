interface DataForSEORequest {
  keyword: string;
  location_code: number;
  language_code: string;
  target: string;
}

interface DataForSEOResponse {
  tasks?: Array<{
    result?: Array<{
      items?: Array<{
        rank_absolute?: number;
      }>;
    }>;
  }>;
}

export async function checkGoogleRanking(searchPhrase: string, url: string): Promise<DataForSEOResponse> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error('DataForSEO credentials not found');
  }

  const auth = Buffer.from(`${login}:${password}`).toString('base64');

  const request: DataForSEORequest = {
    keyword: searchPhrase,
    location_code: 9004056,
    language_code: "en",
    target: url
  };

  try {
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([request])
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DataForSEO API error response:', errorData);
      throw new Error(`DataForSEO API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
      console.error('Invalid response from DataForSEO:', data);
      throw new Error('Invalid response from DataForSEO API');
    }

    return data;
  } catch (error) {
    console.error('DataForSEO API call failed:', error);
    throw error;
  }
} 