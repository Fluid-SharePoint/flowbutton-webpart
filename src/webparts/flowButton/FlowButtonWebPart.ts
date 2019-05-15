import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';

import * as strings from 'FlowButtonWebPartStrings';
import FlowButton from './components/FlowButton';
import { IFlowButtonProps } from './components/FlowButton';
import { Web } from "@pnp/sp";

export interface IFlowButtonWebPartProps {
  buttontext: string;
  iconname: string;
  flowurl: string;
  secure: boolean;
  securelistname: string;
}

export default class FlowButtonWebPart extends BaseClientSideWebPart<IFlowButtonWebPartProps> { 
  public render(): void {
    const element: React.ReactElement<IFlowButtonProps > = React.createElement(
      FlowButton,
      {
        buttontext: this.properties.buttontext,
        iconname: this.properties.iconname,
        flowurl: this.properties.flowurl,
        context: this.context,
        isSecure: this.properties.secure,
        secureListName: this.properties.securelistname,
        web: new Web(this.context.pageContext.web.absoluteUrl)
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('buttontext', {
                  label: strings.ButtonTextLabel
                }),
                PropertyPaneTextField('iconname', {
                  label: strings.IconNameLabel,
                  description: strings.IconNameDescription
                }),
                PropertyPaneTextField('flowurl', {
                  label: strings.FlowUrlLabel,
                  description: strings.FlowUrlDescription
                }),
                PropertyPaneToggle('secure', {
                  label: strings.SecureLabel,
                  onText: "Enabled",
                  offText: "Disabled",
                }),
                PropertyPaneTextField('securelistname', {
                  label: strings.SecureListNameLabel,
                  description: strings.SecureListNameDescription
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
