import {apiUrlBuilder, checkResponse} from './common';

import {Experiment, ExperimentDTO} from "../state/experiments/reducer";
import assert from 'assert';

export const API_HOST = process.env.REACT_APP_EXPERIMENT_SERVICE_API_HOST;
export const API_PORT = process.env.REACT_APP_EXPERIMENT_SERVICE_API_PORT;
export const API_BASE = process.env.REACT_APP_EXPERIMENT_SERVICE_API_BASE;
export const API_VERSION = process.env.REACT_APP_EXPERIMENT_SERVICE_API_VERSION;

assert(API_HOST);
assert(API_PORT);
assert(API_BASE);
assert(API_VERSION);

const getApiUrl = apiUrlBuilder(API_HOST, API_PORT, API_BASE, API_VERSION);

export const getAllExperiments = async () => {
    const response = await fetch(getApiUrl('experiment'));
    checkResponse(response);
    return await response.json();
}

export const getSingleExperiment = async (id: string) => {
    const response = await fetch(getApiUrl(`experiment/${id}`));
    checkResponse(response);
    return await response.json();
}

export const startExperiment = async (experiment: ExperimentDTO): Promise<Experiment> => {
    const endpoint = getApiUrl('experiment');
    const startResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(experiment)
    });
    checkResponse(startResponse);
    const data = await startResponse.json();
    return await getSingleExperiment(data['id']);
}

const updateExperiment = async (id: string, action: string): Promise<Experiment> => {
    const endpoint = getApiUrl(`experiment/${action}/${id}`);
    const response = await fetch(endpoint, {
        method: 'PUT'
    });
    checkResponse(response);
    const data = await response.json();
    return await getSingleExperiment(data['id']);
}

export const pauseExperiment = async (id: string) : Promise<Experiment> => {
    return await updateExperiment(id, "pause");
}

export const resumeExperiment = async (id: string) : Promise<Experiment> => {
    return await updateExperiment(id, "resume");
}

export const stopExperiment = async (id: string) : Promise<Experiment> => {
    return await updateExperiment(id, "stop");
}

export const deleteExperiment = async (id: string): Promise<void> => {
    const endpoint = getApiUrl(`experiment/${id}`);
    const response = await fetch(endpoint, {
        method: 'DELETE'
    });
    checkResponse(response);
    return await response.json();
}


