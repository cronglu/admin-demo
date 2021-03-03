import React, { PureComponent } from 'react';
import { Button } from 'antd';

export default class extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      second: 0,
      status: false,
    };
  }

  start = async () => {
    const { onClickSending } = this.props;
    const res = await onClickSending();

    if (res) {
      this.setState({
        status: true,
        second: 60,
      });
      this.timer = setInterval(() => this.tick(), 1000);
    }
  };

  tick = () => {
    const second = this.state.second - 1;
    if (!second) {
      clearInterval(this.timer);
    }
    this.setState({
      second,
    });
  };

  render() {
    const { second, status } = this.state;
    return (
      <Button disabled={second} onClick={this.start}>
        {second ? `${second}s` : status ? '重新发送' : '点击获取验证码'}
      </Button>
    );
  }
}
