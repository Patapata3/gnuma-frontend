import React, {useContext, useEffect, useState} from 'react';
import {Classifier, HyperParameter} from "../../state/classifiers/reducer";
import {Select} from "antd";

export type HyperParameterFormProps = {
    onFieldChange: (address: string, hyperParameterValues: Map<string, string>, isValid: boolean) => void;
    classifier: Classifier;
}

export default function HyperParameterForm (props: HyperParameterFormProps) {
    const[values, setValues] = useState(new Map(props.classifier.hyperParameters.map(param => [param.key, ''] as [string, string])))

    const renderFields = (hyperParams: HyperParameter[]) => {
    }

    const handleChange = (key: string, newValue: string | number) => {
        values.set(key, typeof newValue === "string" ? newValue : String(newValue))
    }

    const renderSelect = (param: HyperParameter, options: string[], defaultValue: string) => {
        const key = param.key;
        return (
            <Select
                value={values.get(key)}
                onChange={(newValue: string) => handleChange(key, newValue)}
                style={{ width: '100%' }}
            >
                {param.valueList.map(value => (
                    <Select.Option key={value} value={value}>{value}</Select.Option>
                ))}
            </Select>
        )
    }

    return (<div>smth</div>);
}
