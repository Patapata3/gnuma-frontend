import {Reducer} from 'react';

import {genericPayloadReducer, GenericPayloadState} from '../common/reducer';
import {GenericPayloadActions} from '../common/actions';

export type Model = {
    id: string;
    remoteId: string;
    hyperParameterValues: {
        [key: string]: string
    }
}

export type ExperimentClassifier = {
    id: string;
    remoteId: string;
    address: string;
    status: string;
    currentSteps: number;
    totalSteps: number;
    model: Model;
    results: {
        [key: string]: number[]
    }
}
export type DataConfig = {
    id?: string,
    datasetId: string;
    testSplit: number;
    validationSplit: number;
    seed: number;
}

export type Experiment = {
    id: string;
    date: string;
    description: string;
    classifiers: ExperimentClassifier[];
    data: DataConfig;
}

export type ExperimentClassifierDTO = {
    id: string;
    address: string;
    hyperParameterValues: {
        [key: string]: string | boolean
    }
}

export type ExperimentDTO = {
    description: string;
    classifiers: ExperimentClassifierDTO[];
    data: DataConfig
}

export const initialState: GenericPayloadState<Experiment> = {
    elements: {},
    loading: false
}

type ExperimentReducerType = Reducer<GenericPayloadState<Experiment>, GenericPayloadActions<Experiment>>;

const ExperimentsReducer: ExperimentReducerType = genericPayloadReducer;

export default ExperimentsReducer;
