import React, {useContext, useEffect, useState} from 'react';

import {Link, useHistory, useParams} from 'react-router-dom';

import {Button, Form, Input, PageHeader} from 'antd';

import {Document} from '../state/documents/reducer';
import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';


export default function DocumentDetailsView() {
    const {id} = useParams<{ id: string }>();
    const history = useHistory();
    const context = useContext(DocumentsContext);
    const document = context.state.elements[id];

    const [changedDocument, setChangedDocument] = useState<Document>();

    useEffect(() => {
        context.onFetchOne(id);
    }, [id]);

    useEffect(() => {
        // create a copy of the viewed document to mutate it
        // without dirtying global state
        setChangedDocument({...document});
    }, [document]);

    const documentChangedHandler = (changes: Partial<Document>) => {
        setChangedDocument({
            ...changedDocument,
            ...changes
        } as Document);
    }

    const onDocumentSavedHandler = async () => {
        if (!changedDocument) {
            return;
        }
        context.onUpdate(changedDocument.id, changedDocument);
    }

    const render = () => {
        return (
            <Form
                labelCol={{xs: {span: 8}, sm: {span: 4, offset: 4}}}
                wrapperCol={{xs: {span: 12}, sm: {span: 8}}}
            >
                <Form.Item
                    label={'Domain'}
                >
                    <Input
                        disabled={context.state.loading}
                        value={changedDocument?.domain}
                        onChange={(e) => {
                            documentChangedHandler({domain: e.target.value})
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label={'Source'}
                >
                    <Input
                        disabled={context.state.loading}
                        value={changedDocument?.source}
                        onChange={(e) => {
                            documentChangedHandler({source: e.target.value})
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label={'Text'}
                >
                    <Input.TextArea
                        disabled={context.state.loading}
                        value={changedDocument?.text}
                        onChange={(e) => {
                            documentChangedHandler({text: e.target.value})
                        }}
                    />
                </Form.Item>

                <Form.Item
                    wrapperCol={{offset: 8, span: 8}}
                >
                    <Button
                        disabled={context.state.loading}
                        onClick={onDocumentSavedHandler}
                        type={'primary'}
                    >
                        Save
                    </Button>
                    <Button
                        disabled={context.state.loading}
                        style={{margin: '0 8px'}}
                    >
                        <Link
                            to={'/documents'}
                        >
                            Cancel
                        </Link>
                    </Button>
                </Form.Item>
            </Form>
        );
    }

    return (
        <div key={`document-details-view`}>
            <PageHeader
                onBack={() => history.push('/documents')}
                title={'Document Details'}
            />
            {render()}
        </div>
    );
}