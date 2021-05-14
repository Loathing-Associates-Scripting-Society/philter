import {Tab, Tabs} from '@blueprintjs/core';
import React, {useState} from 'react';
import './App.css';
import {PanelCategorizedItems} from './components/PanelCategorizedItems';
import {PanelConfig} from './components/PanelConfig';
import {PanelInformation} from './components/PanelInformation';
import {PanelUncategorizedItems} from './components/PanelUncategorizedItems';
import {typeCheck} from './util';

const MainTabs = Object.freeze({
  categorized: 0,
  config: 0,
  information: 0,
  uncategorized: 0,
});
type MainTabType = keyof typeof MainTabs;
const DEFAULT_TAB = 'information';

/**
 * Ensures that the given tab ID is a valid tab ID.
 * @param tabId Tab ID to check
 * @return Returns the original value of `tabId` if it is a valid tab ID.
 *    Otherwise, returns an appropriate default tab ID as fallback.
 */
const ensureValidTabType = (tabId: number | string): MainTabType =>
  MainTabs.hasOwnProperty(tabId) ? (tabId as MainTabType) : DEFAULT_TAB;

export const App = () => {
  const [tabId, setTabId] = useState<MainTabType>(DEFAULT_TAB);

  return (
    <div className="App">
      <Tabs
        className="App__Tabs"
        id="mainTabs"
        onChange={tabId => setTabId(ensureValidTabType(tabId))}
        renderActiveTabPanelOnly
        selectedTabId={ensureValidTabType(tabId)}
      >
        <Tab
          id={typeCheck<MainTabType>('information')}
          panel={<PanelInformation />}
          panelClassName="App__TabItem"
          title="Information"
        />
        <Tab
          id={typeCheck<MainTabType>('uncategorized')}
          panel={<PanelUncategorizedItems />}
          panelClassName="App__TabItem"
          title="Add Items"
        />
        <Tab
          id={typeCheck<MainTabType>('categorized')}
          panel={<PanelCategorizedItems />}
          panelClassName="App__TabItem"
          title="Edit Rules"
        />
        <Tab
          id={typeCheck<MainTabType>('config')}
          panel={<PanelConfig />}
          panelClassName="App__TabItem"
          title="Configuration"
        />
      </Tabs>
    </div>
  );
};
