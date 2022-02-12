import assert from 'assert';

import {apiUrlBuilder, checkResponse} from './common';
import {Dataset} from '../state/datasets/reducer';

export const API_HOST = process.env.REACT_APP_DATASET_SERVICE_API_HOST;
export const API_BASE = process.env.REACT_APP_DATASET_SERVICE_API_BASE;
export const API_VERSION = process.env.REACT_APP_DATASET_SERVICE_API_VERSION;

assert(API_HOST);
assert(API_BASE);
assert(API_VERSION);

const getApiUrl = apiUrlBuilder(API_HOST, API_BASE, API_VERSION);


export const getAllDatasets = async (): Promise<Dataset[]> => {
    const response = await fetch(getApiUrl('datasets'));
    checkResponse(response);
    return await response.json();
}

export const removeDocumentsFromDataset = async (dataset: Dataset, ...documents: string[]): Promise<Dataset> => {
    const filteredDocuments = dataset.documents.filter((documentId) => !documents.includes(documentId))
    const changes = {
        documents: filteredDocuments
    };
    return await updateDataset(dataset.id, changes);
}

export const addDocumentsToDataset = async (dataset: Dataset, ...addDocuments: string[]): Promise<Dataset> => {
    const changes = {
        documents: [...dataset.documents, ...addDocuments]
    };
    return await updateDataset(dataset.id, changes);
}

export const createDataset = async (dataset: Partial<Dataset>): Promise<Dataset> => {
    const endpoint = getApiUrl('datasets');
    const createResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataset)
    });
    checkResponse(createResponse);
    const data = await createResponse.json();
    const datasetId = data['dataset'];
    const getEndpoint = getApiUrl(datasetId);
    const response = await fetch(getEndpoint);
    checkResponse(response);
    return await response.json();
}

export const deleteDataset = async (id: string): Promise<void> => {
    const endpoint = getApiUrl(`datasets/${id}`);
    const response = await fetch(endpoint, {
        method: 'DELETE'
    });
    checkResponse(response);
    return await response.json();
}

export const updateDataset = async (id: string, changes: Partial<Dataset>): Promise<Dataset> => {
    const endpoint = getApiUrl(`datasets/${id}`);
    const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(changes)
    });
    checkResponse(response);

    return await response.json();
}

export const getDataset = async (id: string): Promise<Dataset> => {
    const endpoint = getApiUrl(`datasets/${id}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}
