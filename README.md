# Immersive 3D Portfolio Gallery

A high-quality interactive 3D portfolio built with React, Next.js, React Three Fiber, and Rapier physics. Explore a beautiful, modern gallery room in first-person, interact with exhibits, and enjoy realistic physics with movable furniture.

## Features
- Immersive first-person navigation (WASD + mouse)
- Realistic movement physics, jumping, and collision
- Dynamic, physics-enabled tables and chairs (pushable)
- 3D models for art, furniture, and decor
- Responsive UI overlays and map
- Easy to extend with your own 3D models

## Tech Stack
- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [@react-three/drei](https://docs.pmnd.rs/drei/introduction)
- [@react-three/rapier](https://pmndrs.github.io/react-three-rapier/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Howler.js](https://howlerjs.com/) (for sound)

## Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/DivyanshuX9/3D-Station
cd portfolio-gallery
```

### 2. Install dependencies
```sh
npm install
```

### 3. Run the development server
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Adding 3D Models
- Place your `.glb` or `.gltf` files in `public/models/`.
- To add new furniture or art, import and use them in the scene (see `Furniture.tsx` for examples).

## Physics-Enabled Furniture
- Tables and chairs are loaded from a model pack and wrapped in Rapier physics bodies.
- You can push them around by walking into them.
- To add more, duplicate the relevant code in `Furniture.tsx` and adjust positions.

## Customization
- Edit `GalleryRoom.tsx` and `Furniture.tsx` to change layout, add new objects, or tweak physics.
- UI and controls can be customized in `Gallery.tsx` and related components.

## License
This project is for personal use.

---

