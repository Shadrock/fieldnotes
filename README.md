# Fieldnotes
![]()
A map tool to easily corwdsource notes from the field.

## Features
- Customize and deploy the entire tool for a reporting project within minutes
- Customizable basemap style and data using [Mapbox](https://www.mapbox.com)
- Mobile friendly interface
- Customizable reporting forms

## Usage
**Configure a new instance**
- Create a new [Mapbox dataset](https://www.mapbox.com/studio/datasets/)
- Update the [username](https://github.com/osmlab/fieldnotes/blob/master/index.js#L3) and [datasetId](https://github.com/osmlab/fieldnotes/blob/master/index.js#L2) from the Mapbox dataset url
- Create and update the [Mapbox dataset accessToken](https://github.com/osmlab/fieldnotes/blob/master/index.js#L4).
- Set the initial [map coordinates](https://github.com/osmlab/fieldnotes/blob/master/index.js#L14).

## Develop
You will need node installed.
- Clone the repo and `cd`
- `npm install && npm start`
