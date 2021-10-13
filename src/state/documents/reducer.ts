import {Reducer} from 'react';

import {DocumentsActions} from './actions';


export type Document = {
    domain: string;
    source: string;
    text: string;
    id: string;
    uri: string;
}

export type DocumentsState = {
    documents: { [key: string]: Document };
    loading: boolean;
}

export const initialState: DocumentsState = {
    documents: {},
    loading: false
}

type DocumentReducerType = Reducer<DocumentsState, DocumentsActions>;

const DocumentsReducer: DocumentReducerType = (prevState: DocumentsState, action: DocumentsActions) => {
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
            const documents = action.documents.reduce<{ [key: string]: Document }>((current, document) => {
                current[document.id] = document;
                return current;
            }, {});
            return {
                ...prevState,
                documents: documents,
                loading: false
            };
        case 'SET_ONE':
            const addedState = {
                ...prevState,
                loading: false
            };
            addedState.documents[action.document.id] = action.document;
            return addedState;
        case 'REMOVE_ONE':
            const removedState = {
                ...prevState,
                loading: false
            }
            delete removedState.documents[action.documentId];
            return removedState;
    }
    return prevState;
}

export default DocumentsReducer;