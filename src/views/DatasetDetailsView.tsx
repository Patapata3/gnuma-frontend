import React, {useContext, useEffect, useState} from 'react';

import {useHistory, useParams} from 'react-router-dom';

import {Button, Card, Input, Modal, PageHeader, Popconfirm, Skeleton, Space, Table, Typography} from 'antd';
import {DeleteOutlined, EditOutlined, FileAddOutlined, SaveOutlined} from '@ant-design/icons';

import DocumentsList from '../components/DocumentList/DocumentsList';
import {DatasetsContext} from '../components/DatasetsContextProvider/DatasetsContextProvider';


export default function DatasetDetailsView() {
    const [showingDocumentList, setShowingDocumentList] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

    const [editingDescription, setEditingDescription] = useState(false);
    const [description, setDescription] = useState<string>();

    const {id} = useParams<{ id: string }>();
    const history = useHistory();
    const context = useContext(DatasetsContext);

    useEffect(() => {
        context.onFetchOne(id);
    }, [id]);

    const dataset = context.state.elements[id];

    useEffect(() => {
        setDescription(dataset?.description);
    }, [dataset]);

    const renderTitle = () => {
        if (!dataset) {
            return (<Skeleton active title={{width: 200}} paragraph={false}/>);
        }
        return dataset.name;
    }

    const renderDocumentList = () => {
        const documents: { id: string }[] = dataset?.documents.map(d => {
            return {id: d};
        });

        return (
            <Table
                rowKey={d => d.id}
                dataSource={documents}
                columns={[
                    {
                        title: 'Document Id',
                        dataIndex: 'id'
                    },
                    {
                        title: 'Actions',
                        dataIndex: 'id',
                        align: 'right',
                        render: (documentId: string) => {
                            return (
                                <Popconfirm
                                    key={documentId}
                                    title={'Are you sure you want to delete this document?'}
                                    onConfirm={() => context.onRemoveDocuments(dataset, documentId)}
                                    okText='Yes'
                                    cancelText='No'
                                >
                                    <Button
                                        icon={<DeleteOutlined/>}
                                        type={'text'}
                                        danger
                                    />
                                </Popconfirm>
                            );
                        }
                    }
                ]}
            />
        );
    }

    const renderDescription = () => {
        if (editingDescription) {
            return (
                <>
                    <Input.TextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button
                        icon={<SaveOutlined/>}
                        onClick={() => {
                            if(!description) {
                                return;
                            }
                            context.onUpdate(dataset.id, {
                                description: description
                            });
                            setEditingDescription(false);
                        }}
                    >
                        Save
                    </Button>
                </>
            );
        }

        return (
            <Typography.Paragraph>
                {dataset?.description}
            </Typography.Paragraph>
        );
    }

    return (
        <div key={'dataset-details-view'}>
            <Modal
                visible={showingDocumentList}
                onCancel={() => {
                    setSelectedDocuments([]);
                    setShowingDocumentList(false);
                }}
                onOk={() => {
                    context.onAddDocuments(dataset, ...selectedDocuments);
                    setSelectedDocuments([]);
                    setShowingDocumentList(false);
                }}
            >
                <DocumentsList
                    showSelection
                    onSelectionChanged={setSelectedDocuments}
                    selected={selectedDocuments}
                />
            </Modal>

            <PageHeader
                onBack={() => history.push('/datasets')}
                title={renderTitle()}
            />

            <Space
                direction='vertical'
                style={{width: '100%'}}
            >
                <Card
                    title={'About this dataset'}
                    extra={
                        <Button
                            icon={<EditOutlined/>}
                            type={'text'}
                            onClick={() => setEditingDescription(true)}
                        />
                    }
                >
                    {renderDescription()}
                </Card>

                <Card
                    title={'Documents in this dataset'}
                    extra={
                        <Button
                            icon={<FileAddOutlined/>}
                            type={'ghost'}
                            onClick={() => setShowingDocumentList(true)}
                        >
                            Add more documents
                        </Button>
                    }
                >
                    {
                        renderDocumentList()
                    }
                </Card>
            </Space>
        </div>
    );
}