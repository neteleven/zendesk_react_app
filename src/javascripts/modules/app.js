import React, { useState } from 'react';
import { render } from 'react-dom';
import { ThemeProvider, DEFAULT_THEME } from '@zendeskgarden/react-theming';
import { Grid, Row, Col } from '@zendeskgarden/react-grid';
import { Field, Label, Input } from '@zendeskgarden/react-forms';
import { Datepicker } from '@zendeskgarden/react-datepickers';
import { Dropdown, Menu, Item, Trigger } from '@zendeskgarden/react-dropdowns'; // Verwendung der korrekten Dropdown-Komponente
import I18n from '../../javascripts/lib/i18n';
import { resizeContainer, escapeSpecialChars as escape } from '../../javascripts/lib/helpers';

const MAX_HEIGHT = 2000;
const API_ENDPOINTS = {
  organizations: '/api/v2/organizations.json'
};

function OrganizationsMenu({ organizations }) {
  const [selectedItem, setSelectedItem] = useState(organizations[0]);

  return (
    <Dropdown selectedItem={selectedItem} onSelect={item => setSelectedItem(item)} downshiftProps={{ itemToString: item => item && item.name }}>
      <Trigger>
        <Field>
          <Input readOnly value={selectedItem && selectedItem.name} />
        </Field>
      </Trigger>
      <Menu>
        {organizations.map(organization => (
          <Item key={organization.id} value={organization}>
            {organization.name}
          </Item>
        ))}
      </Menu>
    </Dropdown>
  );
}

class App {
  constructor (client, _appData) {
    this._client = client;
    this.initializePromise = this.init();
  }

  async init () {
    const currentUser = (await this._client.get('currentUser')).currentUser;
    I18n.loadTranslations(currentUser.locale);

    const organizationsResponse = await this._client.request(API_ENDPOINTS.organizations)
      .catch(this._handleError.bind(this));

    const organizations = organizationsResponse ? organizationsResponse.organizations : [];
    
    // Container für die Anwendung finden und darauf rendern
    const appContainer = document.querySelector('.main');

    render(
      <ThemeProvider theme={{ ...DEFAULT_THEME }}>
        <Field>
          <Label>Datepicker</Label>
          <Datepicker value={new Date()} onChange={selectedDate => console.log(selectedDate)}>
            <Input />
          </Datepicker>
        </Field>
        <Grid>
          <Row>
            <Col data-test-id='sample-app-description'>
              Hi {escape(currentUser.name)}, this is an app for displaying and selecting relevant organisations:
            </Col>
          </Row>
          <Row>
            <Col>
              <OrganizationsMenu organizations={organizations} />
            </Col>
          </Row>
        </Grid>
      </ThemeProvider>,
      appContainer
    );

    return resizeContainer(this._client, MAX_HEIGHT);
  }

  _handleError (error) {
    console.log('An error is handled here: ', error.message);
  }
}

export default App;
