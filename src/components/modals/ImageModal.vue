<template>
  <modal-inner aria-label="Insert image">
    <div class="modal__content">
      <p>Please provide a <b>URL</b> for your image.</p>
      <form-entry label="URL" error="url">
        <input slot="field" class="textfield" type="text" v-model.trim="url" @keydown.enter="resolve()">
      </form-entry>
      <template v-if="shouldShowUpload">
        <p>or upload an image</p>
        <input id="image-upload" type="file" name="files[]" accept="image/*" @change="uploadImage($event.target.files);">
      </template>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="reject()">Cancel</button>
      <button class="button button--resolve" @click="resolve()">Ok</button>
    </div>
  </modal-inner>
</template>

<script>
import modalTemplate from './common/modalTemplate';
import MenuEntry from '../menus/common/MenuEntry';
import googleHelper from '../../services/providers/helpers/googleHelper';
import store from '../../store';

export default modalTemplate({
  components: {
    MenuEntry,
  },
  data: () => ({
    url: '',
    editorOptions: JSON.parse(localStorage.getItem('HC_EDITOR_OPTIONS')),
  }),
  computed: {
    shouldShowUpload() {
      if (this.editorOptions) {
        if (!this.editorOptions.upload.image.url) {
          console.log('Please specify the URL in Editor Options');
          return false;
        }
        if (!this.editorOptions.upload.image.tokenKey) {
          console.log('Please specify the tokenKey in Editor Options');
          return false;
        }
        if (!this.editorOptions.upload.image.token) {
          console.log('Please specify the token in Editor Options');
          return false;
        }
        return true;
      }
      return false;
    },
    googlePhotosTokens() {
      const googleTokensBySub = store.getters['data/googleTokensBySub'];
      return Object.values(googleTokensBySub)
        .filter(token => token.isPhotos)
        .sort((token1, token2) => token1.name.localeCompare(token2.name));
    },
  },
  methods: {
    resolve() {
      if (!this.url) {
        this.setError('url');
      } else {
        const { callback } = this.config;
        this.config.resolve();
        callback(this.url);
      }
    },
    reject() {
      const { callback } = this.config;
      this.config.reject();
      callback(null);
    },
    async uploadImage() {
      if (this.editorOptions) {
        if (!this.editorOptions.upload.image.url) {
          return console.log('Please specify the URL in Editor Options');
        }
        if (!this.editorOptions.upload.image.tokenKey) {
          return console.log('Please specify the tokenKey in Editor Options');
        }
        if (!this.editorOptions.upload.image.token) {
          return console.log('Please specify the token in Editor Options');
        }

        const formData = new FormData();
        const inputField = document.getElementById('image-upload');
        formData.append('files[]', inputField.files[0]);

        fetch(this.editorOptions.upload.image.url, {
          method: 'POST',
          body: formData,
          headers: {
            [this.editorOptions.upload.image.tokenKey]: this.editorOptions.upload.image.token,
          },
        })
          .then(response => response.json())
          .then((response) => {
            if (response.files.length) {
              const { callback } = this.config;
              this.config.resolve();
              return callback(response.files[0].url);
            }
            return this.reject();
          })
          .catch((error) => {
            console.log('Image Upload Error', error);
            this.reject();
          });
      }
      return console.log('Please specify Editor Options to use the upload method');
    },
    addGooglePhotosAccount() {
      return googleHelper.addPhotosAccount();
    },
    async openGooglePhotos(token) {
      const { callback } = this.config;
      this.config.reject();
      const res = await googleHelper.openPicker(token, 'img');
      if (res[0]) {
        store.dispatch('modal/open', {
          type: 'googlePhoto',
          url: res[0].url,
          callback,
        });
      }
    },
  },
});
</script>
