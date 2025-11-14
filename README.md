> **Omniclip 2.0 is in development!** <br>
> We're actively working on the next version of Omniclip to elevate it to the next level.<br>
Want to help shape it? Join the discussion on our [Discord](https://discord.gg/Nr8t9s5wSM).
<br>
<br>
<br>


<p align="center"><img width="300" src="./assets/icon2.png"/></p>
<p align="center"><a href="https://opensource.org/license/mit"><img src="https://img.shields.io/badge/license-MIT-blue.svg"/></a></a></p>
<p align="center">Open source video editing web application</p>


## How to
## Contributing
Contributing is vital part of this project, so feel free to help and build this awesome video editor together, simply choose the issue you feel like working on and if you are done make a pull request.
to ease communiaction, its best to join my discord server: https://discord.gg/Nr8t9s5wSM
#### Development:
To start contirbuting you need to do those steps first:
1. Clone the repository: `git clone git@github.com:omni-media/omniclip.git` or fork it
2. Install the dependencies: `npm install`
3. Build the project: `npm run build`
4. Start developing!: `npm start`
5. To disable the cache, run: `npm run start -c-1` 

#### Project architecture
This project leverages the following key components for managing application state:
  1. State
  2. Actions
  3. Controllers
  4. Components/Views

The architecture follows a unidirectional data flow model, where data flows in a single direction from actions to state and from state to components.

#### Tech Stack
- Typescript
- @benev/slate
