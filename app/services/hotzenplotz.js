import Service from '@ember/service';
import { Store } from '@jubileesoft/hotzenplotz';

export default class HotzenplotzService extends Service {
  backendUrl = 'https://affectionate-albattani-ce1c46.netlify.com/';
  data = {};
  hotzenplotz = null;

  init() {
    super.init(...arguments);
    this.hotzenplotz = new Store({
      backendUrl: this.backendUrl,
      debug: true
    });
  }

  // #region Public Methods

  async findAll(collection) {
    return this.hotzenplotz.collection(collection);
  }

  // #endregion Public Methods
}
