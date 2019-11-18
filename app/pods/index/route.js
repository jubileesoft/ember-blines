import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // #region Services

  @service
  hotzenplotz;

  // #endregion Services

  // #region Hooks

  async model() {
    try {
      const dbLocations = await this.hotzenplotz.findAll('locations');

      const dbBabenhausen = dbLocations.find(
        dbLocation => dbLocation.name.toLowerCase() === 'babenhausen'
      );

      const dbStops = await this.hotzenplotz.findAll('stops');

      let dbBabenhausenStops = dbStops
        .filter(dbStop => dbStop.location_id === dbBabenhausen.id)
        .sort((dbStopA, dbStopB) => {
          return dbStopA.name > dbStopB.name;
        });

      dbBabenhausenStops.unshift({
        id: -1,
        name: 'Alle Haltestellen'
      });

      return dbBabenhausenStops;
    } catch (error) {
      return null;
    }
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    this.controllerFor('index').set('selectedStop', model[0]);
  }

  // #endregion Hooks
}
