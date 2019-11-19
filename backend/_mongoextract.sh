#!/bin/bash
mongoexport --db=blines --collection=schoolfreedays --out=schoolfreedays.json --jsonArray
mongoexport --db=blines --collection=holidays --out=holidays.json --jsonArray
mongoexport --db=blines --collection=lines --out=lines.json --jsonArray
mongoexport --db=blines --collection=locations --out=locations.json --jsonArray
mongoexport --db=blines --collection=stopevents --out=stopevents.json --jsonArray
mongoexport --db=blines --collection=stops --out=stops.json --jsonArray
mongoexport --db=blines --collection=system --out=system.json --jsonArray
