import React, { PureComponent } from "react";
import { message } from "antd";
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default class CustomerCopyToClipboard extends PureComponent {

  render() {
    const onCopyCallBack = () => message.success('复制成功')
    const { text = '', onCopy = onCopyCallBack, buttonText = '复制' } = this.props;

    return (
      <CopyToClipboard
        text={text}
        onCopy={onCopy}
      >
        <a>{buttonText}</a>
      </CopyToClipboard>
    )
  }
}