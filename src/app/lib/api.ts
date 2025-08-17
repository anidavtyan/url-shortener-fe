import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

export const shortenUrl = (url: string, customSlug?: string) =>
    api.post('api/v1/urls/shorten', { url, customSlug });

export const getAllUrls = () => api.get('/api/v1/urls/all');

export const getTopUrls = (limit, range) => api.get(`/api/v1/urls/top?limit=${limit}&range=${range}`);

export const resolveSlug = (slug: string) => api.get(`/${slug}`);