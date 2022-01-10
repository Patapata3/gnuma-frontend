import {apiUrlBuilder, checkResponse} from './common';

import {Document, UnPersistedDocument} from '../state/documents/reducer';

export const API_HOST = 'http://132.180.195.21';
export const API_PORT = '8080';
export const API_BASE = 'api';
export const API_VERSION = 'v1';


const getApiUrl = apiUrlBuilder(API_HOST, API_PORT, API_BASE, API_VERSION);

export const getAllDocuments = async (): Promise<Document[]> => {
    const response = await fetch(getApiUrl('documents'));
    checkResponse(response);
    return await response.json();
}

export const getSingleDocument = async (id: string): Promise<Document> => {
    const endpoint = getApiUrl(`documents/${id}`);
    const response = await fetch(endpoint);
    checkResponse(response);
    return await response.json();
}

export const createDocument = async (document: UnPersistedDocument): Promise<Document> => {
    const endpoint = getApiUrl('documents/');

    const formData = new FormData();
    formData.append('domain', document.domain);
    formData.append('source', document.source);
    formData.append('contributor', document.contributor);
    formData.append('citationInformation', document.citationInformation);
    formData.append('augmented', document.augmented ? 'true' : 'false');
    formData.append('tasks', document.tasks.join(', '));
    document.dataFields.forEach((field, index) => {
        formData.append(`dataFields[${index}].name`, field.name);
        formData.append(`dataFields[${index}].description`, field.description);
    })

    if(document.rootDocument) {
        formData.append('rootDocument', document.rootDocument);
    }

    formData.append('data', document.data);

    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });
    checkResponse(response);

    const data = await response.json();
    return await getSingleDocument(data)
}

export const updateDocument = async (documentId: string, document: Partial<Document>): Promise<Document> => {
    const endpoint = getApiUrl(`documents/${documentId}`);
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(document)
    });
    checkResponse(response);

    return await getSingleDocument(documentId);
}

export const deleteDocument = async (id: string): Promise<void> => {
    const endpoint = getApiUrl(`documents/${id}`);
    const response = await fetch(endpoint, {
        method: 'DELETE',
    });
    checkResponse(response);
}
