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

export type Experiment = {
    id: string;
    date: string;
    classifiers: ExperimentClassifier[];
    trainDatasetId: string;
    testDatasetId: string;
}

export const initialState: GenericPayloadState<Experiment> = {
    elements: {},
    loading: false
}

type ExperimentReducerType = Reducer<GenericPayloadState<Experiment>, GenericPayloadActions<Experiment>>;

const ExperimentsReducer: ExperimentReducerType = genericPayloadReducer;

export default ExperimentsReducer;
