import React, { PureComponent } from 'react';
import { Icon } from 'antd'

const template = {
    'status': { icon: ['close-circle', 'check-circle'], color: ['#ff2121', '#48DD22'] },
    'lock': { icon: ['unlock', 'lock'], color: ['#48DD22', '#ff2121'] },
};

const OK = 1;
const UNOK = 2;

export default class StatusView extends PureComponent {

    render() {
        const { status = 2 } = this.props;
        let { iconType = 'status' } = this.props;

        if (template[iconType] === undefined) {
            iconType = 'status';
        }

        if (status === UNOK) {  // 上架或者解锁
            return (<Icon type={template[iconType].icon[0]} theme="twoTone" twoToneColor={template[iconType].color[0]} />);  // 下架或者关闭
        } else if (status === OK) {
            return (<Icon type={template[iconType].icon[1]} theme="twoTone" twoToneColor={template[iconType].color[1]} />); // 上架
        } else {
            //
            return <></>
        }
    }
}