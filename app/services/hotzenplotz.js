import Service from '@ember/service';
import { Store } from '@jubileesoft/hotzenplotz';
import { Blines } from 'ember-blines/utils/blines';

export default class HotzenplotzService extends Service {
  backendUrl = 'https://busapi.inbabenhausen.de';
  data = {};
  store = null;
  blines = null;

  init() {
    super.init(...arguments);
    this.store = new Store({
      backendUrl: this.backendUrl,
      debug: true
    });
  }

  // #region Public Methods

  async findAll(collection) {
    return this.store.collection(collection);
  }

  async getStopEvents(locationName, stopName) {
    if (!this.blines) {
      this.blines = new Blines();

      let locations = await this.store.collection('locations');
      this.blines.setCollection('locations', locations);

      let stops = await this.store.collection('stops');
      this.blines.setCollection('stops', stops);

      let stopEvents = await this.store.collection('stopevents');
      this.blines.setCollection('stopevents', stopEvents);

      let schoolfreedays = await this.store.collection('schoolfreedays');
      this.blines.setCollection('schoolfreedays', schoolfreedays);

      let holidays = await this.store.collection('holidays');
      this.blines.setCollection('holidays', holidays);
    }

    let start = {
      day: '2019-11-25',
      time: '05:25'
    };

    let stop = {
      day: '2019-11-25',
      time: '06:23'
    };

    return this.blines.getStopEvents(start, stop, locationName, stopName);
  }

  // #endregion Public Methods
}
