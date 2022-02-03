import React, {useContext, useEffect, useState} from 'react';

import {Link} from 'react-router-dom';
import {Button, Card, Form, List, Modal, Popconfirm, Select, Spin, Table, Tag} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';

import {Experiment, ExperimentClassifier} from "../state/experiments/reducer";
import HyperParameterForm from "../components/HyperParameterForm/HyperParameterForm";

import {ExperimentsContext} from "../components/ExperimentsContextProvider/ExperimentsContexProvider";
import {ClassifiersContext} from "../components/ClassifiersContextProvider/ClassifiersContextProvider";
import {Classifier} from "../state/classifiers/reducer";

export default function ExperimentsView() {
    const experimentContext = useContext(ExperimentsContext);
    const classifierContext = useContext(ClassifiersContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedClassifiers, setSelectedClassifiers] = useState([] as Array<string>);

    useEffect(() => {
        experimentContext.onFetchAll()
    }, []);

    const handleCancel = () => {
        setModalVisible(false);
    }

    const onStartButtonClick = () => {
        classifierContext.onFetchAll();
        setModalVisible(true);
    }

    const colorMap = new Map<string, string>([
        ["FINISH", "#87d068"],
        ["PAUSE", "#2db7f5"],
        ["TRAIN", "#108ee9"],
        ["EVAL", "#108ee9"],
        ["STOP", "#C70039"],
        ["ERROR", "#C70039"]
    ])

    const DEFAULT_COLOR = "#108ee9"

    const renderExperimentActions = (experiment: Experiment) => {
        return (
            <>
                <Link to={`/experiments/${experiment.id}`}>
                    <Button
                        type={'text'}
                        icon={<EditOutlined/>}
                    />
                </Link>
                <Popconfirm
                    title={"Delete experiment?"}
                    onConfirm={() => experimentContext.onDelete(experiment.id)}
                >
                    <Button
                        type={'text'}
                        danger
                        icon={<DeleteOutlined/>}
                    />
                </Popconfirm>
            </>
        )
    }

    const experiments = Object.values(experimentContext.state.elements);
    const classifiers = Object.values(classifierContext.state.elements);
    const classifierMap = new Map(classifiers.map(classifier => [`${classifier.id} at ${classifier.address}`, classifier] as [string, Classifier]));

    const chooseTagColor = (status: string) => {
        return colorMap.has(status) ? colorMap.get(status) : DEFAULT_COLOR;
    }

    const renderClassifierList = (record: Experiment) => {
        return (
            <>
                <List
                    size="small"
                    dataSource={record.classifiers ? record.classifiers : [] as ExperimentClassifier[]}
                    renderItem={item => (
                        <List.Item>
                            <Tag color={chooseTagColor(item.status)}>
                                {item.status}
                            </Tag>{`${item.remoteId} at ${item.address}`}
                        </List.Item>
                    )}
                >
                </List>
            </>
        )

    }

    const handleSelectChange = (selectedClassifiers: string[]) => {

        setSelectedClassifiers(selectedClassifiers);
    }

    return (
        <div key={'experiments-view'}>
            <Card
                title={'Experiments'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                        onClick={onStartButtonClick}
                    >
                        Start
                    </Button>
                }
            >
                <Modal title="Start an experiment"
                       visible={modalVisible}
                       onCancel={handleCancel}
                       centered
                       width='50%'
                       footer={[
                           <Button key="back" onClick={handleCancel}>
                               Cancel
                           </Button>,
                           <Button key="start" type={'primary'} loading={modalLoading}>
                               Start
                           </Button>
                       ]}
                >
                    <Spin spinning={classifierContext.state.loading}>
                        <Form
                            labelCol={{span: 6}}
                            wrapperCol={{span: 16}}
                            layout="horizontal"
                        >
                            <Form.Item label="Classifiers">
                                <Select mode={'multiple'}
                                        placeholder={'Pick a classifier'}
                                        value={selectedClassifiers}
                                        style={{width: '100%'}}
                                        onChange={handleSelectChange}
                                >
                                    {classifiers.map(classifier => (
                                        <Select.Option key={classifier.address} value={`${classifier.id} at ${classifier.address}`}>{classifier.id}</Select.Option>
                                    ))
                                    }
                                </Select>
                            </Form.Item>

                        </Form>
                    </Spin>
                </Modal>
                <Table
                    loading={experimentContext.state.loading}
                    dataSource={experiments}
                    columns={[
                        {
                            title: 'Date',
                            dataIndex: 'date',
                            render: (_, record) => <Link to={`/experiments/${record.id}`}>{new Date(record.date).toLocaleString()}</Link>
                        },
                        {
                            title: 'Classifiers',
                            dataIndex: 'classifiers',
                            render: (_, record) => renderClassifierList(record)
                        },
                        {
                            title: '',
                            dataIndex: '',
                            align: 'right',
                            render: (_, record) => renderExperimentActions(record)
                        }
                    ]}
                >
                </Table>
            </Card>
        </div>
    )
}
