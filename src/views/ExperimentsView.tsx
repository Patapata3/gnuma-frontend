import React, {useContext, useEffect} from 'react';

import {Link} from 'react-router-dom';
import {Button, Card, List, Popconfirm, Table, Tag} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';

import {Experiment, ExperimentClassifier} from "../state/experiments/reducer";

import {ExperimentsContext} from "../components/ExperimentsContextProvider/ExperimentsContexProvider";

export default function ExperimentsView() {
    const context = useContext(ExperimentsContext);

    useEffect(() => {
        context.onFetchAll()
    }, []);

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
                    onConfirm={() => context.onDelete(experiment.id)}
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

    const experiments = Object.values(context.state.elements);

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

    return (
        <div key={'experiments-view'}>
            <Card
                title={'Experiments'}
                extra={
                    <Button
                        type={'primary'}
                        icon={<PlusOutlined/>}
                    >
                        Start
                    </Button>
                }
            >
                <Table
                    loading={context.state.loading}
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
