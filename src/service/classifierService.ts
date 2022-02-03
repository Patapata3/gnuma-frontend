import {apiUrlBuilder, checkResponse} from './common';

import {Classifier} from "../state/classifiers/reducer";
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

export const getAllClassifiers = async () => {
    const response = await fetch(getApiUrl('classifier'));
    checkResponse(response);
    return await response.json();
}
