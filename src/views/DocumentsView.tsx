import React from 'react';

import {Button, Card, Divider, Modal, Table} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import DocumentsList from '../components/DocumentList/DocumentsList';
import {DocumentsContext} from '../components/DocumentsContextProvider/DocumentsContextProvider';
import FileDropTarget from '../components/FileDropTaret/FileDropTarget';


export default function DocumentsView() {
    const context = React.useContext(DocumentsContext);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>([]);

    const cancelUpload = async () => {
        setModalVisible(false);
        setFiles([]);
    }

    const executeUpload = async () => {
        setModalVisible(false);

        const uploadPromises = files.map(async (f) => {
            return context.onCreate({
                tasks: [],
                dataFields: [],
                contributor: '',
                citationInformation: '',
                augmented: false,
                data: f,
                domain: '',
                source: ''
            });
        });

        await Promise.all(uploadPromises);

        setFiles([]);
    }

    return (
        <div key={'documents-view'}>
            <Card
                title={'All Documents'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                        onClick={() => setModalVisible(true)}
                    >
                        New
                    </Button>
                }
            >
                <Modal
                    visible={modalVisible}
                    onOk={executeUpload}
                    onCancel={cancelUpload}
                    okText={'Upload'}
                    title={'Upload files'}
                >
                    <FileDropTarget
                        onFilesDropped={(fs) => setFiles([...files, ...fs])}
                    />
                    <Divider type={'horizontal'}/>
                    <Table
                        dataSource={files}
                        columns={[
                            {title: 'File', dataIndex: 'name'}
                        ]}
                        pagination={{
                            pageSize: 5
                        }}
                    />
                </Modal>
                <DocumentsList showActions={true}/>
            </Card>
        </div>
    );
}