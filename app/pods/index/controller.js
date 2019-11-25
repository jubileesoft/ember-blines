import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class IndexController extends Controller {
  @service hotzenplotz;

  @tracked selectedStop;
  @tracked stopEvents;

  @action
  selectedStopChanged(stop) {
    this.selectedStop = stop;
    this.getStopEvents();
  }

  // #region Methods

  async getStopEvents() {
    let stopName = this.selectedStop.id !== -1 ? this.selectedStop.name : null;
    this.stopEvents = await this.hotzenplotz.getStopEvents(
      'Babenhausen',
      stopName
    );
    console.log(this.stopEvents);
  }

  // #endregion Methods
}
