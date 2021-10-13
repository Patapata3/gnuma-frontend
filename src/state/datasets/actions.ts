import {Dataset} from './reducer';
import {FailFetchAction, StartFetchAction} from '../common/actions';

export type DatasetsActions =
    StartFetchAction
    | SetDatasetsAction
    | AddDatasetAction
    | RemoveDatasetAction
    | FailFetchAction;

export interface SetDatasetsAction {
    type: 'SET_ALL';
    datasets: Dataset[];
}

export interface AddDatasetAction {
    type: 'SET_ONE';
    dataset: Dataset;
}

export interface RemoveDatasetAction {
    type: 'REMOVE_ONE';
    datasetId: string;
}
