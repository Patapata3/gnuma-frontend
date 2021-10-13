import {Reducer} from 'react';

import {DatasetsActions} from './actions';


export type Dataset = {
    name: string;
    description: string;
    id: string;
    documents: string[];
}

export type DatasetsState = {
    datasets: {[key: string]: Dataset};
    loading: boolean;
}

export const initialState: DatasetsState = {
    datasets: {},
    loading: false
}

type DatasetsReducerType = Reducer<DatasetsState, DatasetsActions>;

const DatasetsReducer: DatasetsReducerType = (prevState: DatasetsState, action: DatasetsActions) => {
    switch (action.type) {
        case 'START_FETCH':
            return {
                ...prevState,
                loading: true
            };
        case 'FAIL_FETCH':
            return {
                ...prevState,
                loading: false
            };
        case 'SET_ALL':
            const datasets = action.datasets.reduce<{[key: string]: Dataset}>((current, dataset) => {
                current[dataset.id] = dataset;
                return current;
            }, {});
            return {
                ...prevState,
                datasets: datasets,
                loading: false
            };
        case 'SET_ONE':
            const addedState = {
                ...prevState,
                loading: false
            };
            addedState.datasets[action.dataset.id] = action.dataset;
            return addedState;
        case 'REMOVE_ONE':
            const removedState = {
                ...prevState,
                loading: false
            }
            delete removedState.datasets[action.datasetId];
            return removedState;
    }
    return prevState;
}

export default DatasetsReducer;