import React, {createContext, useCallback, useReducer} from 'react';

import {message} from 'antd';

import DatasetsReducer, {Dataset, initialState} from '../../state/datasets/reducer';
import {
    addDocumentsToDataset,
    createDataset,
    deleteDataset,
    getAllDatasets,
    getDataset,
    removeDocumentsFromDataset,
    updateDataset
} from '../../service/datasetService';
import {defaultErrorMessage} from '../../util/presentation';
import {GenericPayloadState} from '../../state/common/reducer';


type DatasetsContextType = {
    state: GenericPayloadState<Dataset>;
    onFetchAll: () => void;
    onFetchOne: (datasetId: string) => void;
    onCreate: (dataset: Partial<Dataset>) => void;
    onDelete: (datasetId: string) => void;
    onUpdate: (datasetId: string, changes: Partial<Dataset>) => void;
    onAddDocuments: (dataset: Dataset, ...documentIds: string[]) => void;
    onRemoveDocuments: (dataset: Dataset, ...documentIds: string[]) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a DatasetContextProvider?');
    }
}

export const DatasetsContext = createContext<DatasetsContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne'),
    onCreate: missingProviderError('onCreate'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate'),
    onAddDocuments: missingProviderError('onAddDocuments'),
    onRemoveDocuments: missingProviderError('onRemoveDocuments')
});

type DatasetsContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const DatasetsContextProvider = (props: DatasetsContextProviderProps) => {
    const [datasets, reducer] = useReducer(DatasetsReducer, initialState);

    const fetchOne = useCallback(async (datasetId: string) => {
        try {
            reducer({
                type: 'START_FETCH'
            });
            const data = await getDataset(datasetId);
            reducer({
                type: 'SET_ONE',
                payload: data
            })
        } catch (e) {
            defaultErrorMessage(e);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const fetchDatasets = useCallback(async () => {
        try {
            reducer({
                type: 'START_FETCH'
            });
            const data = await getAllDatasets();
            reducer({
                type: 'SET_ALL',
                payload: data
            });
        } catch (e) {
            defaultErrorMessage(e);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const deleteSingleDataset = useCallback(async (datasetId: string) => {
        const messageKey = `delete-${datasetId}`;
        try {
            reducer({
                type: 'START_FETCH'
            });
            message.loading({content: 'Deleting dataset...', key: messageKey});
            await deleteDataset(datasetId);
            reducer({
                type: 'REMOVE_ONE',
                id: datasetId
            });
            message.success({content: 'Dataset deleted.', key: messageKey});
        } catch (e) {
            defaultErrorMessage(e, messageKey);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const createNewDataset = useCallback(async (dataset: Partial<Dataset>) => {
        const messageKey = `create-${dataset.id}`;
        try {
            message.loading({content: 'Creating new dataset...', key: messageKey});
            const newDataset = await createDataset(dataset);
            reducer({
                type: 'SET_ONE',
                payload: newDataset
            });
            message.success({content: 'Dataset created.', key: messageKey});
        } catch (e) {
            defaultErrorMessage(e, messageKey);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const removeDocuments = useCallback(async (dataset: Dataset, ...documentIds: string[]) => {
        const messageKey = `update-${documentIds}`;
        try {
            const updatedDataset = await removeDocumentsFromDataset(dataset, ...documentIds);
            reducer({
                type: 'SET_ONE',
                payload: updatedDataset
            });
            message.success({content: 'Successfully patched dataset.', key: messageKey});
        } catch (e) {
            reducer({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }, []);

    const addDocuments = useCallback(async (dataset: Dataset, ...addedDocuments: string[]) => {
        const messageKey = `add-documents-to-${dataset.id}`;
        try {
            message.loading({content: 'Updating dataset...', key: messageKey});
            const updatedDataset = await addDocumentsToDataset(dataset, ...addedDocuments);
            message.success({
                content: `Successfully updated dataset with ${addedDocuments.length} documents!`,
                key: messageKey
            });
            reducer({
                type: 'SET_ONE',
                payload: updatedDataset
            });
        } catch (e) {
            reducer({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }, []);

    const updateSingleDataset = useCallback(async (id: string, changes: Partial<Dataset>) => {
        const messageKey = `update-${id}`;
        try {
            message.loading({content: 'Updating dataset...', key: messageKey});
            const updatedDataset = await updateDataset(id, changes);
            message.success({
                content: `Successfully updated dataset!`,
                key: messageKey
            });
            reducer({
                type: 'SET_ONE',
                payload: updatedDataset
            });
        } catch (e) {
            reducer({
                type: 'FAIL_FETCH'
            });
            defaultErrorMessage(e, messageKey);
        }
    }, []);

    const context: DatasetsContextType = {
        state: datasets,
        onFetchAll: fetchDatasets,
        onFetchOne: fetchOne,
        onCreate: createNewDataset,
        onDelete: deleteSingleDataset,
        onUpdate: updateSingleDataset,
        onRemoveDocuments: removeDocuments,
        onAddDocuments: addDocuments
    };

    return (
        <DatasetsContext.Provider value={context}>
            {props.children}
        </DatasetsContext.Provider>
    );
}

export default DatasetsContextProvider;