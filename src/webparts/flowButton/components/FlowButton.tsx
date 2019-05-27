import * as React from 'react';
import styles from './FlowButton.module.scss';
import { escape } from '@microsoft/sp-lodash-subset';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { Guid } from '@microsoft/sp-core-library';
import {
  HttpClient,
  IHttpClientOptions,
  HttpClientResponse
} from '@microsoft/sp-http';
import { ItemAddResult, ListAddResult, Web, ListEnsureResult } from "@pnp/sp";
import { CurrentUser } from '@pnp/sp/src/siteusers';
import { string } from 'prop-types';

// Custom Interfaces
export interface ISecureItem {
  Id: number;
  Title: string;
}

export interface ISecureBody {
  Key: string;
  Id: number;
  Source: string;
  UserPrinciple: string;
  Secure: boolean;
  SecureListName: string;
}

// Props and States
export interface IFlowButtonProps {
  web: Web;
  disabled?: boolean;
  buttontext?: string;
  iconname?: string;
  flowurl?: string;
  context: any;
  isSecure: boolean;
  secureListName: string;
  style: string;
}

export interface IFlowButtonStates {
  buttontext: string;
  iconname: string;
  flowurl: string;
  disabled: boolean;
  isSecure: boolean;
}

// Start component
export default class FlowButton extends React.Component<IFlowButtonProps, IFlowButtonStates> {
  public constructor(props) {
    super(props);
    this.state = {
      buttontext: this.props.buttontext,
      iconname: this.props.iconname,
      flowurl: this.props.flowurl,
      disabled: false,
      isSecure: this.props.isSecure
    };
  }

  public componentDidUpdate(prevProps) {
    if (this.props.isSecure !== prevProps.isSecure) {
      this._checkSecureListExists();
    }
  }
 
  public render(): React.ReactElement<IFlowButtonProps> {
    return (
      <div className={styles[this.props.style].container}>
        <div className={styles.container}>
          <Icon iconName={escape(this.props.iconname)} />
          <PrimaryButton text={escape(this.props.buttontext)} onClick={this._buttonClicked = this._buttonClicked.bind(this)} disabled={this.state.disabled} />
        </div>
      </div>
    );
  }

  private _buttonClicked(): void {
    // create variable for request to be send secure or not, false by default will be changed if properties toggle is active
    if (this.props.isSecure) {
      // Create new request key and ID in the SPList and pass to post request
      const key: Guid = Guid.newGuid();
      this._addSPListItem(key.toString()).then((item: ISecureItem) => {
            this._sendHttpRequest(true, item);
        }); 
    } else {
      this._sendHttpRequest(false);
    }
  }

  private _checkSecureListExists(): Promise<boolean> {
    this.setState({disabled: true });
    return this.props.web.lists.ensure(this.props.secureListName)
    .then((ler: ListEnsureResult) => {
      if(ler.created) {
        // TODO Change so that if any errors button disabled and error creating list shown
        this.setState({disabled: false });
        console.log("List Created");
        return true;
      } else {
        this.setState({disabled: false });
        return false;
      }
    });
  }

  private _sendHttpRequest(sendSecure: boolean, item?: ISecureItem): Promise<Response> {
    const getUrl = this.props.flowurl;

    const webUrl = this.props.web.toUrl().substring(0, this.props.web.toUrl().length - 8);

    return this.props.web.currentUser.get().then((user: CurrentUser) => {
      const secureBody: ISecureBody = {
        Key: item.Title,
        Id: item.Id,
        Source: webUrl,
        UserPrinciple: user['Email'],
        Secure: sendSecure,
        SecureListName: this.props.secureListName
      };
  
      const body: string = JSON.stringify(secureBody);
  
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
        .then((response: HttpClientResponse) => { console.log(response.status); });
    });
  }

  private _createList(): Promise<boolean> {
    return this.props.web.lists.add(this.props.secureListName, "", 100, false)
    .then((lar: ListAddResult) => {
      console.log(lar.list);
      return true;
    }).catch((e) => {
      return false;
    });
  }

  private _addSPListItem(guid: string): Promise<ISecureItem> {
    const itemDefinition: ISecureItem = {
      Id: 0,
      Title: guid
    };

    return this.props.web.lists.getByTitle(this.props.secureListName).items.add(itemDefinition)
      .then((iar: ItemAddResult) => {
        console.log(iar.data);
        return {Title: iar.data.Title, Id: iar.data.Id } as ISecureItem; 
      });
  }

  private _getSPListItemById(Id: number): Promise<ISecureItem> {
    return this.props.web.lists.getByTitle(this.props.secureListName).items.getById(Id).get()
      .then((item: any) => {
        console.log(item);
        return item as ISecureItem;
      });
  }

  private _getSPListItemByTitle(title: string): Promise<ISecureItem> {
    return this.props.web.lists.getByTitle(this.props.secureListName).items.select("Id,Title").filter("Title eq '"+title+"'").get()
    .then((items: any[]) => {
      return items[0] as ISecureItem;
    });
  }
}
