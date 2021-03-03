import React, { PureComponent } from 'react';
import BraftEditor, { EditorState } from 'braft-editor';
import { Form, FormCore, FormItem, DialogForm, Input } from 'antd-noform';
import { ContentUtils } from 'braft-utils';
import { message } from 'antd';
import 'braft-editor/dist/index.css';
import styles from './index.less';

function replaceEditor(match) {
  return ` style="font-size:16px" ${match}`;
}

export default class Editor extends PureComponent {
  static defaultProps = {
    status: 'edit',
    value: '',
    disabled: false,
    height: 320,
    onChange: () => {
      // console.log('urls');
    },
  };

  state = {
    editorState: EditorState.createFrom(''),
  };

  colors = ['#1A79AD', ...BraftEditor.defaultProps.colors];

  extendControls = [
    'separator',
    {
      key: 'phonetic', // 控件唯一标识，必传
      type: 'button',
      title: '注音', // 指定鼠标悬停提示文案
      className: 'my-phonetic', // 指定按钮的样式名
      html: null, // 指定在按钮中渲染的html字符串
      text: '注音', // 指定按钮文字，此处可传入jsx，若已指定html，则text不会显示
      onClick: () => {
        const selectContent = JSON.parse(this.state.editorState.getSelection().toString().replace(/^\w*\s*\{/, '{'));
        const text = this.state.editorState.toHTML().replace(/<[^>]+>/g, "");
        const word = selectContent.anchorOffset > selectContent.focusOffset ? text.slice(selectContent.focusOffset, selectContent.anchorOffset) : text.slice(selectContent.anchorOffset, selectContent.focusOffset);
        const form = new FormCore({
          validateConfig: {
            phonetic: [{ required: true, message: '请输入文字注音' }],
          },
        });
        if (selectContent.focusOffset - selectContent.anchorOffset <= 1) {
          form.setValues({
            word,
          })
          const onOk = (values, hide) => {
            this.setState({
              editorState: ContentUtils.insertHTML(this.state.editorState, `<span><ruby>${word}<rp>(‘</rp><rt>${values.phonetic}</rt><rp>’)</rp></ruby></span>`),
            })
            hide();
          }
          DialogForm.show({
            title: `注音`,
            width: 600,
            onOk,
            content: (
              <Form
                core={form}
                layout={{ label: 4, control: 20 }}
              >
                <FormItem name='word' label='注音文字' layout={{ label: 4 }}>
                  <Input disabled />
                </FormItem>
                <FormItem label="注音" name="phonetic" required>
                  <Input placeholder='请输入注音' />
                </FormItem>
              </Form>
            ),
          });
        } else {
          message.error('请逐字注音！');
        }
      },
    },
  ]

  componentWillReceiveProps(nextProps) {
    if (this.state.editorState.toHTML() !== nextProps.value) {
      this.setState({
        editorState: EditorState.createFrom(nextProps.value),
      });
    }
  }

  onUpload = param => {
    const serverURL = 'https://file.szaiaitie.com/Api/Upload/UploadListPic';
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const successFn = () => {
      const text = xhr.responseText || xhr.response;
      if (text) {
        const { code, msg, ImgUrl } = JSON.parse(text);
        if (code === 1) {
          param.success({
            url: ImgUrl,
            meta: {
              id: param.libraryId,
              // title: '',
              // alt: '',
              // loop: true, // 指定音视频是否循环播放
              // autoPlay: true, // 指定音视频是否自动播放
              // controls: true, // 指定音视频是否显示控制栏
              // poster: 'http://xxx/xx.png', // 指定视频播放器的封面
            },
          });
        } else {
          message.error(msg);
        }
      }
    };

    const progressFn = event => {
      param.progress((event.loaded / event.total) * 100);
    };

    const errorFn = () => {
      param.error({
        msg: '上传出错',
      });
      message.error('上传出错');
    };

    formData.append('folderName', 'yunshangPic');
    formData.append('time', '1526712575167');
    formData.append('cipher', '338D36C27ECF4FBE302F2B2C42A6F1BF1213');
    formData.append('file', param.file);

    xhr.upload.addEventListener('progress', progressFn, false);
    xhr.addEventListener('load', successFn, false);
    xhr.addEventListener('error', errorFn, false);
    xhr.addEventListener('abort', errorFn, false);
    xhr.open('POST', serverURL, true);
    xhr.send(formData);
  };

  onChange = editorState => {
    // const html = `<div style="font-size:16px;">${editorState.toHTML()}</div>`;
    const html = editorState.toHTML();
    // html = html.replace(/(?<=^<p).*(?=<\/p>$)/, replaceEditor)

    this.setState(
      {
        editorState,
      },
      () => {
        this.props.onChange(html);
      }
    );
  };

  render() {
    const { status, disabled, value, height } = this.props;

    return status === 'preview' ? (
      // eslint-disable-next-line
      <div dangerouslySetInnerHTML={{ __html: value }} />
    ) : (
        <div className={styles.container}>
          <BraftEditor
            contentClassName={styles.bfContent}
            disabled={disabled}
            colors={this.colors}
            stripPastedStyles
            width={200}
            value={this.state.editorState}
            contentStyle={{ fontSize: 12 }}
            media={{ uploadFn: this.onUpload }}
            onChange={this.onChange}
            extendControls={this.extendControls}
          />
        </div>
      );
  }
}
