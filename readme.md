# Dato

:construction: WIP

Easily backup and share your data with `dato`

## Install

`clone the repo && npm i`

## Usage

`npm start`

This will start the electron app.

## Development

Dato is an electron app using the hyper stack (corestore, corestore-networking and hyperdrive-promise).

Storage: Dato is using `~/geut-dato` folder to store the hyperdrive.

### short term roadmap :checkered_flag:

- [ ] complete hyperdrive rehydration: re-download data from super peer if `~/geut-dato` was removed.
- [ ] drag and drop hyper keys
- [ ] share `hyper` links per file. Dato should be able to manager hyper urls like: `hyper://key/path/to/my/file.txt` and download only that file.
- [ ] improve style management. Add some library like classnames but for tailwindcss. Since the app will be class based around styling. We need a good string manipulation module here.
- [ ] add friends page/view.
