import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import styles from './index.less';

export default class Image extends PureComponent {
  state = {
    previewVisible: false,
  };

  handleModal = () => {
    const { previewVisible } = this.state;
    this.setState({
      previewVisible: !previewVisible,
    });
  };

  render() {
    const { src, style = {}, className = '', ...rest } = this.props;
    const styleProps = {
      // backgroundImage: `url(${src})`,
      ...style,
    };
    return (
      <>
        <div
          className={`${styles.container} ${className}`}
          style={styleProps}
          {...rest}
          onClick={this.handleModal}
        >
          <img width='100%' height='100%' alt='查看' src={src} />
        </div>
        <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleModal}>
          <img alt="example" style={{ width: '100%' }} src={src} />
        </Modal>
      </>
    );
  }
}
