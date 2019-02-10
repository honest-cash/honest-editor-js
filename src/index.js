/* eslint-disable class-methods-use-this */
import Vue from 'vue';
import 'babel-polyfill';
import 'indexeddbshim/dist/indexeddbshim';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import './extensions';
import './services/optional';
import './icons';
import App from './components/App';
import store from './store';
import localDbSvc from './services/localDbSvc';
import Provider from './services/providers/common/Provider';
import workspaceSvc from './services/workspaceSvc';

if (!indexedDB) {
  throw new Error('Your browser is not supported. Please upgrade to the latest version.');
}

OfflinePluginRuntime.install({
  onUpdateReady: () => {
    // Tells to new SW to take control immediately
    OfflinePluginRuntime.applyUpdate();
  },
  onUpdated: async () => {
    if (!store.state.light) {
      await localDbSvc.sync();
      localStorage.updated = true;
      // Reload the webpage to load into the new version
      window.location.reload();
    }
  },
});

if (localStorage.updated) {
  store.dispatch('notification/info', 'StackEdit has just updated itself!');
  setTimeout(() => localStorage.removeItem('updated'), 2000);
}

if (!localStorage.installPrompted) {
  window.addEventListener('beforeinstallprompt', async (promptEvent) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    promptEvent.preventDefault();

    try {
      await store.dispatch('notification/confirm', 'Add Honest Editor to your home screen?');
      promptEvent.prompt();
      await promptEvent.userChoice;
    } catch (err) {
      // Cancel
    }
    localStorage.installPrompted = true;
  });
}

Vue.config.productionTip = false;

class HonestEditor {
  constructor(domId) {
    this.changeListeners = [];
    this.isSaving = false;
    this.currentContent = '';
    /* eslint-disable no-new */
    new Vue({
      el: `#${domId}`,
      store,
      render: h => h(App),
    });

    // eslint-disable-next-line prefer-destructuring
    this.editor = document.getElementsByClassName('editor')[0];

    store.subscribe((/** mutation, state */) => {
      if (this.editor) {
        this.currentContent = this.editor.innerText;
      }

      if (this.isSaving) {
        return;
      }

      this.isSaving = setTimeout(() => {
        if (this.editor) {
          this.changeListeners.forEach(fn => fn(this.editor.innerText));

          delete this.isSaving;
        }
      }, 1000);
    });
  }

  subscribe(fn) {
    this.changeListeners.push(fn);
  }

  getContent() {
    return this.this.currentContent;
  }

  _getStore() {
    return store;
  }

  // eslint-disable-next-line class-methods-use-this
  async setContent(markdown) {
    const item = await workspaceSvc.createFile({
      ...Provider.parseContent(markdown),
    });

    store.commit('file/setCurrentId', item.id);
  }
}

window.HonestEditor = HonestEditor;

export default HonestEditor;
