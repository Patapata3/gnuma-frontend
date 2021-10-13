import {LogEntry} from '../state/logs/reducer';
import {apiUrlBuilder, checkResponse} from './common';


export const API_HOST = 'http://132.180.195.21';
export const API_PORT = '8090';
export const API_BASE = 'api';
export const API_VERSION = 'v1';

const getApiUrl = apiUrlBuilder(API_HOST, API_PORT, API_BASE, API_VERSION);

export const getAllLogEntries = async (): Promise<LogEntry[]> => {
    const response = await fetch(getApiUrl('logs'));
    checkResponse(response);
    return await response.json();
}

export const getSingleLogEntry = async (id: string): Promise<LogEntry> => {
    const endpoint = getApiUrl(`logs/${id}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}
