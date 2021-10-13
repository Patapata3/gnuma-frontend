import React, {createContext, useCallback, useReducer} from 'react';

import {message} from 'antd';

import {
    createDocument,
    deleteDocument,
    getAllDocuments,
    getSingleDocument,
    updateDocument
} from '../../service/documentService';

import {defaultErrorMessage} from '../../util/presentation';

import DocumentsReducer, {Document, DocumentsState, initialState} from '../../state/documents/reducer';

type DocumentsContextType = {
    state: DocumentsState;
    onFetchAll: () => void;
    onFetchOne: (documentId: string) => void;
    onCreate: (document: Partial<Document>) => void;
    onDelete: (documentId: string) => void;
    onUpdate: (document: Document) => void;
}

const missingProviderError = (name: string) => {
    return () => {
        console.error(`Context callback "${name}" not available, did you forget to wrap ` +
            'your top level view into a DocumentsContextProvider?');
    }
}

export const DocumentsContext = createContext<DocumentsContextType>({
    state: initialState,
    onFetchAll: missingProviderError('onFetchAll'),
    onFetchOne: missingProviderError('onFetchOne'),
    onCreate: missingProviderError('onCreate'),
    onDelete: missingProviderError('onDelete'),
    onUpdate: missingProviderError('onUpdate')
});

type DocumentsContextProviderProps = {
    children: React.ReactChildren | React.ReactNode;
}

const DocumentsContextProvider = (props: DocumentsContextProviderProps) => {
    const [documents, reducer] = useReducer(DocumentsReducer, initialState);

    const fetchOne = useCallback(async (documentId: string) => {
        try {
            reducer({
                type: 'START_FETCH'
            });
            const data = await getSingleDocument(documentId);
            reducer({
                type: 'SET_ONE',
                document: data
            })
        } catch (e) {
            defaultErrorMessage(e);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const fetchAll = useCallback(async () => {
        try {
            reducer({
                type: 'START_FETCH'
            });
            const data = await getAllDocuments();
            reducer({
                type: 'SET_ALL',
                documents: data
            });
        } catch (e) {
            defaultErrorMessage(e);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const deleteSingleDocument = useCallback(async (documentId: string) => {
        const messageKey = `delete-${documentId}`;
        try {
            reducer({
                type: 'START_FETCH'
            });
            message.loading({content: 'Deleting document...', key: messageKey});
            await deleteDocument(documentId);
            reducer({
                type: 'REMOVE_ONE',
                documentId: documentId
            });
            message.success({content: 'Document deleted.', key: messageKey});
        } catch (e) {
            defaultErrorMessage(e, messageKey);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const createNewDocument = useCallback(async (document: Partial<Document>) => {
        const messageKey = `create-document`;
        try {
            message.loading({content: 'Creating new document...', key: messageKey});
            const newDocument = await createDocument(document);
            reducer({
                type: 'SET_ONE',
                document: newDocument
            });
            message.success({content: 'Document created.', key: messageKey});
        } catch (e) {
            defaultErrorMessage(e, messageKey);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const updateSingleDocument = useCallback(async (document: Document) => {
        const messageKey = `update-${document.id}`;
        try {
            message.loading({content: 'Updating document...', key: messageKey});
            const newDocument = await updateDocument(document);
            reducer({
                type: 'SET_ONE',
                document: newDocument
            });
            message.success({content: 'Document successfully updated.', key: messageKey});
        } catch (e) {
            defaultErrorMessage(e, messageKey);
            reducer({
                type: 'FAIL_FETCH'
            });
        }
    }, []);

    const context: DocumentsContextType = {
        state: documents,
        onFetchAll: fetchAll,
        onFetchOne: fetchOne,
        onCreate: createNewDocument,
        onDelete: deleteSingleDocument,
        onUpdate: updateSingleDocument
    };

    return (
        <DocumentsContext.Provider value={context}>
            {props.children}
        </DocumentsContext.Provider>
    );
}

export default DocumentsContextProvider;