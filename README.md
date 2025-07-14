# InTrack

A modern room and user management web application built with SolidJS, Vite, and TypeScript. InTrack allows users to create, join, edit, and leave rooms, manage room ownership, and customize user settings. Designed for collaborative environments such as study groups, co-working spaces, or online communities.

---

## Features

- Room creation, editing, joining, and leaving
- Room ownership management
- User authentication (login, register, reset password)
- Dashboard and landing page
- User settings customization
- Responsive and modern UI

## Folder Structure

```
├── public/              # Static assets
├── src/                 # Source code
│   ├── App.tsx
│   ├── Dashboard.tsx
│   ├── FillingStation.tsx
│   ├── JoinRoom.tsx
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Navbar.tsx
│   ├── Register.tsx
│   ├── ResetPasswordEmail.tsx
│   ├── ResetPasswordNew.tsx
│   ├── Room*.tsx        # Room-related features
│   ├── Rooms.tsx
│   ├── UserSettings.tsx
│   └── assets/
├── package.json         # Project metadata and scripts
├── vite.config.ts       # Vite configuration
└── README.md            # Project documentation
```

---

## Usage

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

Learn more about deploying your application with the [documentations](https://vite.dev/guide/static-deploy.html)

## This project was created with the [Solid CLI](https://github.com/solidjs-community/solid-cli)

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
