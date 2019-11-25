const WEEKDAYS = {
  SUNDAY: 'sunday',
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday'
};

export class Blines {
  // #region Fields

  _data = {};

  // #endregion Fields

  // #region Constructor

  constructor() {}

  // #endregion Constructor

  // #region Public Methods

  setCollection(collection, array) {
    this._data[collection] = array;
  }

  getStopEvents(start, end, location, stop) {
    // start and end are POJOs like { day: '2019-12-11', time: '06:43' }
    // location {string} - like 'Babenhausen'
    // optional: stop {string} - like 'Busbahnhof'

    // Make sure that all relevant collections are available
    let error = [];
    if (!this._data['locations']) {
      error.push('No locations available.');
    }

    if (!this._data['stops']) {
      error.push('No stops available.');
    }

    if (!this._data['stopevents']) {
      error.push('No stopevents available.');
    }

    if (!this._data['schoolfreedays']) {
      error.push('No schoolfreedays available.');
    }

    if (!this._data['holidays']) {
      error.push('No holidays available.');
    }

    if (error.length > 0) {
      throw Error(error.join(' '));
    }

    let days = this._getDays(start.day, end.day);

    let isOneDayAnalysis = start.day === end.day;

    let stopEvents = [];
    for (let i = 0; i < days.length; i++) {
      let startTime = isOneDayAnalysis ? start.time : null;
      let endTime = isOneDayAnalysis || i == days.length - 1 ? end.time : null;

      let sEvents = this._getStopEvents(
        days[i],
        startTime,
        endTime,
        location,
        stop
      );

      if (!Array.isArray(sEvents)) {
        continue;
      }

      sEvents.forEach(sEvent => stopEvents.push(sEvent));
    }

    return stopEvents;
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   *
   * @param {string} day - like '2019-12-21'
   * @param {string} startTime - like '06:34'. NULL means 'from day start on'
   * @param {string} endTime - like '08:34'. NULL means 'until the end of the day'
   * @param {string} location - like 'Babenhausen'
   * @param {string} stop - like 'Busbahnhof' (optional)
   */
  _getStopEvents(day, startTime, endTime, locationName, stopName) {
    let weekday = this._getWeekDay(day); // like 'tuesday'
    let weekdayNot = weekday + 'Not'; // like 'tuesdayNot'

    let location = this._data['locations'].find(location => {
      return location.name.toLowerCase() === locationName.toLowerCase();
    });

    if (!location) {
      return null;
    }

    let stops = [];
    if (stopName) {
      stops.push(
        this._data['stops'].find(stop => {
          return stop.name.toLowerCase() === stopName.toLowerCase();
        })
      );
    } else {
      stops = this._data['stops'].filter(stop => {
        return stop.location_id == location.id;
      });
    }

    if (stops.length === 0) {
      return null;
    }

    // Loop through all stopEvents
    let stopEvents = this._data['stopevents'].filter(stopEvent => {
      // #region CHECK stop

      if (stops.map(x => x.id).indexOf(stopEvent.stop_id) === -1) {
        return false;
      }

      // #endregion CHECK stop

      // #region CHECK weekday

      if (stopEvent[weekday] !== true && !Array.isArray(stopEvent[weekday])) {
        return false;
      }

      // stopEvent[weekday] is now either true or an array of (string) days
      if (
        Array.isArray(stopEvent[weekday]) &&
        stopEvent[weekday].indexOf(day) === -1
      ) {
        // The provided day is not included
        return false;
      }

      // #endregion CHECK weekday

      // #region CHECK weekdayNot

      if (
        Array.isArray(stopEvent[weekdayNot]) &&
        stopEvent[weekdayNot].indexOf(day) !== -1
      ) {
        return false;
      }

      // #endregion CHECK weekdayNot

      // #region CHECK startTime

      if (
        startTime &&
        this._calculateDayMinutes(startTime) >
          this._calculateDayMinutes(stopEvent.time)
      ) {
        return false;
      }

      // #endregion CHECK startTime

      // #region CHECK endTime

      if (
        endTime &&
        this._calculateDayMinutes(endTime) <
          this._calculateDayMinutes(stopEvent.time)
      ) {
        return false;
      }

      // #endregion CHECK endTime

      // #region CHECK onlySchoolDays

      if (stopEvent.onlySchoolDays === true) {
        if (weekday === WEEKDAYS.SATURDAY || weekday === WEEKDAYS.SUNDAY) {
          return false;
        }

        if (this._data['schoolfreedays'].map(x => x.date).indexOf(day) !== -1) {
          return false;
        }
      }

      // #endregion CHECK onlySchoolDays

      // #region CHECK onlySchoolFreeDays

      if (stopEvent.onlySchoolFreeDays === true) {
        if (weekday === WEEKDAYS.SATURDAY || weekday === WEEKDAYS.SUNDAY) {
          return false;
        }

        if (this._data['schoolfreedays'].map(x => x.date).indexOf(day) === -1) {
          return false;
        }
      }

      // #endregion CHECK onlySchoolFreeDays

      return true;
    });

    return stopEvents;
  }

  /**
   * This method returns
   * @argument {string} startDay like '2019-12-11'
   * @argument {string} endDay like '2019-12-24'
   */
  _getDays(startDay, endDay) {
    try {
      let days = [];
      let dt = new Date(startDay);
      let endDate = new Date(endDay);

      while (dt <= endDate) {
        days.push(dt.toISOString().split('T')[0]);
        dt.setDate(dt.getDate() + 1);
      }
      return days;
    } catch (error) {
      return null;
    }
  }

  /**
   * @param {string} day - like '2019-11-21'
   */
  _getWeekDay(day) {
    let weekday = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ];

    return weekday[new Date(day).getDay()];
  }

  /**
   * @param {string} day - like '05:34'
   */
  _calculateDayMinutes(day) {
    try {
      let parts = day.split(':');

      let hours = Number.parseInt(parts[0]);
      let minutes = Number.parseInt(parts[1]);

      return hours * 60 + minutes;
    } catch (error) {
      return null;
    }
  }

  // #endregion Private Methods
}
