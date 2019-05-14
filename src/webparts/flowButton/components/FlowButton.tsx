import * as React from 'react';
import styles from './FlowButton.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import {
  HttpClient,
  IHttpClientOptions,
  HttpClientResponse
} from '@microsoft/sp-http';


export interface IFlowButtonProps {
  buttontext?: string;
  iconname?: string;
  flowurl?: string;
  context: any;
}

export interface IFlowButtonStates {
  buttontext: string;
  iconname: string;
  flowurl: string;
}

export default class FlowButton extends React.Component<IFlowButtonProps, {}> {
  public render(): React.ReactElement<IFlowButtonProps> {
    return (
      <div className={ styles.flowButton }>
        <div className={ styles.container }>
        <Icon iconName={escape(this.props.iconname)} />
        <PrimaryButton text={escape(this.props.buttontext)} onClick={this._buttonClicked = this._buttonClicked.bind(this)} />
        </div>
      </div>
    );
  }

  private _buttonClicked(): void {
    this._sendHttpRequest();
  }

  private _sendHttpRequest(): Promise<Response> {
    const getUrl = this.props.flowurl;

    const body: string = JSON.stringify({
      "Key": "test",
      "ID": 1
    });

    const httpClientOptions: IHttpClientOptions = {
      body: body,
      headers: new Headers({
        'Content-type': 'application/json'
      }),
    };

    return this.props.context.httpClient.post(
      getUrl,
      HttpClient.configurations.v1,
      httpClientOptions)
      .then((response: HttpClientResponse) => {console.log(response.status); } );
  }
}
